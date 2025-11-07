import { useState, useRef } from "react"
import { usePlots } from "@/features/plots/api/get-all-plots"
import type { PlotStatus, PlotDTO } from "@/features/plots/api/get-all-plots"
import { MapContainer, TileLayer, GeoJSON as LeafletGeoJSON, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Map, MapPin, User, Filter } from "lucide-react"
import { PlotsDetailDialog } from "@/features/plots/components/plots-detail-dialog"

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

type PlotMapData = {
    plotId: string
    soThua: string
    soTo: string
    farmerName: string
    area: number
    status: PlotStatus
    geoJson: any
}

// ✅ Fixed WKT parser
const parseWKTtoGeoJSON = (wkt: string): any => {
    const polygonMatch = wkt.match(/POLYGON\s*\(\((.*?)\)\)/)
    if (polygonMatch) {
        const coordsStr = polygonMatch[1]
        const coords = coordsStr.split(',').map(pair => {
            const parts = pair.trim().split(/\s+/)
            const lng = Number(parts[0])
            const lat = Number(parts[1])
            return [lng, lat]
        })

        return {
            type: "Polygon",
            coordinates: [coords]
        }
    }

    const pointMatch = wkt.match(/POINT\s*\((.*?)\)/)
    if (pointMatch) {
        const parts = pointMatch[1].trim().split(/\s+/)
        const lng = Number(parts[0])
        const lat = Number(parts[1])

        return {
            type: "Point",
            coordinates: [lng, lat]
        }
    }

    throw new Error("Unsupported WKT format")
}

// ✅ Component to fly to specific plot
const FlyToPlot = ({ plotData }: { plotData: PlotMapData | null }) => {
    const map = useMap()

    if (plotData) {
        if (plotData.geoJson.type === "Polygon" && plotData.geoJson.coordinates?.[0]) {
            const coords = plotData.geoJson.coordinates[0]
            const lats = coords.map((c: number[]) => c[1])
            const lngs = coords.map((c: number[]) => c[0])
            const center: [number, number] = [
                (Math.max(...lats) + Math.min(...lats)) / 2,
                (Math.max(...lngs) + Math.min(...lngs)) / 2
            ]
            map.flyTo(center, 17, { duration: 1 })
        } else if (plotData.geoJson.type === "Point") {
            const [lng, lat] = plotData.geoJson.coordinates
            map.flyTo([lat, lng], 17, { duration: 1 })
        }
    }

    return null
}

