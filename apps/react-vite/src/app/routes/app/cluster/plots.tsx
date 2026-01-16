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
import { usePlotsAwaitingPolygon } from '@/features/plots/api/get-plots-awaiting-polygon';
import { ImportPlotsDialog } from '@/features/plots/components/import-plots-dialog';
import { PlotsDetailDialog } from '@/features/plots/components/plots-detail-dialog';
import { BulkCreatePlotsDialog } from '@/features/plots/components/bulk-create-plots-dialog';
import { useUser } from '@/lib/auth';

const Plots = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'out-season' | 'awaiting-polygon'>('all');
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedPlotId, setSelectedPlotId] = useState<string>();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showBulkCreateDialog, setShowBulkCreateDialog] = useState(false);
  const pageSize = 12;

  const user = useUser();

  const plotsQuery = usePlots({
    params: {
      pageNumber,
      pageSize,
      searchTerm: searchTerm || undefined,
      clusterManagerId: user.data?.id,
    },
  });

  const outSeasonQuery = usePlotsOutSeason({
    params: {
      currentDate: selectedDate,
      searchTerm: searchTerm || undefined,
      clusterManagerId: user.data?.id,
    },
    queryConfig: {
      enabled: activeTab === 'out-season',
    },
  });

  const awaitingPolygonQuery = usePlotsAwaitingPolygon({
    params: {
      pageNumber,
      pageSize,
      searchTerm: searchTerm || undefined,
      clusterManagerId: user.data?.id,
      sortBy: 'DaysWaiting',
      descending: true,
    },
    queryConfig: {
      enabled: activeTab === 'awaiting-polygon',
    },
  });

  const plotsResponse = plotsQuery.data;
  const isLoadingPlots = plotsQuery.isLoading;
  const isErrorPlots = plotsQuery.isError;

  const outSeasonResponse = outSeasonQuery.data;
  const isLoadingOutSeason = outSeasonQuery.isLoading;
  const isErrorOutSeason = outSeasonQuery.isError;

  const awaitingPolygonResponse = awaitingPolygonQuery.data;
  const isLoadingAwaitingPolygon = awaitingPolygonQuery.isLoading;
  const isErrorAwaitingPolygon = awaitingPolygonQuery.isError;

  const plots = plotsResponse?.data || [];
  const outSeasonPlots = outSeasonResponse?.data || [];
  const awaitingPolygonPlots = awaitingPolygonResponse?.data || [];
  const totalPages = activeTab === 'awaiting-polygon'
    ? (awaitingPolygonResponse?.totalPages || 0)
    : (plotsResponse?.totalPages || 0);
  const totalCount = activeTab === 'awaiting-polygon'
    ? (awaitingPolygonResponse?.totalCount || 0)
    : (plotsResponse?.totalCount || 0);

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      Active: 'bg-green-100 text-green-800 border-green-200',
      Inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      Emergency: 'bg-red-100 text-red-800 border-red-200',
      Locked: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const isError = isErrorPlots || isErrorOutSeason || isErrorAwaitingPolygon;

  if (isError) {
    return (
      <ContentLayout title="Quản Lý Thửa Đất">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 size-12 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Tải dữ liệu thừa đất thất bại
            </h3>
            <p className="mt-2 text-sm text-gray-600">Vui lòng thử lại sau</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-6"
            >
              Thử Lại
            </Button>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 p-3 shadow-lg">
              <MapPin className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Quản Lý Thửa Đất
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                Quản lý và giám sát tất cả thừa đất nông nghiệp trong cụm
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowBulkCreateDialog(true)}
              className="items-center gap-2 bg-green-600 text-white hover:bg-green-700"
            >
              <Plus className="size-4" />
              Thêm Thừa Đất
            </Button>
            <Button
              onClick={() => setShowImportDialog(true)}
              variant="outline"
              className="items-center gap-2 border-green-600 text-green-600 hover:bg-green-50"
            >
              <Upload className="size-4" />
              Nhập Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
              <FileText className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                Tổng Thừa Đất
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
                Hoạt Động
              </p>
              <p className="mt-1 text-2xl font-bold leading-snug text-gray-900">
                {plots.filter((p: any) => p.status === 'Active').length}
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
                Ngoài Mùa Vụ
              </p>
              <p className="mt-1 text-2xl font-bold leading-snug text-gray-900">
                {outSeasonPlots.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-yellow-100">
              <MapPin className="size-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                Chờ Đa Giác
              </p>
              <p className="mt-1 text-2xl font-bold leading-snug text-gray-900">
                {awaitingPolygonResponse?.totalCount || 0}
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
                Tổng Diện Tích
              </p>
              <p className="mt-1 text-2xl font-bold leading-snug text-gray-900">
                {plots.reduce((sum: number, p: any) => sum + p.area, 0).toFixed(1)}{' '}
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
            placeholder="Tìm kiếm theo Số Thừa, Số Tờ, hoặc tên nông dân..."
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
              placeholder="Thử với ngày..."
              className="rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm transition-colors focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(undefined)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Xóa ngày"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'all' | 'out-season' | 'awaiting-polygon')}
        className="space-y-6"
      >
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <FileText className="mr-2 size-4" />
            <span>Tất Cả ({plotsResponse?.totalCount || 0})</span>
          </TabsTrigger>
          <TabsTrigger
            value="out-season"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <AlertTriangle className="mr-2 size-4" />
            <span>Ngoài Mùa Vụ ({outSeasonPlots.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="awaiting-polygon"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <MapPin className="mr-2 size-4" />
            <span>Chờ Đa Giác ({awaitingPolygonResponse?.totalCount || 0})</span>
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
                Không tìm thấy thừa đất
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
                {searchTerm
                  ? 'Thử điều chỉnh tiêu chí tìm kiếm'
                  : 'Bắt đầu bằng cách tạo thừa đất đầu tiên'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setShowBulkCreateDialog(true)}
                  className="mt-6 gap-2 bg-green-600 font-semibold text-white hover:bg-green-700"
                >
                  <Plus className="size-4" />
                  Tạo thừa đất đầu tiên
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
                        Thông Tin Thừa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Nông Dân
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Diện Tích (ha)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Trạng Thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Đất / Giống
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Mùa Vụ Hoạt Động
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Thao Tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {plots.map((plot: any) => (
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
                            {plot.varietyName || 'Chưa có giống'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(plot.seasons?.filter((s: any) => s.isActive) || [])
                              .length > 0 ? (
                              (
                                plot.seasons?.filter((s: any) => s.isActive) || []
                              ).map((season: any) => (
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
                                Không có
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
                            Xem Chi Tiết
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
                    Hiển thị trang {pageNumber} / {totalPages} ({totalCount}{' '}
                    thừa đất)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!plotsResponse?.hasPrevious}
                      onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Trước
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
                      Sau
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
                  ? `Không có thừa đất ngoài mùa vụ vào ${selectedDate}`
                  : 'Tất cả đang trong mùa vụ'}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
                {selectedDate
                  ? 'Thử chọn ngày khác để kiểm tra'
                  : 'Không có thừa đất nào ngoài mùa vụ. Tất cả hoạt động canh tác đang hoạt động.'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Thông Tin Thừa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Nông Dân
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Diện Tích (ha)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Trạng Thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Đất / Giống
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Thao Tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {outSeasonPlots.map((plot: any) => (
                      <tr key={plot.plotId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
                              <MapPin className="size-5 text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                Thừa {plot.soThua ?? 'N/A'} /{' '}
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
                            {plot.varietyName || 'Chưa có giống'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => setSelectedPlotId(plot.plotId)}
                          >
                            Xem Chi Tiết
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

        <TabsContent value="awaiting-polygon">
          {isLoadingAwaitingPolygon ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" className="text-green-600" />
            </div>
          ) : awaitingPolygonPlots.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-white py-16 text-center">
              <MapPin className="mx-auto mb-4 size-16 text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900">
                Không có thừa đất chờ đa giác
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
                Tất cả thừa đất đã được gán ranh giới đa giác.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Thông Tin Thừa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Nông Dân
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Diện Tích (m²)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Trạng Thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Ngày Chờ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Phân Công
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {awaitingPolygonPlots.map((plot) => (
                      <tr key={plot.plotId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-yellow-100">
                              <MapPin className="size-5 text-yellow-600" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                Thừa {plot.soThua ?? 'N/A'} / {plot.soTo ?? 'N/A'}
                              </div>
                              {plot.soilType && (
                                <div className="text-xs text-gray-500">{plot.soilType}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {plot.farmerName || 'Không rõ'}
                          </div>
                          {plot.farmerPhone && (
                            <div className="text-xs text-gray-500">{plot.farmerPhone}</div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {plot.area.toFixed(2)}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Badge
                            className={`border ${plot.status === 'PendingPolygon'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-green-100 text-green-800 border-green-200'
                              }`}
                          >
                            {plot.status}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-gray-400" />
                            <span className={`text-sm font-medium ${plot.daysAwaitingPolygon > 7
                              ? 'text-red-600'
                              : plot.daysAwaitingPolygon > 3
                                ? 'text-yellow-600'
                                : 'text-gray-900'
                              }`}>
                              {plot.daysAwaitingPolygon} ngày
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {plot.hasActiveTask ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {plot.assignedToSupervisorName || 'Đã phân công'}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${plot.taskStatus === 'InProgress'
                                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                                    : plot.taskStatus === 'Completed'
                                      ? 'border-green-200 bg-green-50 text-green-700'
                                      : 'border-gray-200 bg-gray-50 text-gray-700'
                                    }`}
                                >
                                  {plot.taskStatus}
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs italic text-gray-400">
                              Chưa phân công
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {awaitingPolygonResponse && awaitingPolygonResponse.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                  <div className="text-sm text-gray-600">
                    Hiển thị trang {awaitingPolygonResponse.currentPage} / {awaitingPolygonResponse.totalPages} ({awaitingPolygonResponse.totalCount} thừa đất)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={awaitingPolygonResponse.currentPage === 1}
                      onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={awaitingPolygonResponse.currentPage === awaitingPolygonResponse.totalPages}
                      onClick={() => setPageNumber((p) => Math.min(awaitingPolygonResponse.totalPages, p + 1))}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
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

      <BulkCreatePlotsDialog
        open={showBulkCreateDialog}
        onOpenChange={setShowBulkCreateDialog}
      />

      <ImportPlotsDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        clusterManagerId={user.data?.id}
      />
    </div>
  );
};

export const Component = Plots;
export default Plots;
