import { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { ReportsList, ReportDetailDialog } from '@/features/reports/components';
import { ResolveReportDialog } from '@/features/reports/components/resolve-report-dialog';
import { AlertCircle } from 'lucide-react';

const ExpertReportsRoute = () => {
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [resolvingReport, setResolvingReport] = useState<{ id: string; title: string } | null>(null);

    const handleResolve = (reportId: string, reportTitle: string) => {
        setResolvingReport({ id: reportId, title: reportTitle });
    };

    return (
        <>
            <div>
                <div className="bg-white border-b border-neutral-200 px-6 py-4 shadow-sm mb-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-3 shadow-lg">
                            <AlertCircle className="size-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900">
                                Báo cáo lô đất
                            </h1>
                            <p className="text-sm text-neutral-600 mt-1">
                                Xem xét và xử lý báo cáo cấp lô đất từ nông dân và giám sát viên
                            </p>
                        </div>
                    </div>
                </div>

                <ReportsList
                    onViewDetails={(reportId) => setSelectedReportId(reportId)}
                    onResolve={handleResolve}
                />
            </div>

            {/* Report Detail Dialog */}
            {selectedReportId && (
                <ReportDetailDialog
                    isOpen={!!selectedReportId}
                    onClose={() => setSelectedReportId(null)}
                    reportId={selectedReportId}
                    onResolve={handleResolve}
                />
            )}

            {/* Resolve Report Dialog */}
            {resolvingReport && (
                <ResolveReportDialog
                    isOpen={!!resolvingReport}
                    onClose={() => setResolvingReport(null)}
                    reportId={resolvingReport.id}
                    reportTitle={resolvingReport.title}
                />
            )}
        </>
    );
};

export default ExpertReportsRoute;
