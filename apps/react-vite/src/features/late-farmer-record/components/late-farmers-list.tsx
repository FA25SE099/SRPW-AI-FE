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
                <p className="text-gray-600">Unable to load data. User ID not available.</p>
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
                        placeholder="Search by farmer name or phone..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="text-sm text-gray-600">
                    Total: {totalCount} farmers
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
                            <p className="font-semibold">Failed to load farmers</p>
                            <p className="text-sm mt-1">{(error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error occurred'}</p>
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
                                        Farmer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phone Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Farm Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Plots
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Late Count
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {farmers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            No farmers found with late records
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
                                                    {farmer.lateCount} times
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${farmer.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {farmer.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewDetail(farmer.farmerId)}
                                                >
                                                    <Eye className="mr-1 h-4 w-4" />
                                                    Detail
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
                                Page {page} of {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={page >= totalPages}
                                >
                                    Next
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
                        <DialogTitle>Farmer Late Records Detail</DialogTitle>
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
                                <span className="font-semibold">Error Loading Detail</span>
                            </div>
                            <p className="mt-2 text-sm text-red-700">
                                {detailError instanceof Error ? detailError.message : 'Failed to load farmer detail'}
                            </p>
                        </div>
                    )}

                    {!isLoadingDetail && !detailError && !farmerDetail && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                            <p className="text-gray-600">No detail data available</p>
                        </div>
                    )}

                    {!isLoadingDetail && !detailError && farmerDetail && (
                        <div className="space-y-6" id="farmer-detail-description">
                            {/* Farmer Info */}
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Farmer Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Name:</span>{' '}
                                        <span className="font-medium text-gray-900">
                                            {farmerDetail.data.fullName || 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Phone:</span>{' '}
                                        <span className="font-medium text-gray-900">
                                            {farmerDetail.data.phoneNumber || 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Farm Code:</span>{' '}
                                        <span className="font-medium text-gray-900">
                                            {farmerDetail.data.farmCode || 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Total Late Count:</span>{' '}
                                        <span className="font-semibold text-red-600">
                                            {farmerDetail.data.totalLateCount} times
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-600">Address:</span>{' '}
                                        <span className="font-medium text-gray-900">
                                            {farmerDetail.data.address || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Late Records */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Late Records History
                                </h3>
                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Task
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Plot
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Group
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Season
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Notes
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {farmerDetail.data.lateRecords.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                        No late records found
                                                    </td>
                                                </tr>
                                            ) : (
                                                farmerDetail.data.lateRecords.map((record: LateFarmerRecordDTO) => (
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
                                                                Detail
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
