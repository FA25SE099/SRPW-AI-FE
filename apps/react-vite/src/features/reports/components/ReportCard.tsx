import { AlertTriangle, Calendar, MapPin, User, FileText, Droplets, Bug, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Report, ReportSeverity, ReportType } from '../types';
import { formatDate } from '@/utils/format';

type ReportCardProps = {
    report: Report;
    onViewDetails: (reportId: string) => void;
    onResolve: (reportId: string, reportTitle: string) => void;
};

const getSeverityColor = (severity: ReportSeverity) => {
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

const getReportTypeColor = (type: ReportType) => {
    switch (type) {
        case 'Pest':
            return 'text-red-600 bg-red-50';
        case 'Weather':
            return 'text-blue-600 bg-blue-50';
        case 'Disease':
            return 'text-purple-600 bg-purple-50';
        default:
            return 'text-gray-600 bg-gray-50';
    }
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'UnderReview':
            return 'bg-blue-100 text-blue-800';
        case 'Resolved':
            return 'bg-green-100 text-green-800';
        case 'Rejected':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const ReportCard = ({ report, onViewDetails, onResolve }: ReportCardProps) => {
    const severityColor = getSeverityColor(report.severity);
    const typeColor = getReportTypeColor(report.reportType);
    const typeIcon = getReportTypeIcon(report.reportType);

    return (
        <div className={`rounded-lg border-2 ${severityColor} p-4 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${typeColor}`}>
                            {typeIcon}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(report.status)}`}>
                                    {report.status === 'Pending' ? 'Chờ Xử Lý' :
                                     report.status === 'UnderReview' ? 'Đang Xem Xét' :
                                     report.status === 'Resolved' ? 'Đã Giải Quyết' :
                                     report.status === 'Rejected' ? 'Đã Từ Chối' : report.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${severityColor}`}>
                                    {report.severity === 'Critical' ? 'Khẩn Cấp' :
                                     report.severity === 'High' ? 'Cao' :
                                     report.severity === 'Medium' ? 'Trung Bình' :
                                     report.severity === 'Low' ? 'Thấp' : report.severity} Mức Độ
                                </span>
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                    {report.reportType === 'Pest' ? 'Sâu Bệnh' :
                                     report.reportType === 'Weather' ? 'Thời Tiết' :
                                     report.reportType === 'Disease' ? 'Bệnh' :
                                     report.reportType === 'Other' ? 'Khác' : report.reportType}
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{report.description}</p>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>
                                Lô: <span className="font-medium text-gray-900">{report.plotName}</span>
                                <span className="text-xs ml-1">({report.plotArea} ha)</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span>
                                Kế Hoạch: <span className="font-medium text-gray-900">{report.cultivationPlanName}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <User className="h-4 w-4" />
                            <span>
                                Bởi: <span className="font-medium text-gray-900">{report.reportedBy}</span>
                                <span className="text-xs ml-1">({report.reportedByRole})</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                                Báo Cáo: <span className="font-medium text-gray-900">{formatDate(report.reportedAt)}</span>
                            </span>
                        </div>
                        {report.farmerName && (
                            <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
                                <User className="h-4 w-4" />
                                <span>
                                    Nông Dân: <span className="font-medium text-gray-900">{report.farmerName}</span>
                                    {report.clusterName && <span className="text-xs ml-1">• {report.clusterName}</span>}
                                </span>
                            </div>
                        )}
                    </div>

                    {report.images && report.images.length > 0 && (
                        <div className="mt-3 flex gap-2">
                            {report.images.slice(0, 3).map((image, idx) => (
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
                    {report.status === 'Pending' || report.status === 'UnderReview' ? (
                        <Button
                            onClick={() => onResolve(report.id, report.title)}
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                        >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Giải Quyết
                        </Button>
                    ) : null}
                    <Button
                        onClick={() => onViewDetails(report.id)}
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        Xem Chi Tiết
                    </Button>
                </div>
            </div>
        </div>
    );
};

