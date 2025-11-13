// src/app/routes/app/cluster/map.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
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
import { MapClient, type PlotMapData } from "@/features/plots/components/MapClient";

const parseWKTtoGeoJSON = (wkt: string): any => {
    const polygonMatch = wkt.match(/POLYGON\s*\(\((.*?)\)\)/);
    if (polygonMatch) {
        const coordsStr = polygonMatch[1];
        const coords = coordsStr.split(",").map((pair) => {
            const parts = pair.trim().split(/\s+/);
            const lng = Number(parts[0]);
            const lat = Number(parts[1]);
            return [lat, lng]; // ✅ Store as [lat, lng] for Leaflet
        });
        return { type: "Polygon", coordinates: [coords] };
    }

    const pointMatch = wkt.match(/POINT\s*\((.*?)\)/);
    if (pointMatch) {
        const parts = pointMatch[1].trim().split(/\s+/);
        const lng = Number(parts[0]);
        const lat = Number(parts[1]);
        return { type: "Point", coordinates: [lat, lng] }; // ✅ Store as [lat, lng]
    }

    throw new Error("Unsupported WKT format");
};

const MapPage = () => {
    const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
    const [hoveredPlotId, setHoveredPlotId] = useState<string | null>(null);
    const [focusedPlot, setFocusedPlot] = useState<PlotMapData | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<PlotStatus | "all">("all");
    const [mapType, setMapType] = useState<"vector" | "satellite">("vector");
    const [isClient, setIsClient] = useState(false);

    const { data, isLoading } = usePlots({
        params: { pageNumber: 1, pageSize: 500 },
    });

    const plots: PlotDTO[] = data?.data || [];
    const totalPlots = data?.totalCount || 0;

    useEffect(() => {
        setIsClient(true);
    }, []);

    const plotsWithGeo: PlotMapData[] = useMemo(() => {
        return plots
            .map((plot: PlotDTO) => {
                if (!plot.boundaryGeoJson && !plot.coordinateGeoJson) return null;
                try {
                    const geoJsonString = plot.boundaryGeoJson || plot.coordinateGeoJson;
                    let geoJson: any;

                    try {
                        geoJson = JSON.parse(geoJsonString);
                        // ✅ Convert GeoJSON coordinates to [lat, lng] format for Leaflet
                        if (geoJson.type === "Polygon") {
                            geoJson.coordinates = geoJson.coordinates.map((ring: number[][]) =>
                                ring.map(([lng, lat]) => [lat, lng])
                            );
                        } else if (geoJson.type === "Point") {
                            const [lng, lat] = geoJson.coordinates;
                            geoJson.coordinates = [lat, lng];
                        }
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

        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (p) =>
                    p.soThua.toLowerCase().includes(term) ||
                    p.soTo.toLowerCase().includes(term) ||
                    p.farmerName.toLowerCase().includes(term)
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            result = result.filter((p) => p.status === statusFilter);
        }

        return result;
    }, [plotsWithGeo, searchTerm, statusFilter]);

    // ✅ Calculate map center from filtered plots
    const getMapCenter = (): [number, number] => {
        if (filteredPlots.length === 0) return [10.8231, 106.6297]; // Default Vietnam center

        const allCoords: number[][] = [];
        filteredPlots.forEach((plot) => {
            if (plot.geoJson.type === "Polygon" && plot.geoJson.coordinates?.[0]) {
                allCoords.push(...plot.geoJson.coordinates[0]);
            } else if (plot.geoJson.type === "Point" && plot.geoJson.coordinates) {
                allCoords.push(plot.geoJson.coordinates);
            }
        });

        if (allCoords.length === 0) return [10.8231, 106.6297];

        const lats = allCoords.map((c) => c[0]); // First element is lat
        const lngs = allCoords.map((c) => c[1]); // Second element is lng

        return [
            (Math.max(...lats) + Math.min(...lats)) / 2,
            (Math.max(...lngs) + Math.min(...lngs)) / 2,
        ];
    };

    const mapCenter = getMapCenter();

    const getPolygonStyle = (plotId: string, status: PlotStatus) => {
        const isHovered = hoveredPlotId === plotId;
        const isFocused = focusedPlot?.plotId === plotId;

        const baseColors: Record<PlotStatus, string> = {
            Active: "#10b981",
            Inactive: "#6b7280",
            Emergency: "#ef4444",
            Locked: "#f59e0b",
        };

        const color = baseColors[status] || "#10b981";

        return {
            color,
            weight: isHovered || isFocused ? 4 : 2,
            fillColor: color,
            fillOpacity: isHovered || isFocused ? 0.6 : 0.3,
            opacity: 1,
        };
    };

    const handlePlotFocus = (plot: PlotMapData) => {
        setFocusedPlot(plot);
        setHoveredPlotId(plot.plotId);
    };

    const handlePlotHover = (plotId: string | null) => {
        setHoveredPlotId(plotId);
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

                        {/* Controls */}
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
                                className="relative"
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
                    {filteredPlots.length > 0 ? (
                        <MapClient
                            plots={filteredPlots}
                            mapCenter={mapCenter}
                            mapType={mapType}
                            focusedPlot={focusedPlot}
                            hoveredPlotId={hoveredPlotId}
                            onPlotClick={setSelectedPlotId}
                            onPlotHover={handlePlotHover}
                            getPolygonStyle={getPolygonStyle}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center bg-neutral-50">
                            <div className="text-center">
                                <Map className="size-20 mx-auto text-neutral-300 mb-4" />
                                <h3 className="text-xl font-semibold text-neutral-700 mb-2">Không tìm thấy thửa ruộng</h3>
                                <p className="text-sm text-neutral-500">
                                    {searchTerm || statusFilter !== "all"
                                        ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                                        : "Chưa có dữ liệu thửa ruộng với tọa độ"
                                    }
                                </p>
                            </div>
                        </div>
                    )}
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
                                        onMouseEnter={() => handlePlotHover(plot.plotId)}
                                        onMouseLeave={() => handlePlotHover(null)}
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