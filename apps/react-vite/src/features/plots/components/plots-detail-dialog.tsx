import { useState } from "react"
import { usePlotDetail } from "@/features/plots/api/get-plots-detail"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import {
    MapPin,
    User,
    Calendar,
    Leaf,
    AlertTriangle,
    CheckCircle2,
    Clock,
    TrendingUp,
    FileText,
    ChevronRight,
    Map,
} from "lucide-react"
import type { PlotStatus, ProductionPlanStatus, CultivationStatus } from "@/features/plots/api/get-plots-detail"

type PlotsDetailDialogProps = {
    plotId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const PlotsDetailDialog = ({ plotId, open, onOpenChange }: PlotsDetailDialogProps) => {
    const [activeTab, setActiveTab] = useState<"overview" | "seasons" | "plans" | "cultivations">("overview")

    const {
        data: plotDetail,
        isLoading,
        isError,
    } = usePlotDetail({
        plotId,
        queryConfig: {
            enabled: open && !!plotId,
        },
    })

    const plot = plotDetail

    const getStatusBadge = (status: PlotStatus | ProductionPlanStatus | CultivationStatus) => {
        const statusStyles: Record<string, string> = {
            Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
            Inactive: "bg-neutral-100 text-neutral-700 border-neutral-200",
            Emergency: "bg-red-50 text-red-700 border-red-200",
            Locked: "bg-amber-50 text-amber-700 border-amber-200",
            Draft: "bg-neutral-100 text-neutral-700 border-neutral-200",
            Submitted: "bg-sky-50 text-sky-700 border-sky-200",
            Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
            InProgress: "bg-amber-50 text-amber-700 border-amber-200",
            Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
            Cancelled: "bg-red-50 text-red-700 border-red-200",
            Planned: "bg-sky-50 text-sky-700 border-sky-200",
            Failed: "bg-red-50 text-red-700 border-red-200",
        }
        return statusStyles[status] || "bg-neutral-100 text-neutral-700 border-neutral-200"
    }

    const getStatusIcon = (status: PlotStatus | ProductionPlanStatus | CultivationStatus) => {
        switch (status) {
            case "Active":
            case "Approved":
            case "Completed":
                return <CheckCircle2 className="size-3.5" />
            case "Emergency":
            case "Failed":
            case "Cancelled":
                return <AlertTriangle className="size-3.5" />
            case "InProgress":
                return <Clock className="size-3.5" />
            default:
                return null
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                <DialogHeader className="border-b border-neutral-200 px-8 py-6 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <DialogTitle className="text-3xl font-bold text-neutral-900">
                                {isLoading ? "Loading..." : `Plot ${plot?.soThua ?? "N/A"} / ${plot?.soTo ?? "N/A"}`}
                            </DialogTitle>
                            {plot?.farmerName && (
                                <p className="text-sm text-neutral-600 mt-2">
                                    Farmer: <span className="font-semibold text-neutral-900">{plot.farmerName}</span>
                                </p>
                            )}
                        </div>
                        {plot && (
                            <Badge
                                className={`border flex items-center gap-2 px-3 py-1.5 text-sm font-medium whitespace-nowrap ${getStatusBadge(plot.status)}`}
                            >
                                {getStatusIcon(plot.status)}
                                {plot.status}
                            </Badge>
                        )}
                    </div>
                    {plot?.plotId && <p className="font-mono text-xs text-neutral-500">ID: {plot.plotId}</p>}
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-24">
                        <div className="text-center">
                            <Spinner size="lg" className="text-emerald-600 mx-auto mb-4" />
                            <p className="text-neutral-600 font-medium">Loading plot details...</p>
                        </div>
                    </div>
                )}

                {isError && (
                    <div className="flex flex-col items-center justify-center py-24 px-8">
                        <div className="rounded-full bg-red-50 p-4 mb-4">
                            <AlertTriangle className="size-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-900">Failed to load plot details</h3>
                        <p className="text-sm text-neutral-600 mt-2">Please try again later</p>
                        <Button
                            variant="outline"
                            className="mt-6 border-neutral-300 bg-transparent"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {!isLoading && !isError && plot && (
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex flex-col">
                        <TabsList className="grid w-full grid-cols-4 gap-0 bg-white border-b border-neutral-200 rounded-none px-8 py-0 h-auto">
                            <TabsTrigger
                                value="overview"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 border-b-2 border-transparent text-neutral-600 rounded-none px-0 py-4 font-medium text-sm gap-2"
                            >
                                <FileText className="size-4" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="seasons"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 border-b-2 border-transparent text-neutral-600 rounded-none px-0 py-4 font-medium text-sm gap-2"
                            >
                                <Calendar className="size-4" />
                                Seasons ({plot.seasons?.length || 0})
                            </TabsTrigger>
                            <TabsTrigger
                                value="plans"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 border-b-2 border-transparent text-neutral-600 rounded-none px-0 py-4 font-medium text-sm gap-2"
                            >
                                <TrendingUp className="size-4" />
                                Plans ({plot.productionPlans?.length || 0})
                            </TabsTrigger>
                            <TabsTrigger
                                value="cultivations"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600 border-b-2 border-transparent text-neutral-600 rounded-none px-0 py-4 font-medium text-sm gap-2"
                            >
                                <Leaf className="size-4" />
                                Cultivations ({plot.plotCultivations?.length || 0})
                            </TabsTrigger>
                        </TabsList>

                        <div className="px-8 py-6">
                            <TabsContent value="overview" className="space-y-6 mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="rounded-lg border border-neutral-200 bg-white p-6 hover:shadow-sm transition-shadow">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="rounded-full bg-emerald-50 p-2">
                                                <MapPin className="size-5 text-emerald-600" />
                                            </div>
                                            <h3 className="text-base font-semibold text-neutral-900">Plot Information</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Area</p>
                                                <p className="text-2xl font-bold text-emerald-600">{plot.area?.toFixed(2) || "N/A"}</p>
                                                <p className="text-sm text-neutral-600">hectares</p>
                                            </div>
                                            <div className="border-t border-neutral-100 pt-4">
                                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                                                    Soil Type
                                                </p>
                                                <p className="text-sm font-medium text-neutral-900">{plot.soilType || "N/A"}</p>
                                            </div>
                                            <div className="border-t border-neutral-100 pt-4">
                                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                                                    Rice Variety
                                                </p>
                                                <p className="text-sm font-medium text-neutral-900">{plot.varietyName || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-neutral-200 bg-white p-6 hover:shadow-sm transition-shadow">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="rounded-full bg-blue-50 p-2">
                                                <User className="size-5 text-blue-600" />
                                            </div>
                                            <h3 className="text-base font-semibold text-neutral-900">Farmer Information</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                                                    Farmer Name
                                                </p>
                                                <p className="text-lg font-semibold text-neutral-900">{plot.farmerName || "N/A"}</p>
                                            </div>
                                            <div className="border-t border-neutral-100 pt-4">
                                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                                                    Farmer ID
                                                </p>
                                                <p className="font-mono text-xs text-neutral-600 break-all">{plot.farmerId || "N/A"}</p>
                                            </div>
                                            <div className="border-t border-neutral-100 pt-4">
                                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Group ID</p>
                                                <p className="font-mono text-xs text-neutral-600 break-all">{plot.groupId || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {(plot.boundaryGeoJson || plot.coordinateGeoJson) && (
                                    <div className="rounded-lg border border-neutral-200 bg-white p-6 hover:shadow-sm transition-shadow">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="rounded-full bg-purple-50 p-2">
                                                <Map className="size-5 text-purple-600" />
                                            </div>
                                            <h3 className="text-base font-semibold text-neutral-900">Geographic Data</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {plot.boundaryGeoJson && (
                                                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                                                    <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">
                                                        Boundary GeoJSON
                                                    </p>
                                                    <code className="text-xs text-neutral-600 break-all line-clamp-3">
                                                        {plot.boundaryGeoJson.slice(0, 100)}...
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="mt-3 text-xs h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                    >
                                                        View Full Data
                                                    </Button>
                                                </div>
                                            )}
                                            {plot.coordinateGeoJson && (
                                                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                                                    <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">
                                                        Coordinate GeoJSON
                                                    </p>
                                                    <code className="text-xs text-neutral-600 break-all line-clamp-3">
                                                        {plot.coordinateGeoJson.slice(0, 100)}...
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="mt-3 text-xs h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                    >
                                                        View Full Data
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <Calendar className="size-5 text-emerald-600" />
                                            <span className="text-xs font-semibold text-emerald-700 uppercase">Active</span>
                                        </div>
                                        <p className="text-3xl font-bold text-emerald-900">
                                            {plot.seasons?.filter((s) => s.isActive).length || 0}
                                        </p>
                                        <p className="text-sm text-emerald-700 font-medium">Active Seasons</p>
                                    </div>

                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <TrendingUp className="size-5 text-blue-600" />
                                            <span className="text-xs font-semibold text-blue-700 uppercase">Total</span>
                                        </div>
                                        <p className="text-3xl font-bold text-blue-900">{plot.productionPlans?.length || 0}</p>
                                        <p className="text-sm text-blue-700 font-medium">Production Plans</p>
                                    </div>

                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <Leaf className="size-5 text-amber-600" />
                                            <span className="text-xs font-semibold text-amber-700 uppercase">Records</span>
                                        </div>
                                        <p className="text-3xl font-bold text-amber-900">{plot.plotCultivations?.length || 0}</p>
                                        <p className="text-sm text-amber-700 font-medium">Cultivations</p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="seasons" className="space-y-4 mt-0">
                                {!plot.seasons || plot.seasons.length === 0 ? (
                                    <div className="text-center py-16 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                                        <Calendar className="size-12 mx-auto text-neutral-300 mb-3" />
                                        <p className="text-neutral-600 font-medium">No seasons available</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {plot.seasons.map((season) => (
                                            <div
                                                key={season.seasonId}
                                                className={`border rounded-lg p-5 transition-all ${season.isActive
                                                    ? "bg-emerald-50 border-emerald-200 shadow-sm"
                                                    : "bg-white border-neutral-200 hover:shadow-sm"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-neutral-900 text-base">{season.seasonName}</h4>
                                                        <p className="text-sm text-neutral-600 mt-1">{season.seasonType}</p>
                                                    </div>
                                                    {season.isActive && (
                                                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 ml-2">
                                                            <CheckCircle2 className="size-3 mr-1" />
                                                            Active
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="space-y-2 pt-4 border-t border-neutral-200">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="size-4 text-neutral-500" />
                                                        <span className="text-neutral-600">{new Date(season.startDate).toLocaleDateString()}</span>
                                                        <span className="text-neutral-400">→</span>
                                                        <span className="text-neutral-600">{new Date(season.endDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="plans" className="space-y-4 mt-0">
                                {!plot.productionPlans || plot.productionPlans.length === 0 ? (
                                    <div className="text-center py-16 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                                        <TrendingUp className="size-12 mx-auto text-neutral-300 mb-3" />
                                        <p className="text-neutral-600 font-medium">No production plans found</p>
                                        <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white">
                                            Create Production Plan
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {plot.productionPlans.map((plan) => (
                                            <div
                                                key={plan.productionPlanId}
                                                className="border border-neutral-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-neutral-900 text-base">{plan.planName}</h4>
                                                    </div>
                                                    <Badge className={`border flex items-center gap-1 ml-2 ${getStatusBadge(plan.status)}`}>
                                                        {getStatusIcon(plan.status)}
                                                        {plan.status}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-neutral-200">
                                                    <div>
                                                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                                                            Total Area
                                                        </p>
                                                        <p className="text-base font-bold text-neutral-900">{plan.totalArea.toFixed(2)}</p>
                                                        <p className="text-xs text-neutral-600">hectares</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                                                            Planting Date
                                                        </p>
                                                        <p className="text-sm font-semibold text-neutral-900">
                                                            {new Date(plan.basePlantingDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                                                            Submitted
                                                        </p>
                                                        <p className="text-sm font-semibold text-neutral-900">
                                                            {plan.submittedAt ? new Date(plan.submittedAt).toLocaleDateString() : "Pending"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                                                            Approved
                                                        </p>
                                                        <p className="text-sm font-semibold text-neutral-900">
                                                            {plan.approvedAt ? new Date(plan.approvedAt).toLocaleDateString() : "Pending"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {plan.currentProductionStages && plan.currentProductionStages.length > 0 && (
                                                    <div>
                                                        <p className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                                                            <CheckCircle2 className="size-4 text-emerald-600" />
                                                            Production Stages ({plan.currentProductionStages.length})
                                                        </p>
                                                        <div className="space-y-2">
                                                            {plan.currentProductionStages.map((stage) => (
                                                                <div
                                                                    key={stage.productionStageId}
                                                                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${stage.isActive ? "bg-emerald-50 border-emerald-200" : "bg-neutral-50 border-neutral-200"
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex items-center justify-center size-8 rounded-full bg-white border-2 border-emerald-500 text-emerald-700 font-bold text-xs">
                                                                            {stage.sequenceOrder}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className="font-medium text-neutral-900 text-sm">{stage.stageName}</p>
                                                                            <p className="text-xs text-neutral-600">{stage.description}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right ml-4">
                                                                        <p className="text-xs text-neutral-600 font-medium mb-1">
                                                                            {stage.productionPlanTasks?.filter((t) => t.status === "Completed").length || 0} /{" "}
                                                                            {stage.productionPlanTasks?.length || 0}
                                                                        </p>
                                                                        <div className="w-20 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-emerald-500 rounded-full transition-all"
                                                                                style={{
                                                                                    width: `${stage.productionPlanTasks && stage.productionPlanTasks.length > 0
                                                                                        ? (stage.productionPlanTasks.filter((t) => t.status === "Completed")
                                                                                            .length /
                                                                                            stage.productionPlanTasks.length) *
                                                                                        100
                                                                                        : 0
                                                                                        }%`,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full mt-4 border-emerald-600 text-emerald-600 hover:bg-emerald-50 bg-transparent"
                                                >
                                                    View Full Plan Details
                                                    <ChevronRight className="size-4 ml-2" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="cultivations" className="space-y-4 mt-0">
                                {!plot.plotCultivations || plot.plotCultivations.length === 0 ? (
                                    <div className="text-center py-16 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                                        <Leaf className="size-12 mx-auto text-neutral-300 mb-3" />
                                        <p className="text-neutral-600 font-medium">No cultivation records</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {plot.plotCultivations.map((cultivation) => (
                                            <div
                                                key={cultivation.plotCultivationId}
                                                className="border border-neutral-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-neutral-900 text-base">
                                                            {new Date(cultivation.plantingDate).toLocaleDateString()}
                                                        </h4>
                                                    </div>
                                                    <Badge className={`border flex items-center gap-1 ml-2 ${getStatusBadge(cultivation.status)}`}>
                                                        {getStatusIcon(cultivation.status)}
                                                        {cultivation.status}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-neutral-200">
                                                    <div>
                                                        <p className="text-xs font-semibold text-neutral-500 mb-0.5">Actual Yield</p>
                                                        <p className="text-lg font-bold text-emerald-600">{cultivation.actualYield.toFixed(2)}</p>
                                                        <p className="text-xs text-neutral-600">tons</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-neutral-500 mb-0.5">Season ID</p>
                                                        <p className="font-mono text-xs text-neutral-600 truncate">{cultivation.seasonId}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-neutral-500 mb-0.5">Variety</p>
                                                        <p className="font-mono text-xs text-neutral-600 truncate">{cultivation.riceVarietyId}</p>
                                                    </div>
                                                </div>

                                                {cultivation.cultivationTasks && cultivation.cultivationTasks.length > 0 ? (
                                                    <div>
                                                        <p className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                                                            <FileText className="size-4 text-emerald-600" />
                                                            Tasks ({cultivation.cultivationTasks.length})
                                                        </p>
                                                        <div className="space-y-3">
                                                            {cultivation.cultivationTasks.map((task) => {
                                                                const productionPlanTask = plot.productionPlans
                                                                    ?.flatMap((p) => p.currentProductionStages)
                                                                    .flatMap((stage) => stage.productionPlanTasks)
                                                                    .find((t) => t.productionPlanTaskId === task.productionPlanTaskId)

                                                                const taskStatus = task.completedAt
                                                                    ? "Completed"
                                                                    : task.actualStartDate
                                                                        ? "InProgress"
                                                                        : "Pending"

                                                                return (
                                                                    <div
                                                                        key={task.cultivationTaskId}
                                                                        className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 hover:shadow-sm transition-all"
                                                                    >
                                                                        <div className="flex items-start justify-between mb-3">
                                                                            <div className="flex-1">
                                                                                <p className="font-semibold text-neutral-900 text-sm">
                                                                                    {productionPlanTask?.taskName || "Unnamed Task"}
                                                                                </p>
                                                                                {productionPlanTask?.taskType && (
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className="mt-1.5 text-xs border-blue-200 text-blue-700"
                                                                                    >
                                                                                        {productionPlanTask.taskType}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <Badge
                                                                                variant="outline"
                                                                                className={`text-xs whitespace-nowrap ml-3 ${taskStatus === "Completed"
                                                                                    ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                                                                                    : taskStatus === "InProgress"
                                                                                        ? "border-amber-300 text-amber-700 bg-amber-50"
                                                                                        : "border-neutral-300 text-neutral-700"
                                                                                    }`}
                                                                            >
                                                                                {taskStatus}
                                                                            </Badge>
                                                                        </div>

                                                                        {productionPlanTask?.description && (
                                                                            <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
                                                                                {productionPlanTask.description}
                                                                            </p>
                                                                        )}

                                                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                                                            <div className="bg-white rounded p-2.5 border border-neutral-200">
                                                                                <p className="text-xs text-neutral-500 mb-0.5">Actual Start</p>
                                                                                <p className="text-sm font-medium text-neutral-900">
                                                                                    {task.actualStartDate
                                                                                        ? new Date(task.actualStartDate).toLocaleDateString()
                                                                                        : "Not started"}
                                                                                </p>
                                                                            </div>
                                                                            <div className="bg-white rounded p-2.5 border border-neutral-200">
                                                                                <p className="text-xs text-neutral-500 mb-0.5">Actual End</p>
                                                                                <p className="text-sm font-medium text-neutral-900">
                                                                                    {task.actualEndDate
                                                                                        ? new Date(task.actualEndDate).toLocaleDateString()
                                                                                        : "In progress"}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                                                            <div className="bg-emerald-50 rounded p-2.5 border border-emerald-200">
                                                                                <p className="text-xs text-emerald-700 mb-0.5">Material Cost</p>
                                                                                <p className="text-sm font-bold text-emerald-900">
                                                                                    {task.actualMaterialCost.toLocaleString("vi-VN")} ₫
                                                                                </p>
                                                                            </div>
                                                                            <div className="bg-blue-50 rounded p-2.5 border border-blue-200">
                                                                                <p className="text-xs text-blue-700 mb-0.5">Service Cost</p>
                                                                                <p className="text-sm font-bold text-blue-900">
                                                                                    {task.actualServiceCost.toLocaleString("vi-VN")} ₫
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        {task.completionPercentage > 0 && (
                                                                            <div className="mt-3">
                                                                                <div className="flex items-center justify-between mb-1.5">
                                                                                    <p className="text-xs text-neutral-600 font-medium">Progress</p>
                                                                                    <p className="text-xs font-bold text-emerald-600">
                                                                                        {task.completionPercentage}%
                                                                                    </p>
                                                                                </div>
                                                                                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                                                                                    <div
                                                                                        className="h-full bg-emerald-500 transition-all rounded-full"
                                                                                        style={{ width: `${task.completionPercentage}%` }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {task.isContingency && task.contingencyReason && (
                                                                            <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded">
                                                                                <p className="text-xs text-amber-800">
                                                                                    <span className="font-semibold">⚠️ Contingency:</span>{" "}
                                                                                    {task.contingencyReason}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="py-8 text-center bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                                                        <FileText className="size-8 mx-auto text-neutral-300 mb-2" />
                                                        <p className="text-sm text-neutral-500">No tasks recorded</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    )
}