import { useState } from 'react';
import { Search, AlertTriangle, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useLateFarmers, useLateFarmerDetail } from '../api';
import { FarmerWithLateCountDTO, LateFarmerRecordDTO } from '../types';
import { CultivationPlanDetailDialog } from '@/features/supervisor/components/cultivation-plan-detail-dialog';

interface LateFarmersListProps {
    agronomyExpertId?: string;
    supervisorId?: string;
}

export const LateFarmersList = ({
    agronomyExpertId,
    supervisorId,
}: LateFarmersListProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
    const [showCultivationPlanDialog, setShowCultivationPlanDialog] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<LateFarmerRecordDTO | null>(null);
    const pageSize = 10;

    const { data, isLoading, error } = useLateFarmers({
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
        console.error('Late Farmers API Error:', error);
    }

    const { data: farmerDetail, isLoading: isLoadingDetail, error: detailError } = useLateFarmerDetail({
        farmerId: selectedFarmerId || '',
        queryConfig: {
            enabled: !!selectedFarmerId,
        },
    });

    // Debug logging for detail dialog
    if (selectedFarmerId && farmerDetail) {
        console.log('Farmer Detail Response:', farmerDetail);
    }
    if (detailError) {
        console.error('Late Farmer Detail API Error:', detailError);
    }

    // Show message if neither ID is provided
    if (!agronomyExpertId && !supervisorId) {
        return (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <p className="text-gray-600">Không thể tải dữ liệu. ID người dùng không khả dụng.</p>
            </div>
        );
    }

    const farmers = data?.data || [];
    const totalPages = data?.totalPages || 1;
    const totalCount = data?.totalCount || 0;

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setPage(1); // Reset to first page on search
    };

    const handleViewDetail = (farmerId: string) => {
        setSelectedFarmerId(farmerId);
    };

    const handleCloseDetail = () => {
        setSelectedFarmerId(null);
    };

    const handleViewCultivationPlan = (record: LateFarmerRecordDTO) => {
        setSelectedRecord(record);
        setShowCultivationPlanDialog(true);
    };

    const handleCloseCultivationPlanDialog = () => {
        setShowCultivationPlanDialog(false);
        setSelectedRecord(null);
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="text-sm text-gray-600">
                    Tổng: {totalCount} nông dân
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
                            <p className="font-semibold">Không thể tải dữ liệu nông dân</p>
                            <p className="text-sm mt-1">{(error as any)?.response?.data?.message || (error as any)?.message || 'Đã xảy ra lỗi không xác định'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Farmers Table */}
            {!isLoading && !error && (
                <>
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nông Dân
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số Điện Thoại
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mã Trang Trại
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thửa Đất
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
                                {farmers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            Không tìm thấy nông dân có hồ sơ trễ hạn
                                        </td>
                                    </tr>
                                ) : (
                                    farmers.map((farmer: FarmerWithLateCountDTO) => (
                                        <tr key={farmer.farmerId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {farmer.fullName || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {farmer.address || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {farmer.phoneNumber || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {farmer.farmCode || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {farmer.plotCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${farmer.lateCount > 5
                                                        ? 'bg-red-100 text-red-800'
                                                        : farmer.lateCount > 2
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                >
                                                    {farmer.lateCount} lần
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${farmer.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {farmer.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewDetail(farmer.farmerId)}
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

            {/* Detail Dialog */}
            <Dialog open={!!selectedFarmerId} onOpenChange={handleCloseDetail}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="farmer-detail-description">
                    <DialogHeader>
                        <DialogTitle>Chi Tiết Hồ Sơ Trễ Hạn Của Nông Dân</DialogTitle>
                    </DialogHeader>

                    {isLoadingDetail && (
                        <div className="flex justify-center py-8">
                            <Spinner size="lg" />
                        </div>
                    )}

                    {detailError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <div className="flex items-center gap-2 text-red-800">
                                <AlertTriangle className="h-5 w-5" />
                                <span className="font-semibold">Lỗi Khi Tải Chi Tiết</span>
                            </div>
                            <p className="mt-2 text-sm text-red-700">
                                {detailError instanceof Error ? detailError.message : 'Không thể tải chi tiết nông dân'}
                            </p>
                        </div>
                    )}

                    {!isLoadingDetail && !detailError && !farmerDetail && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                            <p className="text-gray-600">Không có dữ liệu chi tiết</p>
                        </div>
                    )}

                    {!isLoadingDetail && !detailError && farmerDetail && (
                        <div className="space-y-6" id="farmer-detail-description">
                            {/* Farmer Info */}
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Thông Tin Nông Dân
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Tên:</span>{' '}
                                        <span className="font-medium text-gray-900">
                                            {farmerDetail.fullName || 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Điện thoại:</span>{' '}
                                        <span className="font-medium text-gray-900">
                                            {farmerDetail.phoneNumber || 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Mã Trang Trại:</span>{' '}
                                        <span className="font-medium text-gray-900">
                                            {farmerDetail.farmCode || 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Tổng Số Lần Trễ:</span>{' '}
                                        <span className="font-semibold text-red-600">
                                            {farmerDetail.totalLateCount} lần
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-600">Địa chỉ:</span>{' '}
                                        <span className="font-medium text-gray-900">
                                            {farmerDetail.address || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Late Records */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Lịch Sử Hồ Sơ Trễ Hạn
                                </h3>
                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Ngày
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Công việc
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Thửa
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Nhóm
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Mùa vụ
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Ghi chú
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                    Hành động
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {farmerDetail.lateRecords?.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                        Không tìm thấy hồ sơ trễ hạn
                                                    </td>
                                                </tr>
                                            ) : (
                                                farmerDetail.lateRecords?.map((record: LateFarmerRecordDTO) => (
                                                    <tr key={record.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                            {new Date(record.recordedAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {record.taskName || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {record.soThua && record.soTo
                                                                ? `Thửa ${record.soThua} - Tờ ${record.soTo}`
                                                                : '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {record.groupName || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {record.seasonName || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {record.notes || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleViewCultivationPlan(record)}
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
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Cultivation Plan Detail Dialog */}
            {selectedRecord && (
                <CultivationPlanDetailDialog
                    isOpen={showCultivationPlanDialog}
                    onClose={handleCloseCultivationPlanDialog}
                    plotId={selectedRecord.plotId}
                    groupId={selectedRecord.groupId}
                    plotName={`Tờ ${selectedRecord.soTo}, Thửa ${selectedRecord.soThua}`}
                />
            )}
        </div>
    );
};
