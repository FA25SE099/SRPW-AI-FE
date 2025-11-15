"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { usePlots } from "@/features/plots/api/get-all-plots";
import type { PlotStatus, PlotDTO } from "@/features/plots/api/get-all-plots";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Map, MapPin, User, Satellite, Layers, Search, Filter } from "lucide-react";
import { PlotsDetailDialog } from "@/features/plots/components/plots-detail-dialog";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

type PlotMapData = {
    plotId: string;
    soThua: string;
    soTo: string;
    farmerName: string;
    area: number;
    status: PlotStatus;
    geoJson: any;
};

const parseWKTtoGeoJSON = (wkt: string): any => {
    const polygonMatch = wkt.match(/POLYGON\s*\(\((.*?)\)\)/);
    if (polygonMatch) {
        const coordsStr = polygonMatch[1];
        const coords = coordsStr.split(",").map((pair) => {
            const parts = pair.trim().split(/\s+/);
            const lng = Number(parts[0]);
            const lat = Number(parts[1]);
            return [lng, lat];
        });
        return { type: "Polygon", coordinates: [coords] };
    }

    const pointMatch = wkt.match(/POINT\s*\((.*?)\)/);
    if (pointMatch) {
        const parts = pointMatch[1].trim().split(/\s+/);
        const lng = Number(parts[0]);
        const lat = Number(parts[1]);
        return { type: "Point", coordinates: [lng, lat] };
    }

    throw new Error("Unsupported WKT format");
};

