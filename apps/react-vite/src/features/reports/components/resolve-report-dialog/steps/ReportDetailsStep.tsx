import { AlertTriangle, MapPin, Calendar, User, FileText, Bug, Cloud, Droplets } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Report, ReportType } from '@/features/reports/types';
import { formatDate } from '@/utils/format';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '../types';

type ReportDetailsStepProps = {
    report: Report | undefined;
    isLoadingReport: boolean;
    register: UseFormRegister<FormData>;
    errors: FieldErrors<FormData>;
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

export const ReportDetailsStep = ({
    report,
    isLoadingReport,
    register,
    errors,
}: ReportDetailsStepProps) => {
    if (isLoadingReport) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="text-center py-12 text-gray-600">
                Report not found
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-4 h-[600px]">
            {/* Left: Report Info */}
            <div className="col-span-2 space-y-4 overflow-y-auto pr-4">
                {/* Report Header */}
                <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                            {getReportTypeIcon(report.reportType)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">{report.title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getSeverityColor(report.severity)}`}>
                                    {report.severity} Severity
                                </span>
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                                    {report.reportType}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Description</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.description}</p>
                    </div>
                </div>

                {/* Plot & Plan Info */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border rounded-lg p-3">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Plot Information</h4>
                        <dl className="space-y-1.5 text-xs">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                <dt className="text-gray-600">Plot:</dt>
                                <dd className="font-medium text-gray-900">{report.plotName}</dd>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                <dt className="text-gray-600">Area:</dt>
                                <dd className="font-medium text-gray-900">{report.plotArea} ha</dd>
                            </div>
                            {report.coordinates && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                    <dt className="text-gray-600">Location:</dt>
                                    <dd className="font-medium text-gray-900 text-[10px]">{report.coordinates}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    <div className="bg-white border rounded-lg p-3">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Reporter Info</h4>
                        <dl className="space-y-1.5 text-xs">
                            <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-gray-400" />
                                <dt className="text-gray-600">Name:</dt>
                                <dd className="font-medium text-gray-900">{report.reportedBy}</dd>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-gray-400" />
                                <dt className="text-gray-600">Role:</dt>
                                <dd className="font-medium text-gray-900">{report.reportedByRole}</dd>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                <dt className="text-gray-600">Date:</dt>
                                <dd className="font-medium text-gray-900">{formatDate(report.reportedAt)}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Cultivation Plan Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <h4 className="font-semibold text-blue-900 text-sm">Cultivation Plan</h4>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{report.cultivationPlanName}</p>
                    {report.farmerName && (
                        <p className="text-xs text-gray-700 mt-1">Farmer: {report.farmerName}</p>
                    )}
                    {report.clusterName && (
                        <p className="text-xs text-gray-700">Cluster: {report.clusterName}</p>
                    )}
                </div>

                {/* Images */}
                {report.images && report.images.length > 0 && (
                    <div className="bg-white border rounded-lg p-3">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Attached Images</h4>
                        <div className="grid grid-cols-4 gap-2">
                            {report.images.map((image, idx) => (
                                <img
                                    key={idx}
                                    src={image}
                                    alt={`Report ${idx + 1}`}
                                    className="w-full h-20 rounded object-cover border border-gray-200"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Resolution Reason */}
            <div className="col-span-1 border-l pl-4 space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <h4 className="font-semibold text-yellow-900 text-sm">Resolution Required</h4>
                    </div>
                    <p className="text-xs text-yellow-800">
                        This report requires your attention. You will modify the cultivation plan for this specific plot.
                    </p>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">Resolution Report *</h3>
                    <textarea
                        {...register('resolutionReason', { required: 'Resolution reason is required' })}
                        rows={12}
                        placeholder="Describe how you will address this issue and what changes will be made..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.resolutionReason && (
                        <p className="text-xs text-red-600 mt-1">{errors.resolutionReason.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">This will be saved with the resolution</p>
                </div>
            </div>
        </div>
    );
};