export const PlotsMapPage = () => {
    const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null)
    const [hoveredPlotId, setHoveredPlotId] = useState<string | null>(null)
    const [focusedPlot, setFocusedPlot] = useState<PlotMapData | null>(null)

    const { data, isLoading } = usePlots({
        params: {
            pageNumber: 1,
            pageSize: 100,
        },
    })

    const plots = Array.isArray(data) ? data : (data?.data || [])
    const totalPlots = Array.isArray(data) ? data.length : (data?.totalCount || 0)

    const plotsWithGeo: PlotMapData[] = plots
        .map((plot: PlotDTO) => {
            if (!plot.boundaryGeoJson && !plot.coordinateGeoJson) return null

            try {
                const geoJsonString = plot.boundaryGeoJson || plot.coordinateGeoJson
                let geoJson: any

                try {
                    geoJson = JSON.parse(geoJsonString)
                } catch {
                    geoJson = parseWKTtoGeoJSON(geoJsonString)
                }

                return {
                    plotId: plot.plotId,
                    soThua: String(plot.soThua),
                    soTo: String(plot.soTo),
                    farmerName: plot.farmerName,
                    area: plot.area,
                    status: plot.status,
                    geoJson,
                } as PlotMapData
            } catch (e) {
                console.error("❌ Failed to parse geo for plot:", plot.plotId, e)
                return null
            }
        })
        .filter((p: PlotMapData | null): p is PlotMapData => p !== null)

    const getMapCenter = (): [number, number] => {
        if (plotsWithGeo.length === 0) return [10.8231, 106.6297]

        const allCoords: number[][] = []
        plotsWithGeo.forEach((plot: PlotMapData) => {
            if (plot.geoJson.type === "Polygon" && plot.geoJson.coordinates?.[0]) {
                allCoords.push(...plot.geoJson.coordinates[0])
            } else if (plot.geoJson.type === "Point" && plot.geoJson.coordinates) {
                allCoords.push(plot.geoJson.coordinates)
            }
        })

        if (allCoords.length === 0) return [10.8231, 106.6297]

        const lats = allCoords.map((c) => c[1])
        const lngs = allCoords.map((c) => c[0])

        return [(Math.max(...lats) + Math.min(...lats)) / 2, (Math.max(...lngs) + Math.min(...lngs)) / 2]
    }

    const mapCenter = getMapCenter()

    const getPolygonStyle = (plotId: string, status: PlotStatus) => {
        const isHovered = hoveredPlotId === plotId
        const isFocused = focusedPlot?.plotId === plotId
        const baseColors: Record<PlotStatus, string> = {
            Active: "#10b981",
            Inactive: "#6b7280",
            Emergency: "#ef4444",
            Locked: "#f59e0b",
        }

        const color = baseColors[status] || "#10b981"

        return {
            color,
            weight: isHovered || isFocused ? 4 : 2,
            fillColor: color,
            fillOpacity: isHovered || isFocused ? 0.5 : 0.25,
        }
    }

    // ✅ Handle plot click from sidebar
    const handlePlotFocus = (plot: PlotMapData) => {
        setFocusedPlot(plot)
        setHoveredPlotId(plot.plotId)
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-neutral-50">
                <div className="text-center">
                    <Spinner size="lg" className="text-emerald-600 mx-auto mb-4" />
                    <p className="text-neutral-600 font-medium">Loading map data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 shadow-lg">
                            <Map className="size-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900">Fields Map</h1>
                            <p className="text-sm text-neutral-600 mt-1">Interactive map of all agricultural fields</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-600">{plotsWithGeo.length}</p>
                            <p className="text-xs text-neutral-600">of {totalPlots} total fields</p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="size-4" />
                            Filter
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 p-6 overflow-hidden">
                {/* Map Container */}
                <div className="flex-1 rounded-xl border-2 border-neutral-200 overflow-hidden shadow-2xl bg-white">
                    {plotsWithGeo.length > 0 ? (
                        <MapContainer center={mapCenter} zoom={15} style={{ height: "100%", width: "100%" }} className="z-0">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* ✅ Fly to plot when focused */}
                            <FlyToPlot plotData={focusedPlot} />

                            {plotsWithGeo.map((plot: PlotMapData) => (
                                <LeafletGeoJSON
                                    key={plot.plotId}
                                    data={plot.geoJson}
                                    style={() => getPolygonStyle(plot.plotId, plot.status)}
                                    eventHandlers={{
                                        mouseover: () => setHoveredPlotId(plot.plotId),
                                        mouseout: () => setHoveredPlotId(null),
                                        click: () => setSelectedPlotId(plot.plotId),
                                    }}
                                >
                                    <Popup>
                                        <div className="p-2 min-w-[200px]">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-bold text-sm">
                                                    Plot {plot.soThua} / {plot.soTo}
                                                </h3>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        plot.status === "Active"
                                                            ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                                                            : "border-neutral-300"
                                                    }
                                                >
                                                    {plot.status}
                                                </Badge>
                                            </div>
                                            <div className="space-y-1 text-xs mb-3">
                                                <div className="flex items-center gap-2 text-neutral-600">
                                                    <User className="size-3" />
                                                    {plot.farmerName}
                                                </div>
                                                <div className="flex items-center gap-2 text-neutral-600">
                                                    <MapPin className="size-3" />
                                                    {plot.area.toFixed(2)} hectares
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                                                onClick={() => setSelectedPlotId(plot.plotId)}
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </Popup>
                                </LeafletGeoJSON>
                            ))}
                        </MapContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-neutral-50">
                            <div className="text-center">
                                <Map className="size-20 mx-auto text-neutral-300 mb-4" />
                                <h3 className="text-xl font-semibold text-neutral-700 mb-2">No Field Locations Available</h3>
                                <p className="text-sm text-neutral-500">Fields with geographic data will appear here</p>
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
                                Fields on Map
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[400px] overflow-y-auto pt-4">
                            {plotsWithGeo.length === 0 ? (
                                <p className="text-sm text-neutral-500 text-center py-8">No fields with location data</p>
                            ) : (
                                plotsWithGeo.map((plot: PlotMapData) => (
                                    <div
                                        key={plot.plotId}
                                        className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${focusedPlot?.plotId === plot.plotId
                                                ? "border-emerald-500 bg-emerald-100 shadow-lg scale-105"
                                                : hoveredPlotId === plot.plotId
                                                    ? "border-emerald-400 bg-emerald-50 shadow-md scale-105"
                                                    : "border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                                            }`}
                                        onMouseEnter={() => setHoveredPlotId(plot.plotId)}
                                        onMouseLeave={() => setHoveredPlotId(null)}
                                        onClick={() => handlePlotFocus(plot)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <p className="font-semibold text-sm text-neutral-900">
                                                Plot {plot.soThua}/{plot.soTo}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${plot.status === "Active"
                                                        ? "border-emerald-300 text-emerald-700 bg-emerald-50"
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

                    <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Status Legend</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="size-5 rounded border-2 border-emerald-500 bg-emerald-500/25"></div>
                                <span className="text-sm text-neutral-700 font-medium">Active</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-5 rounded border-2 border-neutral-500 bg-neutral-500/25"></div>
                                <span className="text-sm text-neutral-700 font-medium">Inactive</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-5 rounded border-2 border-red-500 bg-red-500/25"></div>
                                <span className="text-sm text-neutral-700 font-medium">Emergency</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-5 rounded border-2 border-amber-500 bg-amber-500/25"></div>
                                <span className="text-sm text-neutral-700 font-medium">Locked</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {selectedPlotId && (
                <PlotsDetailDialog plotId={selectedPlotId} open={!!selectedPlotId} onOpenChange={(open) => !open && setSelectedPlotId(null)} />
            )}
        </div>
    )
}

export default PlotsMapPage