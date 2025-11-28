import {
  MapPin,
  Search,
  AlertTriangle,
  Plus,
  FileText,
  Calendar,
  TrendingUp,
  Upload,
} from 'lucide-react';
import { useState } from 'react';

import { ContentLayout } from '@/components/layouts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlots } from '@/features/plots/api/get-all-plots';
import { usePlotsOutSeason } from '@/features/plots/api/get-plots-out-season';
import { ImportPlotsDialog } from '@/features/plots/components/import-plots-dialog';
import { PlotsDetailDialog } from '@/features/plots/components/plots-detail-dialog';

const Plots = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'out-season'>('all');
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedPlotId, setSelectedPlotId] = useState<string>();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const pageSize = 12;

  const {
    data: plotsResponse,
    isLoading: isLoadingPlots,
    isError: isErrorPlots,
  } = usePlots({
    params: { pageNumber, pageSize, searchTerm: searchTerm || undefined },
  });

  const {
    data: outSeasonResponse,
    isLoading: isLoadingOutSeason,
    isError: isErrorOutSeason,
  } = usePlotsOutSeason({
    params: {
      currentDate: selectedDate,
      searchTerm: searchTerm || undefined,
    },
    queryConfig: {
      enabled: activeTab === 'out-season',
    },
  });

  const plots = plotsResponse?.data || [];
  const outSeasonPlots = outSeasonResponse || [];
  const totalPages = plotsResponse?.totalPages || 0;
  const totalCount = plotsResponse?.totalCount || 0;

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      Active: 'bg-green-100 text-green-800 border-green-200',
      Inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      Emergency: 'bg-red-100 text-red-800 border-red-200',
      Locked: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const isError = isErrorPlots || isErrorOutSeason;

  if (isError) {
    return (
      <ContentLayout title="Plots Management">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 size-12 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Failed to load plots
            </h3>
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
    );
  }

  return (
    <ContentLayout title="Plots Management">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-snug text-gray-900">
            Plots
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and monitor all farm plots
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowImportDialog(true)}
            variant="outline"
            className="items-center gap-2 border-green-600 text-green-600 hover:bg-green-50"
          >
            <Upload className="size-4" />
            Import Excel
          </Button>
          <Button className="items-center gap-2 bg-green-600 text-white hover:bg-green-700">
            <Plus className="size-4" />
            Add Plot
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
              <FileText className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                Total Plots
              </p>
              <p className="mt-1 text-2xl font-bold leading-snug text-gray-900">
                {totalCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
              <TrendingUp className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                Active
              </p>
              <p className="mt-1 text-2xl font-bold leading-snug text-gray-900">
                {plots.filter((p) => p.status === 'Active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="size-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                Out of Season
              </p>
              <p className="mt-1 text-2xl font-bold leading-snug text-gray-900">
                {outSeasonPlots.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
              <MapPin className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                Total Area
              </p>
              <p className="mt-1 text-2xl font-bold leading-snug text-gray-900">
                {plots.reduce((sum, p) => sum + p.area, 0).toFixed(1)}{' '}
                <span className="text-base font-normal text-gray-600">ha</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Date Filter */}
      <div className="mb-6 flex gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Sở Thửa, Sở Tờ, or farmer name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPageNumber(1);
            }}
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm transition-colors focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {activeTab === 'out-season' && (
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={selectedDate || ''}
              onChange={(e) => setSelectedDate(e.target.value || undefined)}
              placeholder="Test with date..."
              className="rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm transition-colors focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
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

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'all' | 'out-season')}
        className="space-y-6"
      >
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <FileText className="mr-2 size-4" />
            <span>All Plots ({totalCount})</span>
          </TabsTrigger>
          <TabsTrigger
            value="out-season"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <AlertTriangle className="mr-2 size-4" />
            <span>Out of Season ({outSeasonPlots.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {isLoadingPlots ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" className="text-green-600" />
            </div>
          ) : plots.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-white py-16 text-center">
              <MapPin className="mx-auto mb-4 size-16 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900">
                No plots found
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'Start by creating your first plot'}
              </p>
              {!searchTerm && (
                <Button className="mt-6 gap-2 bg-green-600 font-semibold text-white hover:bg-green-700">
                  <Plus className="size-4" />
                  Create your first plot
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Plot Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Farmer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Area (ha)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Soil / Variety
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Active Seasons
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {plots.map((plot) => (
                      <tr key={plot.plotId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
                              <MapPin className="size-5 text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                Plot {plot.soThua ?? 'N/A'} /{' '}
                                {plot.soTo ?? 'N/A'}
                              </div>
                              <div className="font-mono text-xs text-gray-500">
                                {plot.plotId.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {plot.farmerName}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {plot.area.toFixed(2)}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Badge
                            className={`border ${getStatusColor(plot.status)}`}
                          >
                            {plot.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {plot.soilType}
                          </div>
                          <div className="text-xs text-gray-500">
                            {plot.varietyName || 'No variety'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(plot.seasons?.filter((s) => s.isActive) || [])
                              .length > 0 ? (
                              (
                                plot.seasons?.filter((s) => s.isActive) || []
                              ).map((season) => (
                                <Badge
                                  key={season.seasonId}
                                  variant="outline"
                                  className="border-blue-200 bg-blue-50 text-xs text-blue-700"
                                >
                                  {season.seasonName}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs italic text-gray-400">
                                None
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => setSelectedPlotId(plot.plotId)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                  <div className="text-sm text-gray-600">
                    Showing page {pageNumber} of {totalPages} ({totalCount}{' '}
                    total plots)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!plotsResponse?.hasPrevious}
                      onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!plotsResponse?.hasNext}
                      onClick={() =>
                        setPageNumber((p) => Math.min(totalPages, p + 1))
                      }
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="out-season">
          {isLoadingOutSeason ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" className="text-green-600" />
            </div>
          ) : outSeasonPlots.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-white py-16 text-center">
              <Calendar className="mx-auto mb-4 size-16 text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedDate
                  ? `No plots out of season on ${selectedDate}`
                  : 'All plots in season'}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
                {selectedDate
                  ? 'Try selecting a different date to test'
                  : 'No plots are currently out of season. All farming operations are active.'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Plot Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Farmer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Area (ha)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Soil / Variety
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {outSeasonPlots.map((plot) => (
                      <tr key={plot.plotId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
                              <MapPin className="size-5 text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                Plot {plot.soThua ?? 'N/A'} /{' '}
                                {plot.soTo ?? 'N/A'}
                              </div>
                              <div className="font-mono text-xs text-gray-500">
                                {plot.plotId.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {plot.farmerName}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {plot.area.toFixed(2)}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Badge
                            className={`border ${getStatusColor(plot.status)}`}
                          >
                            {plot.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {plot.soilType}
                          </div>
                          <div className="text-xs text-gray-500">
                            {plot.varietyName || 'No variety'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => setSelectedPlotId(plot.plotId)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
  );
};

export const Component = Plots;
export default Plots;