const MapPage = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const popupRef = useRef<mapboxgl.Popup | null>(null);

    const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
    const [hoveredPlotId, setHoveredPlotId] = useState<string | null>(null);
    const [focusedPlot, setFocusedPlot] = useState<PlotMapData | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<PlotStatus | "all">("all");
    const [mapType, setMapType] = useState<"vector" | "satellite">("satellite"); // Changed default to "satellite"
    const [isClient, setIsClient] = useState(false);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    const { data, isLoading } = usePlots({
        params: { pageNumber: 1, pageSize: 500 },
    });

    const plots: PlotDTO[] = data?.data || [];
    const totalPlots = data?.totalCount || 0;

    // Get user's current location
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
                    // Fallback to Vietnam center immediately on error
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
    }, [isLoading]);

    const plotsWithGeo: PlotMapData[] = useMemo(() => {
        return plots
            .map((plot: PlotDTO) => {
                if (!plot.boundaryGeoJson && !plot.coordinateGeoJson) return null;
                try {
                    const geoJsonString = plot.boundaryGeoJson || plot.coordinateGeoJson;
                    let geoJson: any;

                    try {
                        geoJson = JSON.parse(geoJsonString);
                    } catch {
                        geoJson = parseWKTtoGeoJSON(geoJsonString);
                    }

                    return {
                        plotId: plot.plotId,
                        soThua: plot.soThua != null ? String(plot.soThua) : "N/A",
                        soTo: plot.soTo != null ? String(plot.soTo) : "N/A",
                        farmerName: plot.farmerName || "Chưa có thông tin",
                        area: plot.area || 0,
                        status: plot.status as PlotStatus,
                        geoJson,
                    } as PlotMapData;
                } catch (e) {
                    console.error("❌ Parse error for plot:", plot.plotId, e);
                    return null;
                }
            })
            .filter((p): p is PlotMapData => p !== null);
    }, [plots]);

    const filteredPlots = useMemo(() => {
        let result = plotsWithGeo;

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (p) =>
                    p.soThua.toLowerCase().includes(term) ||
                    p.soTo.toLowerCase().includes(term) ||
                    p.farmerName.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== "all") {
            result = result.filter((p) => p.status === statusFilter);
        }

        return result;
    }, [plotsWithGeo, searchTerm, statusFilter]);

    const getMapCenter = (): [number, number] => {
        if (userLocation) {
            return userLocation;
        }

        if (filteredPlots.length > 0) {
            const allCoords: number[][] = [];
            filteredPlots.forEach((plot) => {
                if (plot.geoJson.type === "Polygon" && plot.geoJson.coordinates?.[0]) {
                    allCoords.push(...plot.geoJson.coordinates[0]);
                } else if (plot.geoJson.type === "Point" && plot.geoJson.coordinates) {
                    allCoords.push(plot.geoJson.coordinates);
                }
            });

            if (allCoords.length > 0) {
                const lngs = allCoords.map((c) => c[0]);
                const lats = allCoords.map((c) => c[1]);
                return [
                    (Math.max(...lngs) + Math.min(...lngs)) / 2,
                    (Math.max(...lats) + Math.min(...lats)) / 2,
                ];
            }
        }

        return [106.6297, 10.8231];
    };

    const mapCenter = getMapCenter();

    const getPlotColor = (status: PlotStatus) => {
        const colors: Record<PlotStatus, string> = {
            Active: "#10b981",
            Inactive: "#6b7280",
            Emergency: "#ef4444",
            Locked: "#f59e0b",
        };
        return colors[status] || "#10b981";
    };

    // Initialize Mapbox map
    useEffect(() => {
        if (!isClient || !MAPBOX_TOKEN || !mapContainer.current || !userLocation) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        const center = userLocation || [106.6297, 10.8231];
        const zoom = 13;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: mapType === "satellite"
                ? "mapbox://styles/mapbox/satellite-streets-v12" // Changed to satellite-streets-v12
                : "mapbox://styles/mapbox/streets-v12",
            center: center as [number, number],
            zoom: zoom,
        });

        map.current.on("load", () => {
            addPlotSources();
        });

        return () => {
            map.current?.remove();
        };
    }, [isClient, mapType, MAPBOX_TOKEN, userLocation]);

    // Update map center when location changes
    useEffect(() => {
        if (!map.current) return;

        const newStyle = mapType === "satellite"
            ? "mapbox://styles/mapbox/satellite-streets-v12" // Changed from satellite-v9
            : "mapbox://styles/mapbox/streets-v12";

        map.current.setStyle(newStyle);

        // Re-add plot sources after style is loaded
        map.current.once("style.load", () => {
            addPlotSources();
        });
    }, [mapType]);

    // Add plot sources and layers
    const addPlotSources = () => {
        if (!map.current) return;

        filteredPlots.forEach((plot) => {
            const sourceId = `plot-${plot.plotId}`;
            const layerId = `plot-layer-${plot.plotId}`;
            const outlineLayerId = `plot-outline-${plot.plotId}`;

            if (!map.current!.getSource(sourceId)) {
                map.current!.addSource(sourceId, {
                    type: "geojson",
                    data: plot.geoJson,
                });

                const color = getPlotColor(plot.status);
                const isHovered = hoveredPlotId === plot.plotId;
                const isFocused = focusedPlot?.plotId === plot.plotId;

                // Fill layer
                map.current!.addLayer({
                    id: layerId,
                    type: plot.geoJson.type === "Point" ? "circle" : "fill",
                    source: sourceId,
                    paint:
                        plot.geoJson.type === "Point"
                            ? {
                                "circle-radius": 8,
                                "circle-color": color,
                                "circle-opacity": isHovered || isFocused ? 0.8 : 0.6,
                            }
                            : {
                                "fill-color": color,
                                "fill-opacity": isHovered || isFocused ? 0.6 : 0.3,
                            },
                });

                // Outline layer
                if (plot.geoJson.type !== "Point") {
                    map.current!.addLayer({
                        id: outlineLayerId,
                        type: "line",
                        source: sourceId,
                        paint: {
                            "line-color": color,
                            "line-width": isHovered || isFocused ? 4 : 2,
                        },
                    });
                }

                // Add interactions
                map.current!.on("click", layerId, () => {
                    setSelectedPlotId(plot.plotId);
                    setFocusedPlot(plot);
                });

                map.current!.on("mouseenter", layerId, () => {
                    setHoveredPlotId(plot.plotId);
                    map.current!.getCanvas().style.cursor = "pointer";
                });

                map.current!.on("mouseleave", layerId, () => {
                    setHoveredPlotId(null);
                    map.current!.getCanvas().style.cursor = "";
                });

                // Show popup on click
                map.current!.on("click", layerId, () => {
                    if (popupRef.current) {
                        popupRef.current.remove();
                    }

                    const coordinates =
                        plot.geoJson.type === "Point"
                            ? plot.geoJson.coordinates
                            : plot.geoJson.coordinates[0][0];

                    popupRef.current = new mapboxgl.Popup({ offset: 25 })
                        .setLngLat(coordinates)
                        .setHTML(`
                            <div class="p-3 min-w-[240px] space-y-3">
                                <div class="flex items-start justify-between">
                                    <h3 class="font-bold text-base text-neutral-900">
                                        Thửa ${plot.soThua}/${plot.soTo}
                                    </h3>
                                    <span class="text-xs px-2 py-1 rounded font-medium ${plot.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : plot.status === "Emergency"
                                    ? "bg-red-100 text-red-700"
                                    : plot.status === "Locked"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-gray-100 text-gray-700"
                            }">
                                        ${plot.status}
                                    </span>
                                </div>
                                <div class="space-y-2 text-sm">
                                    <div class="flex items-center gap-2">
                                        <span class="font-medium text-neutral-600">Nông dân:</span>
                                        <span class="text-neutral-800">${plot.farmerName}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="font-medium text-neutral-600">Diện tích:</span>
                                        <span class="text-neutral-800">${plot.area.toFixed(2)} ha</span>
                                    </div>
                                </div>
                            </div>
                        `)
                        .addTo(map.current!);
                });
            }
        });
    };

    // Update layers when hover/focus state changes
    useEffect(() => {
        if (!map.current) return;

        filteredPlots.forEach((plot) => {
            const layerId = `plot-layer-${plot.plotId}`;
            const outlineLayerId = `plot-outline-${plot.plotId}`;
            const isHovered = hoveredPlotId === plot.plotId;
            const isFocused = focusedPlot?.plotId === plot.plotId;

            if (map.current!.getLayer(layerId)) {
                if (plot.geoJson.type === "Point") {
                    map.current!.setPaintProperty(layerId, "circle-opacity", isHovered || isFocused ? 0.8 : 0.6);
                } else {
                    map.current!.setPaintProperty(layerId, "fill-opacity", isHovered || isFocused ? 0.6 : 0.3);
                }
            }

            if (map.current!.getLayer(outlineLayerId)) {
                map.current!.setPaintProperty(outlineLayerId, "line-width", isHovered || isFocused ? 4 : 2);
            }
        });
    }, [hoveredPlotId, focusedPlot, filteredPlots]);

    const handlePlotFocus = (plot: PlotMapData) => {
        setFocusedPlot(plot);
        setHoveredPlotId(plot.plotId);

        // Fly to plot location with validation
        if (map.current && plot.geoJson) {
            let coords: [number, number] | null = null;

            if (plot.geoJson.type === "Point" && plot.geoJson.coordinates) {
                coords = plot.geoJson.coordinates as [number, number];
            } else if (plot.geoJson.type === "Polygon" && plot.geoJson.coordinates?.[0]?.[0]) {
                coords = plot.geoJson.coordinates[0][0] as [number, number];
            }

            // Validate coordinates before flying
            if (coords && Array.isArray(coords) && coords.length === 2) {
                const [lng, lat] = coords;
                if (!isNaN(lng) && !isNaN(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
                    map.current.flyTo({
                        center: coords,
                        zoom: 15,
                        duration: 1000,
                    });
                } else {
                    console.error("Invalid coordinates:", coords);
                }
            } else {
                console.error("Invalid plot geometry:", plot.geoJson);
            }
        }
    };

    if (isLoading || !isClient) {
        return (
            <div className="flex h-screen items-center justify-center bg-neutral-50">
                <div className="text-center">
                    <Spinner size="lg" className="text-emerald-600 mx-auto mb-4" />
                    <p className="text-neutral-600 font-medium">Đang tải dữ liệu bản đồ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 shadow-lg">
                            <Map className="size-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900">Bản đồ thửa ruộng</h1>
                            <p className="text-sm text-neutral-600 mt-1">
                                Quản lý và theo dõi toàn bộ thửa đất nông nghiệp
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-600">{filteredPlots.length}</p>
                            <p className="text-xs text-neutral-600">trong tổng {totalPlots} thửa</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-neutral-400" />
                                <Input
                                    placeholder="Tìm kiếm thửa ruộng..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64 pl-10"
                                />
                            </div>

                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                                <SelectTrigger className="w-40">
                                    <Filter className="size-4 mr-2" />
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="Active">Hoạt động</SelectItem>
                                    <SelectItem value="Inactive">Không hoạt động</SelectItem>
                                    <SelectItem value="Emergency">Khẩn cấp</SelectItem>
                                    <SelectItem value="Locked">Bị khóa</SelectItem>
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

            {/* Main Content */}
            <div className="flex-1 flex gap-6 p-6 overflow-hidden">
                {/* Map */}
                <div className="flex-1 rounded-xl border-2 border-neutral-200 overflow-hidden shadow-2xl bg-white">
                    <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
                </div>

                {/* Sidebar */}
                <div className="w-80 space-y-4 overflow-y-auto">
                    <Card className="shadow-lg">
                        <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-blue-50">
                            <CardTitle className="text-base flex items-center gap-2">
                                <MapPin className="size-5 text-emerald-600" />
                                Danh sách thửa ruộng ({filteredPlots.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[500px] overflow-y-auto pt-4">
                            {filteredPlots.length === 0 ? (
                                <p className="text-sm text-neutral-500 text-center py-8">
                                    Không có thửa ruộng nào
                                </p>
                            ) : (
                                filteredPlots.map((plot) => (
                                    <div
                                        key={plot.plotId}
                                        className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${focusedPlot?.plotId === plot.plotId
                                            ? "border-emerald-500 bg-emerald-100 shadow-lg scale-[1.02]"
                                            : hoveredPlotId === plot.plotId
                                                ? "border-emerald-400 bg-emerald-50 shadow-md"
                                                : "border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                                            }`}
                                        onMouseEnter={() => setHoveredPlotId(plot.plotId)}
                                        onMouseLeave={() => setHoveredPlotId(null)}
                                        onClick={() => handlePlotFocus(plot)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <p className="font-semibold text-sm text-neutral-900">
                                                Thửa {plot.soThua} / {plot.soTo}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${plot.status === "Active"
                                                    ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                                                    : plot.status === "Emergency"
                                                        ? "border-red-300 text-red-700 bg-red-50"
                                                        : plot.status === "Locked"
                                                            ? "border-amber-300 text-amber-700 bg-amber-50"
                                                            : "border-neutral-300"
                                                    }`}
                                            >
                                                {plot.status}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-neutral-600 flex items-center gap-1.5">
                                                <User className="size-3.5" />
                                                {plot.farmerName}
                                            </p>
                                            <p className="text-xs text-neutral-600 flex items-center gap-1.5">
                                                <MapPin className="size-3.5" />
                                                {plot.area.toFixed(2)} ha
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Status Legend */}
                    <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Chú thích trạng thái</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="size-5 rounded border-2 border-emerald-500 bg-emerald-500/25"></div>
                                <span className="text-sm text-neutral-700 font-medium">Hoạt động (Active)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-5 rounded border-2 border-neutral-500 bg-neutral-500/25"></div>
                                <span className="text-sm text-neutral-700 font-medium">Không hoạt động (Inactive)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-5 rounded border-2 border-red-500 bg-red-500/25"></div>
                                <span className="text-sm text-neutral-700 font-medium">Khẩn cấp (Emergency)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-5 rounded border-2 border-amber-500 bg-amber-500/25"></div>
                                <span className="text-sm text-neutral-700 font-medium">Bị khóa (Locked)</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Plot Detail Dialog */}
            {selectedPlotId && (
                <PlotsDetailDialog
                    plotId={selectedPlotId}
                    open={!!selectedPlotId}
                    onOpenChange={(open) => !open && setSelectedPlotId(null)}
                />
            )}
        </div>
    );
};

export default MapPage;