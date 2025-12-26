import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { usePendingApprovals } from '@/features/expert/api/get-pending-approvals';
import { ApproveRejectDialog } from '@/features/expert/components/approve-reject-dialog';
import { PlanDetailDialog } from '@/features/expert/components/plan-detail-dialog';
import { ExpertPendingPlanItem } from '@/types/api';

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Urgent':
      return 'bg-red-100 text-red-700';
    case 'High':
      return 'bg-orange-100 text-orange-700';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'Low':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
};

const ApprovalsRoute = () => {
  const [page, setPage] = useState(1);
  const [selectedApproval, setSelectedApproval] = useState<ExpertPendingPlanItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading, error, refetch } = usePendingApprovals({
    params: { currentPage: page, pageSize: 10 },
    queryConfig: {
      refetchInterval: 30000,
    },
  });

  const handleApproveClick = (approval: ExpertPendingPlanItem) => {
    setSelectedApproval(approval);
    setDialogOpen(true);
  };
  const handleDetailsClick = (approval: ExpertPendingPlanItem) => {
    setSelectedApproval(approval);
    setDetailOpen(true);
  };

  const handleSuccess = () => {
    refetch();
  };

  const pendingCount = data?.totalCount || 0;

  return (
    <ContentLayout title="Approvals">
      <div className="space-y-6">
        {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected Today</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div> */}

        <div className="rounded-lg border bg-white">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Pending Approvals</h2>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Spinner size="lg" />
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-600">
              Failed to load pending approvals. Please try again later.
            </div>
          )}

          {!isLoading && !error && data && (
            <>
              {data.data && data.data.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No pending approvals at this time.
                </div>
              ) : (
                <>
                  <div className="divide-y">
                    {data.data?.map((approval) => (
                      <div key={approval.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{approval.planName}</h3>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              Area: {approval.groupArea} | Group ID: {approval.groupId}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {approval.submitterName} - Submitted {approval.submittedAt ? formatDate(approval.submittedAt) : 'N/A'}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              Base Planting Date: {formatDate(approval.basePlantingDate)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {/* <Button
                      onClick={() => handleDetailsClick(approval)}
                      variant="outline"
                      size="sm"
                    >
                      Details
                    </Button> */}
                            <Button
                              onClick={() => handleApproveClick(approval)}
                              className="bg-green-500 hover:bg-green-600"
                              size="sm"
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {data.totalPages > 1 && (
                    <div className="border-t p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Showing page {data.currentPage} of {data.totalPages} ({data.totalCount} total)
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setPage(page - 1)}
                            disabled={!data.hasPrevious}
                            size="sm"
                            variant="outline"
                          >
                            Previous
                          </Button>
                          <Button
                            onClick={() => setPage(page + 1)}
                            disabled={!data.hasNext}
                            size="sm"
                            variant="outline"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      {selectedApproval && (
        <ApproveRejectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          planId={selectedApproval.id}
          farmerName={selectedApproval.submitterName}
          cropType={selectedApproval.planName}
          issue={selectedApproval.planName}
          onSuccess={handleSuccess}
        />
      )}

      {selectedApproval && (
        <PlanDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          planId={selectedApproval.id}
        />
      )}
    </ContentLayout>
  );
};

export default ApprovalsRoute;
