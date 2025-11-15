"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { usePlots } from "@/features/plots/api/get-all-plots";
import { usePolygonTasks } from "@/features/supervisor/api/get-polygon-task";
import { useCompletePolygonTask } from "@/features/supervisor/api/get-polygon-complete";
import type { PlotDTO } from "@/features/plots/api/get-all-plots";
import type { PolygonTask } from "@/types/polygon-task";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, ChevronDown, Map, MapPin, User, Satellite, Search, Filter, Clock, AlertTriangle, CheckCircle, Save, X } from "lucide-react";

import mapboxgl from "mapbox-gl";
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import "mapbox-gl/dist/mapbox-gl.css";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

type Zone = {
    id: string;
    name: string;
    center: [number, number];
    color: string;
};

const ZONES: Zone[] = [
    { id: "zone1", name: "Ho Chi Minh City", center: [106.6297, 10.8231], color: "#FFB366" },
    { id: "zone2", name: "Hanoi", center: [105.8542, 21.0285], color: "#E74C3C" },
    { id: "zone3", name: "Da Nang", center: [108.2022, 16.0544], color: "#3498DB" },
];

const convertWKTToGeoJSON = (wkt: string): any | null => {
    try {
        const cleanWkt = wkt.trim().replace(/\s+/g, ' ');

        if (cleanWkt.startsWith('POLYGON')) {
            const coordinatesMatch = cleanWkt.match(/POLYGON\s*\(\s*\(([^)]+)\)\s*\)/);
            if (!coordinatesMatch) return null;

            const coordString = coordinatesMatch[1];
            const pairs = coordString.split(',').map(pair => {
                const [lng, lat] = pair.trim().split(/\s+/).map(Number);
                if (isNaN(lng) || isNaN(lat) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                    console.warn('Invalid coordinates:', lng, lat);
                    return null;
                }
                return [lng, lat];
            }).filter(Boolean);

            return {
                type: 'Polygon',
                coordinates: [pairs]
            };
        }

        if (cleanWkt.startsWith('POINT')) {
            const coordinatesMatch = cleanWkt.match(/POINT\s*\(\s*([^)]+)\s*\)/);
            if (!coordinatesMatch) return null;

            const coords = coordinatesMatch[1].trim().split(/\s+/).map(Number);
            const [first, second] = coords;

            let lng, lat;
            if (Math.abs(first) > 90) {
                lng = first;
                lat = second;
            } else {
                lat = first;
                lng = second;
            }

            if (isNaN(lng) || isNaN(lat) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                console.warn('Invalid coordinates:', lng, lat);
                return null;
            }

            return {
                type: 'Point',
                coordinates: [lng, lat]
            };
        }

        return null;
    } catch (error) {
        console.error('Error converting WKT to GeoJSON:', error);
        return null;
    }
};

const getCoordinatesFromGeoJSON = (geoJsonString: string): [number, number] | null => {
    try {
        let parsed: any;

        if (geoJsonString.startsWith('POLYGON') || geoJsonString.startsWith('POINT')) {
            parsed = convertWKTToGeoJSON(geoJsonString);
        } else {
            parsed = JSON.parse(geoJsonString);
        }

        if (!parsed) return null;

        if (parsed.type === 'Point' && parsed.coordinates) {
            const [lng, lat] = parsed.coordinates;
            if (typeof lng === 'number' && typeof lat === 'number') {
                return [lng, lat];
            }
        }

        if (parsed.type === 'Polygon' && parsed.coordinates && parsed.coordinates[0]) {
            const coords = parsed.coordinates[0];
            if (coords.length > 0) {
                const [lng, lat] = coords[0];
                if (typeof lng === 'number' && typeof lat === 'number') {
                    return [lng, lat];
                }
            }
        }

        return null;
    } catch {
        return null;
    }
};

const getPriorityText = (priority: number | string | undefined): string => {
    if (typeof priority === 'string') return priority;
    if (typeof priority === 'number') {
        switch (priority) {
            case 1: return 'High';
            case 2: return 'Medium';
            case 3: return 'Low';
            default: return 'Unknown';
        }
    }
    return 'Unknown';
};

