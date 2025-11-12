import { useState } from "react"
import { ContentLayout } from "@/components/layouts"
import { MapPin, Search, AlertTriangle, Plus, FileText, Calendar, TrendingUp, Upload } from "lucide-react"
import { usePlots, type PlotDTO } from "@/features/plots/api/get-all-plots"
import { usePlotsOutSeason } from "@/features/plots/api/get-plots-out-season"
import { PlotsDetailDialog } from "@/features/plots/components/plots-detail-dialog"
import { ImportPlotsDialog } from "@/features/plots/components/import-plots-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Plots = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [pageNumber, setPageNumber] = useState(1)
    const [activeTab, setActiveTab] = useState<"all" | "out-season">("all")
    const [selectedDate, setSelectedDate] = useState<string>()
    const [selectedPlotId, setSelectedPlotId] = useState<string>()
    const [showImportDialog, setShowImportDialog] = useState(false)
    const pageSize = 12

    const { data: plotsResponse, isLoading: isLoadingPlots, isError: isErrorPlots } = usePlots({
        params: { pageNumber, pageSize, searchTerm: searchTerm || undefined },
    })

    const { data: outSeasonResponse, isLoading: isLoadingOutSeason, isError: isErrorOutSeason } = usePlotsOutSeason({
        params: {
            currentDate: selectedDate,
            searchTerm: searchTerm || undefined,
        },
        queryConfig: {
            enabled: activeTab === "out-season",
        },
    })

    const plots = plotsResponse?.data || []
    const outSeasonPlots = outSeasonResponse || []
    const totalPages = plotsResponse?.totalPages || 0
    const totalCount = plotsResponse?.totalCount || 0

    const getStatusColor = (status: string) => {
        const statusMap: Record<string, string> = {
            Active: "bg-green-100 text-green-800 border-green-200",
            Inactive: "bg-gray-100 text-gray-800 border-gray-200",
            Emergency: "bg-red-100 text-red-800 border-red-200",
            Locked: "bg-orange-100 text-orange-800 border-orange-200",
        }
        return statusMap[status] || "bg-gray-100 text-gray-800 border-gray-200"
    }

    const PlotCard = ({ plot }: { plot: PlotDTO }) => (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-150 flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-green-100">
                        <MapPin className="size-6 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-gray-900 leading-snug">
                            Plot {plot.soThua ?? 'N/A'} / {plot.soTo ?? 'N/A'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 font-mono break-all">
                            {plot.plotId}
                        </p>
                    </div>
                </div>
                <Badge className={`border ${getStatusColor(plot.status)} flex-shrink-0`}>
                    {plot.status}
                </Badge>
            </div>

            <div className="flex-1 space-y-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="size-4 text-green-600 flex-shrink-0" />
                    <span className="font-medium">{plot.area.toFixed(2)} hectares</span>
                </div>

                <div className="text-xs space-y-2">
                    <div>
                        <p className="text-gray-600 uppercase tracking-wide font-medium mb-1">Farmer</p>
                        <p className="text-gray-900 font-semibold">{plot.farmerName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-gray-600 uppercase tracking-wide font-medium mb-1">Soil Type</p>
                            <p className="text-gray-900 font-semibold">{plot.soilType}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 uppercase tracking-wide font-medium mb-1">Variety</p>
                            <p className="text-gray-900 font-semibold">{plot.varietyName || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="min-h-[44px]">
                    {(plot.seasons?.filter(s => s.isActive) || []).length > 0 && (
                        <div className="text-xs">
                            <p className="text-gray-600 flex items-center gap-1 mb-2">
                                <Calendar className="size-3" />
                                <span className="uppercase tracking-wide font-medium">Active Seasons</span>
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {(plot.seasons?.filter(s => s.isActive) || []).map(season => (
                                    <Badge
                                        key={season.seasonId}
                                        variant="outline"
                                        className="text-xs border-blue-200 text-blue-700 bg-blue-50"
                                    >
                                        {season.seasonName}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50 font-medium"
                    onClick={() => setSelectedPlotId(plot.plotId)}
                >
                    View Details
                </Button>
            </div>
        </div>
    )

    const isError = isErrorPlots || isErrorOutSeason

    if (isError) {
        return (
            <ContentLayout title="Plots Management">
                <div className="flex h-96 items-center justify-center">
                    <div className="text-center">
                        <AlertTriangle className="mx-auto mb-4 size-12 text-red-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Failed to load plots</h3>
                        <p className="mt-2 text-sm text-gray-600">Please try again later</p>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="mt-6"
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            </ContentLayout>
        )
    }

    return (
        <ContentLayout title="Plots Management">
            {/* Page Header */}
            <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 mb-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-snug">Plots</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage and monitor all farm plots
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => setShowImportDialog(true)}
                        variant="outline"
                        className="gap-2 border-green-600 text-green-600 hover:bg-green-50"
                    >
                        <Upload className="size-4" />
                        Import Excel
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                        <Plus className="size-4" />
                        Add Plot
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                            <FileText className="size-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Plots</p>
                            <p className="text-2xl font-bold text-gray-900 leading-snug mt-1">{totalCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                            <TrendingUp className="size-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Active</p>
                            <p className="text-2xl font-bold text-gray-900 leading-snug mt-1">
                                {plots.filter(p => p.status === 'Active').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-orange-100">
                            <AlertTriangle className="size-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Out of Season</p>
                            <p className="text-2xl font-bold text-gray-900 leading-snug mt-1">
                                {outSeasonPlots.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                            <MapPin className="size-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Area</p>
                            <p className="text-2xl font-bold text-gray-900 leading-snug mt-1">
                                {plots.reduce((sum, p) => sum + p.area, 0).toFixed(1)} <span className="text-base font-normal text-gray-600">ha</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar & Date Filter */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Sở Thửa, Sở Tờ, or farmer name..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setPageNumber(1)
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                    />
                </div>

                {activeTab === "out-season" && (
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                            type="date"
                            value={selectedDate || ''}
                            onChange={(e) => setSelectedDate(e.target.value || undefined)}
                            placeholder="Test with date..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                        />
                        {selectedDate && (
                            <button
                                onClick={() => setSelectedDate(undefined)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                title="Clear date"
                            >
                                ×
                            </button>
                        )}
                    </div>
                )}
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "out-season")} className="space-y-6">
                <TabsList className="bg-gray-100 p-1">
                    <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        <FileText className="size-4 mr-2" />
                        <span>All Plots ({totalCount})</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="out-season"
                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        <AlertTriangle className="size-4 mr-2" />
                        <span>Out of Season ({outSeasonPlots.length})</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    {isLoadingPlots ? (
                        <div className="flex items-center justify-center py-16">
                            <Spinner size="lg" className="text-green-600" />
                        </div>
                    ) : plots.length === 0 ? (
                        <div className="bg-white border border-gray-200 border-dashed rounded-lg py-16 text-center">
                            <MapPin className="size-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-semibold text-gray-900">No plots found</h3>
                            <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
                                {searchTerm ? 'Try adjusting your search criteria' : 'Start by creating your first plot'}
                            </p>
                            {!searchTerm && (
                                <Button
                                    className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
                                >
                                    <Plus className="size-4" />
                                    Create your first plot
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {plots.map((plot) => (
                                    <PlotCard key={plot.plotId} plot={plot} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!plotsResponse?.hasPrevious}
                                        onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-gray-600 font-medium px-4">
                                        Page {pageNumber} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!plotsResponse?.hasNext}
                                        onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>

                <TabsContent value="out-season">
                    {isLoadingOutSeason ? (
                        <div className="flex items-center justify-center py-16">
                            <Spinner size="lg" className="text-green-600" />
                        </div>
                    ) : outSeasonPlots.length === 0 ? (
                        <div className="bg-white border border-gray-200 border-dashed rounded-lg py-16 text-center">
                            <Calendar className="size-16 mx-auto mb-4 text-green-400" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                {selectedDate ? `No plots out of season on ${selectedDate}` : 'All plots in season'}
                            </h3>
                            <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
                                {selectedDate
                                    ? 'Try selecting a different date to test'
                                    : 'No plots are currently out of season. All farming operations are active.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {outSeasonPlots.map((plot) => (
                                <PlotCard key={plot.plotId} plot={plot} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <PlotsDetailDialog
                plotId={selectedPlotId!}
                open={!!selectedPlotId}
                onOpenChange={(open) => !open && setSelectedPlotId(undefined)}
            />

            <ImportPlotsDialog
                open={showImportDialog}
                onOpenChange={setShowImportDialog}
            />
        </ContentLayout>
    )
}

export const Component = Plots
export default Plots