"use client";

import { MapContainer, GeoJSON as LeafletGeoJSON, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import MapboxTileLayer from "./MapboxTileLayer";
import type { PlotStatus } from "@/features/plots/api/get-all-plots";

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export type PlotMapData = {
    plotId: string;
    soThua: string;
    soTo: string;
    farmerName: string;
    area: number;
    status: PlotStatus;
    geoJson: any;
};

const FlyToPlot = ({ plotData }: { plotData: PlotMapData | null }) => {
    const map = useMap();

    if (plotData) {
        if (plotData.geoJson.type === "Polygon" && plotData.geoJson.coordinates?.[0]) {
            const coords = plotData.geoJson.coordinates[0];
            const lats = coords.map((c: number[]) => c[0]); // ✅ First element is lat
            const lngs = coords.map((c: number[]) => c[1]); // ✅ Second element is lng
            const center: [number, number] = [
                (Math.max(...lats) + Math.min(...lats)) / 2,
                (Math.max(...lngs) + Math.min(...lngs)) / 2,
            ];
            map.flyTo(center, 17, { duration: 1 });
        } else if (plotData.geoJson.type === "Point") {
            const [lat, lng] = plotData.geoJson.coordinates;
            map.flyTo([lat, lng], 17, { duration: 1 });
        }
    }
    return null;
};

type MapClientProps = {
    plots: PlotMapData[];
    mapCenter: [number, number];
    mapType: "vector" | "satellite";
    focusedPlot: PlotMapData | null;
    hoveredPlotId: string | null;
    onPlotClick: (id: string) => void;
    onPlotHover: (id: string | null) => void;
    getPolygonStyle: (id: string, status: PlotStatus) => any;
};

export const MapClient = ({
    plots,
    mapCenter,
    mapType,
    focusedPlot,
    hoveredPlotId,
    onPlotClick,
    onPlotHover,
    getPolygonStyle,
}: MapClientProps) => {
    console.log("🗺️ MapClient rendering:", {
        plotsCount: plots.length,
        mapCenter,
        mapType,
        hasToken: !!import.meta.env.VITE_MAPBOX_TOKEN
    });

    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            <MapContainer
                center={mapCenter}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                whenReady={() => {
                    console.log("✅ Map ready");
                }}
            >
                {/* ✅ Your Custom Mapbox Style */}
                <MapboxTileLayer type={mapType} />
                <FlyToPlot plotData={focusedPlot} />

                {plots.map((plot) => {
                    console.log("📍 Rendering plot:", plot.plotId, plot.geoJson);
                    return (
                        <LeafletGeoJSON
                            key={plot.plotId}
                            data={plot.geoJson}
                            style={() => getPolygonStyle(plot.plotId, plot.status)}
                            eventHandlers={{
                                click: () => onPlotClick(plot.plotId),
                                mouseover: () => onPlotHover(plot.plotId),
                                mouseout: () => onPlotHover(null),
                            }}
                        >
                            <Popup>
                                <div className="p-3 min-w-[240px] space-y-3">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-bold text-base text-neutral-900">
                                            Thửa {plot.soThua}/{plot.soTo}
                                        </h3>
                                        <span className={`text-xs px-2 py-1 rounded font-medium ${plot.status === "Active"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : plot.status === "Emergency"
                                                ? "bg-red-100 text-red-700"
                                                : plot.status === "Locked"
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}>
                                            {plot.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-neutral-600">Nông dân:</span>
                                            <span className="text-neutral-800">{plot.farmerName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-neutral-600">Diện tích:</span>
                                            <span className="text-neutral-800">{plot.area.toFixed(2)} ha</span>
                                        </div>
                                    </div>
                                    <button
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-md text-sm transition-colors"
                                        onClick={() => onPlotClick(plot.plotId)}
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </Popup>
                        </LeafletGeoJSON>
                    );
                })}
            </MapContainer>
        </div >
    );
};