const getPriorityLevel = (priority: number | string | undefined): 'High' | 'Medium' | 'Low' | 'Unknown' => {
    if (typeof priority === 'string') {
        return priority as 'High' | 'Medium' | 'Low' | 'Unknown';
    }
    if (typeof priority === 'number') {
        switch (priority) {
            case 1: return 'High';
            case 2: return 'Medium';
            case 3: return 'Low';
            default: return 'Unknown';
        }
    }
    return 'Unknown';
};

const SupervisorMap = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const draw = useRef<MapboxDraw | null>(null);
    const popupRef = useRef<mapboxgl.Popup | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    const [isClient, setIsClient] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [markersAdded, setMarkersAdded] = useState(false);
    const [selectedZone, setSelectedZone] = useState<Zone>(ZONES[0]);
    const [showZoneSelector, setShowZoneSelector] = useState(false);
    const [selectedTask, setSelectedTask] = useState<PolygonTask | null>(null);
    const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
    const [focusedTask, setFocusedTask] = useState<PolygonTask | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawnPolygon, setDrawnPolygon] = useState<any>(null);
    const [polygonArea, setPolygonArea] = useState<number>(0);
    const [taskNotes, setTaskNotes] = useState("");
    const [mapType, setMapType] = useState<"vector" | "satellite">("satellite");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    const { data: plotsData, isLoading: plotsLoading, refetch: refetchPlots } = usePlots({
        params: { pageNumber: 1, pageSize: 500 },
    });

    const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = usePolygonTasks({
        filters: { status: 'Pending' }
    });

    const completeTaskMutation = useCompletePolygonTask({
        mutationConfig: {
            onSuccess: async () => {
                // Reset drawing state
                setSelectedTask(null);
                setIsDrawing(false);
                setDrawnPolygon(null);
                setPolygonArea(0);
                setTaskNotes("");
                if (draw.current) {
                    draw.current.deleteAll();
                }

                // FIXED: Refetch data và rebuild map
                await Promise.all([refetchPlots(), refetchTasks()]);

                // Clear và rebuild markers
                clearMarkers();
                setMarkersAdded(false);
            },
        }
    });

    const plots: PlotDTO[] = plotsData?.data || [];
    const tasks: PolygonTask[] = tasksData || [];

    useEffect(() => {
        setIsClient(true);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([longitude, latitude]);
                    console.log("📍 User location:", latitude, longitude);
                },
                (error) => {
                    console.warn("❌ Could not get user location:", error.message);
                    setUserLocation([106.6297, 10.8231]);
                },
                {
                    timeout: 3000,
                    maximumAge: 0,
                    enableHighAccuracy: false
                }
            );
        } else {
            setUserLocation([106.6297, 10.8231]);
        }
    }, []);

    const filteredTasks = useMemo(() => {
        let result = tasks;

        if (statusFilter !== "all") {
            result = result.filter((task) => task.status === statusFilter);
        }

        return result;
    }, [tasks, searchTerm, statusFilter]);

    const getMapCenter = (): [number, number] => {
        if (userLocation) {
            return userLocation;
        }
        return selectedZone.center;
    };

    const mapCenter = getMapCenter();

    const clearMarkers = () => {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Clear all plot boundary layers
        if (map.current) {
            const layers = map.current.getStyle()?.layers;
            if (layers) {
                layers.forEach((layer) => {
                    if (layer.id.startsWith('plot-boundary-')) {
                        map.current!.removeLayer(layer.id);
                    }
                });
            }

            const sources = Object.keys(map.current.getStyle()?.sources || {});
            sources.forEach((source) => {
                if (source.startsWith('plot-boundary-')) {
                    map.current!.removeSource(source);
                }
            });
        }
    };

    useEffect(() => {
        if (!isClient || !MAPBOX_TOKEN || !mapContainer.current || plotsLoading || tasksLoading || !userLocation) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        const center = userLocation || selectedZone.center;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: mapType === "satellite"
                ? "mapbox://styles/mapbox/satellite-streets-v12"
                : "mapbox://styles/mapbox/streets-v12",
            center: center as [number, number],
            zoom: 10,
            attributionControl: false,
            logoPosition: 'bottom-left',
        });

        map.current.on('load', () => {
            setMapLoaded(true);

            draw.current = new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    polygon: true,
                    trash: true
                },
                defaultMode: 'simple_select'
            });

            map.current!.addControl(draw.current, 'top-left');
            map.current!.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

            map.current!.on('draw.create', updateArea);
            map.current!.on('draw.delete', updateArea);
            map.current!.on('draw.update', updateArea);

            setTimeout(() => {
                if (map.current) {
                    map.current.resize();
                }
            }, 100);
        });

        function updateArea(e: any) {
            const data = draw.current!.getAll();
            if (data.features.length > 0) {
                const area = turf.area(data);
                const roundedArea = Math.round(area * 100) / 100;
                setPolygonArea(roundedArea);
                setDrawnPolygon(data.features[0]);
            } else {
                setPolygonArea(0);
                setDrawnPolygon(null);
            }
        }

        return () => {
            if (map.current) {
                clearMarkers();
                map.current.remove();
                map.current = null;
            }
            setMapLoaded(false);
            setMarkersAdded(false);
        };
    }, [isClient, MAPBOX_TOKEN, plotsLoading, tasksLoading, userLocation]);

    useEffect(() => {
        if (!mapLoaded || !map.current || plots.length === 0 || markersAdded) return;

        addPlotSources();
        setMarkersAdded(true);
    }, [mapLoaded, plots, tasks, markersAdded]);

    useEffect(() => {
        if (!map.current) return;

        const newStyle = mapType === "satellite"
            ? "mapbox://styles/mapbox/satellite-streets-v12"
            : "mapbox://styles/mapbox/streets-v12";

        map.current.setStyle(newStyle);

        map.current.once("style.load", () => {
            clearMarkers();
            setMarkersAdded(false);
        });
    }, [mapType]);

    const addPlotSources = () => {
        if (!map.current || markersAdded) return;

        plots.forEach((plot, index) => {
            const el = document.createElement('div');
            el.className = 'plot-marker';

            const hasTask = tasks.find(t => t.plotId === plot.plotId);
            const taskStatus = hasTask?.status;

            el.style.cssText = `
                width: 14px;
                height: 14px;
                background: ${taskStatus === 'Completed' ? '#10B981' :
                    hasTask ? '#F59E0B' :
                        plot.status === 'Active' ? '#10B981' :
                            plot.status === 'Emergency' ? '#EF4444' : '#6B7280'
                };
                border: 2px solid white;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                transition: box-shadow 0.2s ease, filter 0.2s ease;
                position: relative;
                ${hasTask ? 'animation: pulse 2s infinite;' : ''}
            `;

            el.onmouseenter = () => {
                el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
                el.style.filter = 'brightness(1.2)';
                el.style.zIndex = '1000';
            };
            el.onmouseleave = () => {
                el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                el.style.filter = 'brightness(1)';
                el.style.zIndex = 'auto';
            };

            let coordinates: [number, number];
            if (plot.coordinateGeoJson) {
                const coordsFromGeoJSON = getCoordinatesFromGeoJSON(plot.coordinateGeoJson);
                if (coordsFromGeoJSON) {
                    coordinates = coordsFromGeoJSON;
                } else {
                    console.warn(`Invalid coordinateGeoJson for plot ${plot.plotId}:`, plot.coordinateGeoJson);
                    coordinates = [
                        selectedZone.center[0] + (index * 0.001),
                        selectedZone.center[1] + (index * 0.001)
                    ];
                }
            } else {
                coordinates = [
                    selectedZone.center[0] + (index * 0.001),
                    selectedZone.center[1] + (index * 0.001)
                ];
            }

            const marker = new mapboxgl.Marker(el)
                .setLngLat(coordinates)
                .addTo(map.current!);

            markersRef.current.push(marker);

            el.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();

                const task = tasks.find(t => t.plotId === plot.plotId);
                if (task) {
                    setSelectedTask(task);
                    setFocusedTask(task);
                    startDrawingForTask(task);

                    if (popupRef.current) {
                        popupRef.current.remove();
                    }
                } else {
                    if (popupRef.current) {
                        popupRef.current.remove();
                    }

                    popupRef.current = new mapboxgl.Popup({ offset: 15 })
                        .setLngLat(coordinates)
                        .setHTML(`
                            <div class="p-3 min-w-[200px]">
                                <div class="font-semibold text-lg mb-2">Plot ${plot.soThua}/${plot.soTo}</div>
                                <div class="space-y-1">
                                    <div class="text-sm"><span class="font-medium">Farmer:</span> ${plot.farmerName}</div>
                                    <div class="text-sm"><span class="font-medium">Area:</span> ${plot.area}ha</div>
                                    <div class="text-sm"><span class="font-medium">Variety:</span> ${plot.varietyName}</div>
                                    <div class="text-sm">
                                        <span class="font-medium">Status:</span> 
                                        <span class="px-2 py-1 rounded text-xs ${plot.status === 'Active' ? 'bg-green-100 text-green-800' :
                                plot.status === 'Emergency' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                            }">${plot.status}</span>
                                    </div>
                                    <div class="text-xs text-gray-500 mt-2">No drawing task assigned</div>
                                </div>
                            </div>
                        `)
                        .addTo(map.current!);
                }
            });

            if (plot.boundaryGeoJson) {
                try {
                    let boundaryGeoJSON: any;

                    if (plot.boundaryGeoJson.startsWith('POLYGON')) {
                        boundaryGeoJSON = convertWKTToGeoJSON(plot.boundaryGeoJson);
                    } else {
                        boundaryGeoJSON = JSON.parse(plot.boundaryGeoJson);
                    }

                    if (boundaryGeoJSON) {
                        map.current!.addSource(`plot-boundary-${plot.plotId}`, {
                            type: 'geojson',
                            data: boundaryGeoJSON
                        });

                        map.current!.addLayer({
                            id: `plot-boundary-fill-${plot.plotId}`,
                            type: 'fill',
                            source: `plot-boundary-${plot.plotId}`,
                            paint: {
                                'fill-color': hasTask ? '#F59E0B' : (plot.status === 'Active' ? '#10B981' : '#6B7280'),
                                'fill-opacity': 0.15
                            }
                        });

                        map.current!.addLayer({
                            id: `plot-boundary-line-${plot.plotId}`,
                            type: 'line',
                            source: `plot-boundary-${plot.plotId}`,
                            paint: {
                                'line-color': hasTask ? '#F59E0B' : (plot.status === 'Active' ? '#10B981' : '#6B7280'),
                                'line-width': 2,
                                'line-opacity': 0.8
                            }
                        });

                        map.current!.on('click', `plot-boundary-fill-${plot.plotId}`, (e) => {
                            e.originalEvent.stopPropagation();

                            const task = tasks.find(t => t.plotId === plot.plotId);
                            if (task) {
                                setSelectedTask(task);
                                setFocusedTask(task);
                                startDrawingForTask(task);
                            }
                        });

                        map.current!.on('mouseenter', `plot-boundary-fill-${plot.plotId}`, () => {
                            map.current!.getCanvas().style.cursor = 'pointer';
                        });

                        map.current!.on('mouseleave', `plot-boundary-fill-${plot.plotId}`, () => {
                            map.current!.getCanvas().style.cursor = '';
                        });
                    }
                } catch (error) {
                    console.error(`Failed to add boundary for plot ${plot.plotId}:`, error);
                }
            }
        });
    };

    useEffect(() => {
        if (map.current && selectedZone && mapLoaded) {
            if (markersAdded) {
                map.current.flyTo({
                    center: selectedZone.center,
                    zoom: 10,
                    duration: 1000
                });
            }
        }
    }, [selectedZone, mapLoaded, markersAdded]);

    const startDrawingForTask = (task: PolygonTask) => {
        console.log('Starting drawing for task:', task.id);
        setSelectedTask(task);
        setIsDrawing(true);
        setTaskNotes(`Drawing polygon for plot ${task.soThua}/${task.soTo}`);
        if (draw.current) {
            draw.current.changeMode('draw_polygon');
        }
    };

    const cancelDrawing = () => {
        setSelectedTask(null);
        setIsDrawing(false);
        setDrawnPolygon(null);
        setPolygonArea(0);
        setTaskNotes("");
        if (draw.current) {
            draw.current.deleteAll();
            draw.current.changeMode('simple_select');
        }
    };

    const completeDrawing = () => {
        if (!selectedTask || !drawnPolygon) return;

        const geoJsonString = JSON.stringify(drawnPolygon.geometry);

        completeTaskMutation.mutate({
            taskId: selectedTask.id,
            data: {
                polygonGeoJson: geoJsonString,
                notes: taskNotes || `Polygon drawn with area: ${polygonArea}m²`
            }
        });
    };

    const handleTaskFocus = (task: PolygonTask) => {
        setFocusedTask(task);
        setHoveredTaskId(task.id);

        const plot = plots.find(p => p.plotId === task.plotId);
        if (plot && map.current) {
            let coords: [number, number] | null = null;

            if (plot.coordinateGeoJson) {
                coords = getCoordinatesFromGeoJSON(plot.coordinateGeoJson);
            }

            if (coords && Array.isArray(coords) && coords.length === 2) {
                const [lng, lat] = coords;
                if (!isNaN(lng) && !isNaN(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
                    map.current.flyTo({
                        center: coords,
                        zoom: 15,
                        duration: 1000,
                    });
                }
            }
        }
    };

    if (plotsLoading || tasksLoading || !isClient) {
        return (
            <div className="flex h-screen items-center justify-center bg-neutral-50">
                <div className="text-center">
                    <Spinner size="lg" className="text-emerald-600 mx-auto mb-4" />
                    <p className="text-neutral-600 font-medium">Loading map data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-neutral-50">
            <div className="bg-white border-b border-neutral-200 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
                            <Map className="size-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900">Polygon Drawing Tasks</h1>
                            <p className="text-sm text-neutral-600 mt-1">
                                Draw and complete polygon tasks for plots
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{filteredTasks.length}</p>
                            <p className="text-xs text-neutral-600">tasks available</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-white rounded shadow-lg px-3 py-2 flex items-center gap-2">
                                <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">VN</span>
                                </div>
                                <span className="font-medium">Vietnam</span>
                            </div>

                            <div className="bg-white rounded shadow-lg px-3 py-2 relative">
                                <button
                                    onClick={() => setShowZoneSelector(!showZoneSelector)}
                                    className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                                >
                                    <span className="font-medium">{selectedZone.name}</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {showZoneSelector && (
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-full">
                                        {ZONES.map((zone) => (
                                            <button
                                                key={zone.id}
                                                className="w-full text-left px-3 py-2 hover:bg-gray-50 whitespace-nowrap first:rounded-t last:rounded-b transition-colors"
                                                onClick={() => {
                                                    setSelectedZone(zone);
                                                    setShowZoneSelector(false);
                                                }}
                                            >
                                                {zone.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-neutral-400" />
                                <Input
                                    placeholder="Search tasks..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64 pl-10"
                                />
                            </div>

                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                                <SelectTrigger className="w-40">
                                    <Filter className="size-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                size="icon"
                                variant={mapType === "satellite" ? "default" : "outline"}
                                onClick={() => setMapType(mapType === "vector" ? "satellite" : "vector")}
                            >
                                {mapType === "satellite" ? (
                                    <Layers className="size-4" />
                                ) : (
                                    <Satellite className="size-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 p-6 overflow-hidden">
                <div className="flex-1 rounded-xl border-2 border-neutral-200 overflow-hidden shadow-2xl bg-white relative">
                    <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

                    {/* Compact Drawing Info - Top Right */}
                    {isDrawing && selectedTask && (
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-lg shadow-xl p-4 w-80 z-20">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    <span className="font-semibold text-sm">Drawing: Plot {selectedTask.soThua}/{selectedTask.soTo}</span>
                                </div>
                                <button
                                    onClick={cancelDrawing}
                                    className="p-1 hover:bg-gray-100 rounded"
                                    disabled={completeTaskMutation.isPending}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {drawnPolygon ? (
                                <div className="space-y-2">
                                    <div className="text-sm text-green-600 font-medium">✓ Polygon completed</div>
                                    <div className="text-xs text-gray-600">Area: {polygonArea.toLocaleString()}m²</div>
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            onClick={completeDrawing}
                                            disabled={completeTaskMutation.isPending}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            size="sm"
                                        >
                                            {completeTaskMutation.isPending ? (
                                                'Saving...'
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-1" />
                                                    Save
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={cancelDrawing}
                                            variant="outline"
                                            size="sm"
                                            disabled={completeTaskMutation.isPending}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-orange-600">
                                    Click on the map to draw polygon points
                                </div>
                            )}
                        </div>
                    )}

                    {/* Map Stats Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Total: <span className="font-medium">{tasks.length}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span>Pending: <span className="font-medium">{tasks.filter(t => t.status === 'Pending').length}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Completed: <span className="font-medium">{tasks.filter(t => t.status === 'Completed').length}</span></span>
                                </div>
                            </div>
                            <div className="text-gray-500 text-xs">
                                {!mapLoaded ? 'Loading map...' : `${plots.length} plots loaded`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-80 space-y-4 overflow-y-auto">
                    <Card className="shadow-lg">
                        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-emerald-50">
                            <CardTitle className="text-base flex items-center gap-2">
                                <MapPin className="size-5 text-blue-600" />
                                Drawing Tasks ({filteredTasks.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[500px] overflow-y-auto pt-4">
                            {filteredTasks.length === 0 ? (
                                <p className="text-sm text-neutral-500 text-center py-8">
                                    No drawing tasks available
                                </p>
                            ) : (
                                filteredTasks.map((task) => {
                                    const priorityLevel = getPriorityLevel(task.priority);
                                    const priorityText = getPriorityText(task.priority);

                                    return (
                                        <div
                                            key={task.id}
                                            className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${focusedTask?.id === task.id
                                                ? "border-blue-500 bg-blue-100 shadow-lg scale-[1.02]"
                                                : hoveredTaskId === task.id
                                                    ? "border-blue-400 bg-blue-50 shadow-md"
                                                    : selectedTask?.id === task.id
                                                        ? "border-green-500 bg-green-50"
                                                        : "border-neutral-200 hover:border-blue-300 hover:bg-blue-50/50"
                                                }`}
                                            onMouseEnter={() => setHoveredTaskId(task.id)}
                                            onMouseLeave={() => setHoveredTaskId(null)}
                                            onClick={() => handleTaskFocus(task)}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-blue-600" />
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            Plot {task.soThua}/{task.soTo}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {task.plotId.slice(0, 8)}...
                                                        </div>
                                                    </div>
                                                </div>

                                                {priorityLevel === 'High' && (
                                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                                )}
                                                {task.status === 'Completed' && (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                )}
                                            </div>

                                            <div className="space-y-1 text-xs text-gray-600">
                                                {task.farmerName && (
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        <span>{task.farmerName}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{new Date(task.assignedAt).toLocaleDateString()}</span>
                                                </div>

                                                {task.priority !== undefined && (
                                                    <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${priorityLevel === 'High'
                                                        ? 'bg-red-100 text-red-700'
                                                        : priorityLevel === 'Medium'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : priorityLevel === 'Low'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {priorityText} Priority
                                                    </div>
                                                )}
                                            </div>

                                            {selectedTask?.id === task.id && (
                                                <div className="mt-2 text-xs text-blue-600 font-medium">
                                                    → Drawing in progress...
                                                </div>
                                            )}

                                            {focusedTask?.id === task.id && !selectedTask && (
                                                <div className="mt-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            startDrawingForTask(task);
                                                        }}
                                                        className="w-full"
                                                    >
                                                        Start Drawing
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                <div className="text-xs text-gray-600">Click on a plot marker or select from list</div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                <div className="text-xs text-gray-600">Click on map to add polygon points</div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                <div className="text-xs text-gray-600">Double-click to finish drawing</div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                                <div className="text-xs text-gray-600">Click Save to complete task</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Legend</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="size-4 rounded-full bg-amber-500 border-2 border-white animate-pulse"></div>
                                <span className="text-xs text-gray-700">Has Task</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-4 rounded-full bg-green-500 border-2 border-white"></div>
                                <span className="text-xs text-gray-700">Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-4 rounded-full bg-red-500 border-2 border-white"></div>
                                <span className="text-xs text-gray-700">Emergency</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-4 rounded-full bg-gray-500 border-2 border-white"></div>
                                <span className="text-xs text-gray-700">Inactive</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SupervisorMap;