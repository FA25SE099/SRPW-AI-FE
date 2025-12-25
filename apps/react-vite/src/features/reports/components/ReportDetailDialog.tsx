import { X, AlertTriangle, MapPin, Calendar, User, FileText, Bug, Cloud, Droplets, ClipboardList } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { useReport } from '../api/get-report';
import { formatDate } from '@/utils/format';
import { ReportType } from '../types';

type ReportDetailDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    reportId: string;
    onResolve?: (reportId: string, reportTitle: string) => void;
};

const getReportTypeIcon = (type: ReportType) => {
    switch (type) {
        case 'Pest':
            return <Bug className="h-5 w-5" />;
        case 'Weather':
            return <Cloud className="h-5 w-5" />;
        case 'Disease':
            return <Droplets className="h-5 w-5" />;
        default:
            return <AlertTriangle className="h-5 w-5" />;
    }
};

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'Critical':
            return 'bg-red-100 text-red-800 border-red-300';
        case 'High':
            return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'Medium':
            return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'Low':
            return 'bg-blue-100 text-blue-800 border-blue-300';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-300';
    }
};

export const ReportDetailDialog = ({ isOpen, onClose, reportId, onResolve }: ReportDetailDialogProps) => {
    const { data: report, isLoading } = useReport({
        reportId,
        queryConfig: {
            enabled: isOpen && !!reportId,
        },
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50" onClick={onClose} />

                <div className="relative z-10 w-full max-w-4xl rounded-lg bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
                            <p className="text-sm text-gray-600 mt-1">View complete report information</p>
                        </div>
                        <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex h-64 items-center justify-center">
                                <Spinner size="lg" />
                            </div>
                        ) : report ? (
                            <div className="space-y-6">
                                {/* Title and Status */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                                            {getReportTypeIcon(report.reportType)}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">{report.title}</h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getSeverityColor(report.severity)}`}>
                                                    {report.severity} Severity
                                                </span>
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                                                    {report.reportType}
                                                </span>
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                                    report.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    report.status === 'UnderReview' ? 'bg-blue-100 text-blue-800' :
                                                    report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {report.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="rounded-lg border bg-gray-50 p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.description}</p>
                                </div>

                                {/* Report Information */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg border bg-white p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Plot Information</h4>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <dt className="text-gray-600">Plot Name:</dt>
                                                <dd className="font-medium text-gray-900">{report.plotName}</dd>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <dt className="text-gray-600">Area:</dt>
                                                <dd className="font-medium text-gray-900">{report.plotArea} ha</dd>
                                            </div>
                                            {report.coordinates && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <dt className="text-gray-600">Coordinates:</dt>
                                                    <dd className="font-medium text-gray-900 text-xs">{report.coordinates}</dd>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-gray-400" />
                                                <dt className="text-gray-600">Cultivation Plan:</dt>
                                                <dd className="font-medium text-gray-900 text-xs">{report.cultivationPlanName}</dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div className="rounded-lg border bg-white p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Reporter Information</h4>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <dt className="text-gray-600">Reported By:</dt>
                                                <dd className="font-medium text-gray-900">{report.reportedBy}</dd>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <dt className="text-gray-600">Role:</dt>
                                                <dd className="font-medium text-gray-900">{report.reportedByRole}</dd>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <dt className="text-gray-600">Reported At:</dt>
                                                <dd className="font-medium text-gray-900">{formatDate(report.reportedAt)}</dd>
                                            </div>
                                            {report.farmerName && (
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <dt className="text-gray-600">Farmer:</dt>
                                                    <dd className="font-medium text-gray-900">{report.farmerName}</dd>
                                                </div>
                                            )}
                                            {report.clusterName && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <dt className="text-gray-600">Cluster:</dt>
                                                    <dd className="font-medium text-gray-900">{report.clusterName}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>
                                </div>

                                {/* Affected Task Information */}
                                {(report.affectedTaskName || report.affectedTaskType || report.affectedTaskVersionName) && (
                                    <div className="rounded-lg border bg-white p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Affected Cultivation Task</h4>
                                        <dl className="space-y-2 text-sm">
                                            {report.affectedTaskName && (
                                                <div className="flex items-center gap-2">
                                                    <ClipboardList className="h-4 w-4 text-gray-400" />
                                                    <dt className="text-gray-600">Task Name:</dt>
                                                    <dd className="font-medium text-gray-900">{report.affectedTaskName}</dd>
                                                </div>
                                            )}
                                            {report.affectedTaskType && (
                                                <div className="flex items-center gap-2">
                                                    <ClipboardList className="h-4 w-4 text-gray-400" />
                                                    <dt className="text-gray-600">Task Type:</dt>
                                                    <dd className="font-medium text-gray-900">{report.affectedTaskType}</dd>
                                                </div>
                                            )}
                                            {report.affectedTaskVersionName && (
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-400" />
                                                    <dt className="text-gray-600">Version:</dt>
                                                    <dd className="font-medium text-gray-900">{report.affectedTaskVersionName}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>
                                )}

                                {/* Images */}
                                {report.images && report.images.length > 0 && (
                                    <div className="rounded-lg border bg-white p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Attached Images</h4>
                                        <div className="grid grid-cols-4 gap-3">
                                            {report.images.map((image, idx) => (
                                                <img
                                                    key={idx}
                                                    src={image}
                                                    alt={`Report evidence ${idx + 1}`}
                                                    className="w-full h-32 rounded-lg object-cover border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Resolution Info (if resolved) */}
                                {report.status === 'Resolved' && report.resolvedBy && (
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                        <h4 className="font-semibold text-green-900 mb-3">Resolution Information</h4>
                                        <dl className="space-y-2 text-sm">
                                            <div>
                                                <dt className="text-green-700 font-medium">Resolved By:</dt>
                                                <dd className="text-gray-900">{report.resolvedBy}</dd>
                                            </div>
                                            {report.resolvedAt && (
                                                <div>
                                                    <dt className="text-green-700 font-medium">Resolved At:</dt>
                                                    <dd className="text-gray-900">{formatDate(report.resolvedAt)}</dd>
                                                </div>
                                            )}
                                            {report.resolutionNotes && (
                                                <div>
                                                    <dt className="text-green-700 font-medium">Resolution Notes:</dt>
                                                    <dd className="text-gray-900 whitespace-pre-wrap">{report.resolutionNotes}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-600">
                                Report not found
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t px-6 py-4 flex justify-between bg-gray-50">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        {report && (report.status === 'Pending' || report.status === 'UnderReview') && onResolve && (
                            <Button
                                onClick={() => {
                                    onResolve(report.id, report.title);
                                    onClose();
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Resolve This Report
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

