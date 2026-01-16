import { useState } from 'react';
import { Search, AlertTriangle, Eye } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useLatePlots } from '../api';
import { PlotWithLateCountDTO, PlotStatus } from '../types';
import { CultivationPlanDetailDialog } from '@/features/supervisor/components/cultivation-plan-detail-dialog';

interface LatePlotsListProps {
    agronomyExpertId?: string;
    supervisorId?: string;
}

const getPlotStatusLabel = (status: PlotStatus): string => {
    switch (status) {
        case PlotStatus.Active:
            return 'Hoạt động';
        case PlotStatus.Inactive:
            return 'Không hoạt động';
        case PlotStatus.Emergency:
            return 'Khẩn cấp';
        case PlotStatus.Locked:
            return 'Đã khóa';
        case PlotStatus.PendingPolygon:
            return 'Chờ đa giác';
        default:
            return 'Không xác định';
    }
};

const getPlotStatusColor = (status: PlotStatus): string => {
    switch (status) {
        case PlotStatus.Active:
            return 'bg-green-100 text-green-800';
        case PlotStatus.Inactive:
            return 'bg-gray-100 text-gray-800';
        case PlotStatus.Emergency:
            return 'bg-red-100 text-red-800';
        case PlotStatus.Locked:
            return 'bg-orange-100 text-orange-800';
        case PlotStatus.PendingPolygon:
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const LatePlotsList = ({
    agronomyExpertId,
    supervisorId,
}: LatePlotsListProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [showCultivationPlanDialog, setShowCultivationPlanDialog] = useState(false);
    const [selectedPlot, setSelectedPlot] = useState<PlotWithLateCountDTO | null>(null);
    const pageSize = 10;

    const { data, isLoading, error } = useLatePlots({
        params: {
            agronomyExpertId,
            supervisorId,
            pageNumber: page,
            pageSize,
            searchTerm: searchTerm || undefined,
        },
    });

    // Log errors for debugging
    if (error) {
        console.error('Late Plots API Error:', error);
    }

    // Show message if neither ID is provided
    if (!agronomyExpertId && !supervisorId) {
        return (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <p className="text-gray-600">Không thể tải dữ liệu. ID người dùng không khả dụng.</p>
            </div>
        );
    }

    const plots = data?.data || [];
    const totalPages = data?.totalPages || 1;
    const totalCount = data?.totalCount || 0;

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setPage(1); // Reset to first page on search
    };

    const handleViewCultivationPlan = (plot: PlotWithLateCountDTO) => {
        setSelectedPlot(plot);
        setShowCultivationPlanDialog(true);
    };

    const handleCloseCultivationPlanDialog = () => {
        setShowCultivationPlanDialog(false);
        setSelectedPlot(null);
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên nông dân, Số Thửa, hoặc Số Tờ..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="text-sm text-gray-600">
                    Tổng: {totalCount} thửa
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center py-8">
                    <Spinner size="lg" />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-800">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Không thể tải dữ liệu thửa đất</p>
                            <p className="text-sm mt-1">{(error as any)?.response?.data?.message || (error as any)?.message || 'Đã xảy ra lỗi không xác định'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Plots Table */}
            {!isLoading && !error && (
                <>
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mã Thửa
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nông Dân
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số Thửa / Số Tờ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Diện tích (ha)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loại Đất
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số Lần Trễ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng Thái
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hành Động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {plots.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            Không tìm thấy thửa đất có hồ sơ trễ hạn
                                        </td>
                                    </tr>
                                ) : (
                                    plots.map((plot: PlotWithLateCountDTO) => (
                                        <tr key={plot.plotId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                {plot.plotId.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {plot.farmerName || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {plot.soThua && plot.soTo
                                                    ? `${plot.soThua} / ${plot.soTo}`
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {plot.area.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {plot.soilType || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${plot.lateCount > 5
                                                        ? 'bg-red-100 text-red-800'
                                                        : plot.lateCount > 2
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                >
                                                    {plot.lateCount} lần
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPlotStatusColor(
                                                        plot.status
                                                    )}`}
                                                >
                                                    {getPlotStatusLabel(plot.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewCultivationPlan(plot)}
                                                    disabled={!plot.groupId}
                                                >
                                                    <Eye className="mr-1 h-4 w-4" />
                                                    Chi tiết
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Trang {page} / {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Trước
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={page >= totalPages}
                                >
                                    Tiếp
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Cultivation Plan Detail Dialog */}
            {selectedPlot && selectedPlot.groupId && (
                <CultivationPlanDetailDialog
                    isOpen={showCultivationPlanDialog}
                    onClose={handleCloseCultivationPlanDialog}
                    plotId={selectedPlot.plotId}
                    groupId={selectedPlot.groupId}
                    plotName={`Tờ ${selectedPlot.soTo}, Thửa ${selectedPlot.soThua}`}
                />
            )}
        </div>
    );
};
