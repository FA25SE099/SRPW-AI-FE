
import { useState } from 'react';

import { AlertTriangle,Search,TrendingUp, BarChart3, FileText, FileSpreadsheet, Calendar, Eye } from 'lucide-react';
import { ContentLayout } from '@/components/layouts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useSupervisorReports } from '@/features/supervisor/api/get-supervisor-reports';
import { Head } from '@/components/seo/head';
import { formatDate } from '@/utils/format';
import { ReportDetailDialog } from '@/features/reports/components';

const getFileTypeIcon = (type: string) => {
    switch (type) {
        case 'PDF':
            return <FileText className="h-5 w-5" />;
        case 'Excel':
            return <FileSpreadsheet className="h-5 w-5" />;
        default:
            return <FileText className="h-5 w-5" />;
    }
};

const getFileTypeColor = (type: string) => {
    switch (type) {
        case 'PDF':
            return 'text-red-600 bg-red-50';
        case 'Excel':
            return 'text-green-600 bg-green-50';
        default:
            return 'text-gray-600 bg-gray-50';
    }
};

const getReportTypeColor = (name: string) => {
    // Use different colors based on report name keywords
    if (name.toLowerCase().includes('production') || name.toLowerCase().includes('summary')) {
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    if (name.toLowerCase().includes('performance') || name.toLowerCase().includes('farmer')) {
        return 'bg-green-100 text-green-800 border-green-300';
    }
    if (name.toLowerCase().includes('material') || name.toLowerCase().includes('usage')) {
        return 'bg-purple-100 text-purple-800 border-purple-300';
    }
    if (name.toLowerCase().includes('yield') || name.toLowerCase().includes('comparison')) {
        return 'bg-orange-100 text-orange-800 border-orange-300';
    }
    if (name.toLowerCase().includes('financial')) {
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300';
};

const ReportsRoute = () => {
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(20);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>();
    const [severityFilter, setSeverityFilter] = useState<string | undefined>();
    const [reportTypeFilter, setReportTypeFilter] = useState<string | undefined>();
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

    const { data, isLoading, isError } = useSupervisorReports({
        params: {
            currentPage: pageNumber,
            pageSize,
            searchTerm: searchTerm || undefined,
            status: statusFilter,
            severity: severityFilter,
            reportType: reportTypeFilter,
        },
    });

    const reports = data?.data || [];
    const totalPages = data?.totalPages || 0;
    const totalCount = data?.totalCount || 0;
    const currentPage = data?.currentPage || 1;

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'resolved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <ContentLayout title="Emergency Reports">
                <Head title="Emergency Reports" />
                <div className="flex h-96 items-center justify-center">
                    <Spinner size="lg" className="text-green-600" />
                </div>
            </ContentLayout>
        );
    }

    if (isError) {
        return (
            <ContentLayout title="Emergency Reports">
                <Head title="Emergency Reports" />
                <div className="flex h-96 items-center justify-center">
                    <div className="text-center">
                        <p className="text-lg font-semibold text-red-500">
                            Failed to load reports
                        </p>
                        <p className="mt-2 text-muted-foreground">Please try again later</p>
                    </div>
                </div>
            </ContentLayout>
        );
    }

    const handleViewDetails = (reportId: string) => {
        setSelectedReportId(reportId);
    };

    return (
        <>
            <ContentLayout title="Emergency Reports">
                <Head title="Emergency Reports" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold leading-snug text-gray-900">
                            Emergency Reports
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            View and manage emergency reports from your farmers
                        </p>
                    </div>
                </div>
                

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
                                <AlertTriangle className="size-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                                    Total Reports
                                </p>
                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {totalCount}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-yellow-100">
                                <FileText className="size-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                                    Pending
                                </p>
                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {reports.filter((r: any) => r.status === 'Pending').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                                <FileText className="size-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                                    Resolved
                                </p>
                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {reports.filter((r: any) => r.status === 'Resolved').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
                                <AlertTriangle className="size-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                                    Critical
                                </p>
                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {reports.filter((r: any) => r.severity === 'Critical').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="relative max-w-md flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPageNumber(1);
                                }}
                                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm transition-colors focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={statusFilter || ''}
                            onChange={(e) => {
                                setStatusFilter(e.target.value || undefined);
                                setPageNumber(1);
                            }}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
                        >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Resolved">Resolved</option>
                        </select>

                        <select
                            value={severityFilter || ''}
                            onChange={(e) => {
                                setSeverityFilter(e.target.value || undefined);
                                setPageNumber(1);
                            }}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
                        >
                            <option value="">All Severities</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>

                        <select
                            value={reportTypeFilter || ''}
                            onChange={(e) => {
                                setReportTypeFilter(e.target.value || undefined);
                                setPageNumber(1);
                            }}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
                        >
                            <option value="">All Types</option>
                            <option value="Pest">Pest</option>
                            <option value="Weather">Weather</option>
                            <option value="Disease">Disease</option>
                            <option value="Other">Other</option>
                        </select>

                        {(statusFilter || severityFilter || reportTypeFilter) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setStatusFilter(undefined);
                                    setSeverityFilter(undefined);
                                    setReportTypeFilter(undefined);
                                    setPageNumber(1);
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* Reports List */}
                {reports.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 bg-white py-16 text-center">
                        <AlertTriangle className="mx-auto mb-4 size-16 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            No reports found
                        </h3>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
                            {searchTerm || statusFilter || severityFilter || reportTypeFilter
                                ? 'Try adjusting your filters'
                                : 'No emergency reports have been submitted'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reports.map((report: any) => {
                            const severityColor = getSeverityColor(report.severity);
                            
                            return (
                                <div
                                    key={report.id}
                                    className={`rounded-lg border-2 ${severityColor} p-4 shadow-sm hover:shadow-md transition-shadow`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                                                    <AlertTriangle className="size-5 text-red-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {report.title}
                                                        </h3>
                                                        <Badge className={getStatusColor(report.status)}>
                                                            {report.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={severityColor}>
                                                            {report.severity} Severity
                                                        </Badge>
                                                        <Badge variant="outline" className="bg-gray-100 text-gray-700">
                                                            {report.reportType}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">{report.description}</p>

                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                {report.farmerName && (
                                                    <div className="flex items-center gap-1.5 text-gray-600">
                                                        <span>
                                                            Farmer: <span className="font-medium text-gray-900">{report.farmerName}</span>
                                                        </span>
                                                    </div>
                                                )}
                                                {report.plotName && (
                                                    <div className="flex items-center gap-1.5 text-gray-600">
                                                        <span>
                                                            Plot: <span className="font-medium text-gray-900">{report.plotName}</span>
                                                            {report.plotArea && <span className="text-xs ml-1">({report.plotArea} ha)</span>}
                                                        </span>
                                                    </div>
                                                )}
                                                {report.cultivationPlanName && (
                                                    <div className="flex items-center gap-1.5 text-gray-600">
                                                        <span>
                                                            Plan: <span className="font-medium text-gray-900">{report.cultivationPlanName}</span>
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        Reported: <span className="font-medium text-gray-900">{formatDate(report.reportedAt)}</span>
                                                    </span>
                                                </div>
                                                {report.reportedBy && (
                                                    <div className="flex items-center gap-1.5 text-gray-600">
                                                        <span>
                                                            By: <span className="font-medium text-gray-900">{report.reportedBy}</span>
                                                            {report.reportedByRole && <span className="text-xs ml-1">({report.reportedByRole})</span>}
                                                        </span>
                                                    </div>
                                                )}
                                                {report.resolvedAt && (
                                                    <div className="flex items-center gap-1.5 text-gray-600">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            Resolved: <span className="font-medium text-gray-900">{formatDate(report.resolvedAt)}</span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {report.resolutionNotes && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <p className="text-xs font-medium text-gray-700">
                                                        Resolution Notes:
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {report.resolutionNotes}
                                                    </p>
                                                </div>
                                            )}

                                            {report.images && report.images.length > 0 && (
                                                <div className="mt-3 flex gap-2">
                                                    {report.images.slice(0, 3).map((image: string, idx: number) => (
                                                        <img
                                                            key={idx}
                                                            src={image}
                                                            alt={`Report ${idx + 1}`}
                                                            className="h-16 w-16 rounded-md object-cover border border-gray-200"
                                                        />
                                                    ))}
                                                    {report.images.length > 3 && (
                                                        <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-medium border border-gray-200">
                                                            +{report.images.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 ml-4">
                                            <Button
                                                onClick={() => handleViewDetails(report.id)}
                                                variant="outline"
                                                size="sm"
                                                className="whitespace-nowrap"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                        <div className="text-sm text-gray-600">
                            Showing page {currentPage} of {totalPages} ({totalCount} total reports)
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setPageNumber((prev) => Math.min(totalPages, prev + 1))
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </ContentLayout>

        {/* Report Detail Dialog */}
        {selectedReportId && (
            <ReportDetailDialog
                isOpen={!!selectedReportId}
                onClose={() => setSelectedReportId(null)}
                reportId={selectedReportId}
            />
        )}
    </>
    );
};

export const Component = ReportsRoute;
export default ReportsRoute;


