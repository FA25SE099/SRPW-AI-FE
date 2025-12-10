import { useState } from 'react';
import { Search, AlertTriangle } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useLatePlots } from '../api';
import { PlotWithLateCountDTO, PlotStatus } from '../types';

interface LatePlotsListProps {
    agronomyExpertId?: string;
    supervisorId?: string;
}

const getPlotStatusLabel = (status: PlotStatus): string => {
    switch (status) {
        case PlotStatus.Active:
            return 'Active';
        case PlotStatus.Inactive:
            return 'Inactive';
        case PlotStatus.Emergency:
            return 'Emergency';
        case PlotStatus.Locked:
            return 'Locked';
        case PlotStatus.PendingPolygon:
            return 'Pending Polygon';
        default:
            return 'Unknown';
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
                <p className="text-gray-600">Unable to load data. User ID not available.</p>
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

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search by farmer name, Số Thửa, or Số Tờ..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="text-sm text-gray-600">
                    Total: {totalCount} plots
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
                            <p className="font-semibold">Failed to load plots</p>
                            <p className="text-sm mt-1">{(error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error occurred'}</p>
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
                                        Plot ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Farmer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số Thửa / Số Tờ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Area (ha)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Soil Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Late Count
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {plots.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            No plots found with late records
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
                                                    {plot.lateCount} times
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
        </div>
    );
};
