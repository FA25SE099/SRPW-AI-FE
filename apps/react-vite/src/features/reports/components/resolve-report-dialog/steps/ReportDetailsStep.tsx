import { useState } from 'react';
import { AlertTriangle, MapPin, Calendar, User, FileText, Bug, Cloud, Droplets, ClipboardList, Eye } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Report, ReportType } from '@/features/reports/types';
import { formatDate } from '@/utils/format';
import { CultivationPlanDetailDialog } from '@/features/supervisor/components/cultivation-plan-detail-dialog';

type ReportDetailsStepProps = {
    report: Report | undefined;
    isLoadingReport: boolean;
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
}: ReportDetailsStepProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isCultivationPlanDialogOpen, setIsCultivationPlanDialogOpen] = useState(false);

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
                Không tìm thấy báo cáo
            </div>
        );
    }

    return (
        <div className="h-[600px]">
            {/* Report Info */}
            <div className="space-y-4 overflow-y-auto pr-4 h-full">
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
                                    {report.severity === 'Critical' ? 'Khẩn Cấp' :
                                     report.severity === 'High' ? 'Cao' :
                                     report.severity === 'Medium' ? 'Trung Bình' :
                                     report.severity === 'Low' ? 'Thấp' : report.severity} Mức Độ
                                </span>
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                                    {report.reportType === 'Pest' ? 'Sâu Bệnh' :
                                     report.reportType === 'Weather' ? 'Thời Tiết' :
                                     report.reportType === 'Disease' ? 'Bệnh' :
                                     report.reportType === 'Other' ? 'Khác' : report.reportType}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Mô Tả</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.description}</p>
                    </div>
                </div>

                {/* Plot & Plan Info */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border rounded-lg p-3">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Thông Tin Lô</h4>
                        <dl className="space-y-1.5 text-xs">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                <dt className="text-gray-600">Lô:</dt>
                                <dd className="font-medium text-gray-900">{report.plotName}</dd>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                <dt className="text-gray-600">Diện Tích:</dt>
                                <dd className="font-medium text-gray-900">{report.plotArea} ha</dd>
                            </div>
                            {report.coordinates && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                    <dt className="text-gray-600">Vị Trí:</dt>
                                    <dd className="font-medium text-gray-900 text-[10px]">{report.coordinates}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    <div className="bg-white border rounded-lg p-3">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Thông Tin Người Báo Cáo</h4>
                        <dl className="space-y-1.5 text-xs">
                            <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-gray-400" />
                                <dt className="text-gray-600">Tên:</dt>
                                <dd className="font-medium text-gray-900">{report.reportedBy}</dd>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-gray-400" />
                                <dt className="text-gray-600">Vai Trò:</dt>
                                <dd className="font-medium text-gray-900">{report.reportedByRole}</dd>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                <dt className="text-gray-600">Ngày:</dt>
                                <dd className="font-medium text-gray-900">{formatDate(report.reportedAt)}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Cultivation Plan Info & Task Info*/}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <h4 className="font-semibold text-blue-900 text-sm">Kế Hoạch Canh Tác</h4>
                        </div>
                        <p className="text-sm text-gray-900 font-medium">{report.cultivationPlanName}</p>
                        {report.farmerName && (
                            <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-gray-400" />
                                <dt className="text-xs text-gray-700">Nông Dân:</dt>
                                <dd className="text-xs font-medium text-gray-700">{report.farmerName}</dd>
                            </div>
                        )}
                        {report.clusterName && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                <dt className="text-xs text-gray-700">Cụm:</dt>
                                <dd className="text-xs font-medium text-gray-700">{report.clusterName}</dd>
                            </div>
                        )}
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <h4 className="font-semibold text-blue-900 text-sm">Chi Tiết Nhiệm Vụ</h4>
                            </div>
                            {report.plotId && report.groupId && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setIsCultivationPlanDialogOpen(true)}
                                >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Xem Trong Kế Hoạch Canh Tác
                                </Button>
                            )}
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-3">Nhiệm Vụ Canh Tác Bị Ảnh Hưởng</h4>
                        <dl className="space-y-2 text-sm">
                            {report.affectedTaskName && (
                                <div className="flex items-center gap-2">
                                    <ClipboardList className="h-4 w-4 text-gray-400" />
                                    <dt className="text-xs text-gray-600">Tên Nhiệm Vụ:</dt>
                                    <dd className="text-xs font-medium text-gray-900">{report.affectedTaskName}</dd>
                                </div>
                            )}
                            {report.affectedTaskType && (
                                <div className="flex items-center gap-2">
                                    <ClipboardList className="h-4 w-4 text-gray-400" />
                                    <dt className="text-xs text-gray-600">Loại Nhiệm Vụ:</dt>
                                    <dd className="text-xs font-medium text-gray-900">{report.affectedTaskType}</dd>
                                </div>
                            )}
                            {report.affectedTaskVersionName && (
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-gray-400" />
                                    <dt className="text-xs text-gray-600">Phiên Bản:</dt>
                                    <dd className="text-xs font-medium text-gray-900">{report.affectedTaskVersionName}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>

                {/* Images */}
                {report.images && report.images.length > 0 && (
                    <div className="bg-white border rounded-lg p-3">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Hình Ảnh Đính Kèm</h4>
                        <div className="grid grid-cols-4 gap-2">
                            {report.images.map((image, idx) => (
                                <img
                                    key={idx}
                                    src={image}
                                    alt={`Report ${idx + 1}`}
                                    className="w-full h-20 rounded object-cover border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setSelectedImage(image)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Spacer */}
            <div className="col-span-1">
            </div>

            <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent
                    className="max-w-4xl border-none bg-transparent shadow-none"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="flex items-center justify-center w-full">
                        <img
                            src={selectedImage || ''}
                            alt="Report full size"
                            className="max-h-[80vh] w-auto rounded-lg object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </DialogContent>
            </Dialog>
            {report && report.plotId && report.groupId && (
                <CultivationPlanDetailDialog
                    isOpen={isCultivationPlanDialogOpen}
                    onClose={() => setIsCultivationPlanDialogOpen(false)}
                    plotId={report.plotId}
                    groupId={report.groupId}
                    plotName={report.plotName}
                    viewOnly={true}
                    initialVersionId={report.affectedTaskVersionId || null}
                    highlightTaskId={report.affectedCultivationTaskId}
                />
            )}
        </div>
    );
};
