import { useState } from 'react';
import { AlertTriangle, Search, Filter, MapPin, FileText } from 'lucide-react';
import { useReports } from '../api/get-reports';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { ReportCard } from './ReportCard';
import { ReportSeverity, ReportStatus, ReportType } from '../types';

type ReportsListProps = {
    onViewDetails: (reportId: string) => void;
    onResolve: (reportId: string, reportTitle: string) => void;
};

export const ReportsList = ({ onViewDetails, onResolve }: ReportsListProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedSeverity, setSelectedSeverity] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);
    const pageSize = 10;

    const { data, isLoading } = useReports({
        params: {
            currentPage,
            pageSize,
            searchTerm: searchTerm || undefined,
            status: selectedStatus || undefined,
            severity: selectedSeverity || undefined,
            reportType: selectedType || undefined,
        },
    });

    const reports = data?.data || [];
    const totalPages = data?.totalPages || 1;
    const totalCount = data?.totalCount || 0;

    // Calculate statistics
    const pendingCount = reports.filter(r => r.status === 'Pending').length;
    const criticalCount = reports.filter(r => r.severity === 'Critical').length;
    const totalArea = reports.reduce((sum, r) => sum + r.plotArea, 0);

    const clearFilters = () => {
        setSelectedStatus('');
        setSelectedSeverity('');
        setSelectedType('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    if (isLoading) {
        return (
            <div className="flex h-48 items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header Stats */}
            {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Reports</p>
                            <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending Action</p>
                            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-yellow-500" />
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                            <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                </div>
            </div> */}

            {/* Search and Filters */}
            <div className="space-y-3">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm báo cáo theo tên lô, tiêu đề hoặc mô tả..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="whitespace-nowrap"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Bộ Lọc
                    </Button>
                </div>

                {showFilters && (
                    <div className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => {
                                        setSelectedStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">Tất Cả Trạng Thái</option>
                                    <option value="Pending">Chờ Xử Lý</option>
                                    <option value="UnderReview">Đang Xem Xét</option>
                                    <option value="Resolved">Đã Giải Quyết</option>
                                    <option value="Rejected">Đã Từ Chối</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mức Độ</label>
                                <select
                                    value={selectedSeverity}
                                    onChange={(e) => {
                                        setSelectedSeverity(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">Tất Cả Mức Độ</option>
                                    <option value="Critical">Khẩn Cấp</option>
                                    <option value="High">Cao</option>
                                    <option value="Medium">Trung Bình</option>
                                    <option value="Low">Thấp</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => {
                                        setSelectedType(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">Tất Cả Loại</option>
                                    <option value="Pest">Sâu Bệnh</option>
                                    <option value="Weather">Thời Tiết</option>
                                    <option value="Disease">Bệnh</option>
                                    <option value="Other">Khác</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="w-full"
                                >
                                    Xóa Bộ Lọc
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Reports List */}
            <div className="space-y-3">
                {reports.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Không tìm thấy báo cáo</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                        </p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <ReportCard
                            key={report.id}
                            report={report}
                            onViewDetails={onViewDetails}
                            onResolve={onResolve}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                    <p className="text-sm text-gray-600">
                        Trang {currentPage} / {totalPages} • Tổng {totalCount} báo cáo
                    </p>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            variant="outline"
                            size="sm"
                        >
                            Trước
                        </Button>
                        <Button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            size="sm"
                        >
                            Sau
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

