import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Users, FileText, Package, RefreshCw } from 'lucide-react';
import { useYearSeasonDashboard, useUpdateYearSeasonStatus } from '@/features/yearseason/api/yearseason-service';
import { AlertBanner } from '@/features/yearseason/components/alert-banner';
import { TimelineVisualization } from '@/features/yearseason/components/timeline-visualization';
import { UpdateStatusDialog } from '@/features/yearseason/components/update-status-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notifications';
import { YearSeasonStatus } from '@/features/yearseason/types';

const YearSeasonDashboardRoute = () => {
  const { yearSeasonId } = useParams<{ yearSeasonId: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const { data: dashboard, isLoading, error, refetch } = useYearSeasonDashboard({
    id: yearSeasonId!,
  });
  
  const typedDashboard = dashboard as import('@/features/yearseason/types').YearSeasonDashboard | undefined;

  const updateStatusMutation = useUpdateYearSeasonStatus({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Year season status updated successfully',
        });
        setIsStatusDialogOpen(false);
        refetch();
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Error',
          message: error?.message || 'Failed to update year season status',
        });
      },
    },
  });

  const handleStatusUpdate = (newStatus: YearSeasonStatus) => {
    if (yearSeasonId) {
      updateStatusMutation.mutate({
        id: yearSeasonId,
        data: { status: newStatus },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-red-600 text-center">
          <p className="text-lg font-semibold">Error loading dashboard</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-lg text-muted-foreground">Dashboard not found</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-500';
      case 'PlanningOpen':
        return 'bg-blue-500';
      case 'Active':
        return 'bg-green-500';
      case 'Completed':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold">
              {typedDashboard?.season.seasonName} {typedDashboard?.season.year}
            </h1>
            <Badge className={`${getStatusColor(typedDashboard?.season.status || 'Draft')} text-white`}>
              {typedDashboard?.season.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground ml-11">
            <span>{typedDashboard?.season.clusterName}</span>
            <span>•</span>
            <span>Rice Variety: {typedDashboard?.season.riceVarietyName}</span>
            <span>•</span>
            <span>Expert: {typedDashboard?.season.expertName}</span>
          </div>
        </div>
        
        {/* Update Status Button */}
        <Button
          variant="outline"
          onClick={() => setIsStatusDialogOpen(true)}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Update Status
        </Button>
      </div>

      {/* Alerts */}
      {typedDashboard?.alerts && typedDashboard.alerts.length > 0 && (
        <AlertBanner alerts={typedDashboard.alerts} />
      )}

      {/* Timeline */}
      <TimelineVisualization timeline={typedDashboard?.timeline!} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Group Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">{typedDashboard?.groupStatus.totalGroups ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total groups formed</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Groups</span>
                <span className="font-medium">{typedDashboard?.groupStatus.activeGroups ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">With Supervisor</span>
                <span className="font-medium">
                  {typedDashboard?.groupStatus.groupsWithSupervisor ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Farmers</span>
                <span className="font-medium">
                  {typedDashboard?.groupStatus.totalFarmersInGroups ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Area</span>
                <span className="font-medium">
                  {(typedDashboard?.groupStatus.totalAreaHectares ?? 0).toFixed(1)} ha
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Planning Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planning</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(typedDashboard?.planningStatus.planningCompletionRate ?? 0).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Planning completion rate</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Plans</span>
                <span className="font-medium">
                  {typedDashboard?.planningStatus.totalPlans ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Approved</span>
                <span className="font-medium text-green-600">
                  {typedDashboard?.planningStatus.plansApproved ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium text-orange-600">
                  {typedDashboard?.planningStatus.plansPendingApproval ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Groups with Plans</span>
                <span className="font-medium">
                  {typedDashboard?.planningStatus.groupsWithPlans ?? 0} /{' '}
                  {typedDashboard?.groupStatus.totalGroups ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Without Plans</span>
                <span className="font-medium text-red-600">
                  {typedDashboard?.planningStatus.groupsWithoutPlans ?? 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Material Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materials</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(typedDashboard?.materialStatus.materialCompletionRate ?? 0).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Material completion rate</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Distributions</span>
                <span className="font-medium">
                  {typedDashboard?.materialStatus.totalDistributions ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium text-green-600">
                  {typedDashboard?.materialStatus.distributionsCompleted ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium text-orange-600">
                  {typedDashboard?.materialStatus.distributionsPending ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overdue</span>
                <span className="font-medium text-red-600">
                  {typedDashboard?.materialStatus.distributionsOverdue ?? 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Season Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Season Status</span>
              <Badge className={getStatusColor(typedDashboard?.season.status || 'Draft')}>
                {typedDashboard?.season.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Planning Window</span>
              <Badge variant={typedDashboard?.timeline.isPlanningWindowOpen ? 'default' : 'secondary'}>
                {typedDashboard?.timeline.isPlanningWindowOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Season Started</span>
              <Badge variant={typedDashboard?.timeline.hasSeasonStarted ? 'default' : 'secondary'}>
                {typedDashboard?.timeline.hasSeasonStarted ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Groups per Supervisor</span>
              <span className="font-medium">
                {(typedDashboard?.groupStatus.groupsWithSupervisor ?? 0) > 0
                  ? (
                      (typedDashboard?.groupStatus.totalGroups ?? 0) /
                      (typedDashboard?.groupStatus.groupsWithSupervisor ?? 1)
                    ).toFixed(1)
                  : '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Farmers per Group</span>
              <span className="font-medium">
                {(typedDashboard?.groupStatus.totalGroups ?? 0) > 0
                  ? (
                      (typedDashboard?.groupStatus.totalFarmersInGroups ?? 0) /
                      (typedDashboard?.groupStatus.totalGroups ?? 1)
                    ).toFixed(1)
                  : '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Area per Group</span>
              <span className="font-medium">
                {(typedDashboard?.groupStatus.totalGroups ?? 0) > 0
                  ? (
                      (typedDashboard?.groupStatus.totalAreaHectares ?? 0) /
                      (typedDashboard?.groupStatus.totalGroups ?? 1)
                    ).toFixed(1)
                  : '0'}{' '}
                ha
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Update Status Dialog */}
      {dashboard && (
        <UpdateStatusDialog
          isOpen={isStatusDialogOpen}
          onClose={() => setIsStatusDialogOpen(false)}
          currentStatus={typedDashboard?.season.status || 'Draft'}
          yearSeasonId={yearSeasonId!}
          yearSeasonName={`${typedDashboard?.season.seasonName} ${typedDashboard?.season.year}`}
          onStatusUpdate={handleStatusUpdate}
          isUpdating={updateStatusMutation.isPending}
        />
      )}
    </div>
  );
};

export default YearSeasonDashboardRoute;

