import { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { ReportsList, ReportDetailDialog } from '@/features/reports/components';
import { ResolveReportDialog } from '@/features/reports/components/resolve-report-dialog';

const ExpertReportsRoute = () => {
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [resolvingReport, setResolvingReport] = useState<{ id: string; title: string } | null>(null);

    const handleResolve = (reportId: string, reportTitle: string) => {
        setResolvingReport({ id: reportId, title: reportTitle });
    };

    return (
        <>
            <ContentLayout title="Plot Reports">
                <div className="mb-4">
                    <p className="text-sm text-gray-600">
                        Review and resolve plot-level reports from farmers and supervisors
                    </p>
                </div>

                <ReportsList
                    onViewDetails={(reportId) => setSelectedReportId(reportId)}
                    onResolve={handleResolve}
                />
            </ContentLayout>

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
