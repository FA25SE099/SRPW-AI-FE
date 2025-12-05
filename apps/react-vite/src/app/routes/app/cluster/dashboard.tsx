'use client';

import { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import {
  CurrentSeasonCardV0,
  ReadinessPanelV0,
  HistoryChartV0,
  SeasonSelectorV0,
  GroupFormationModal,
  PlotsOverviewCard,
  SupervisorOverviewCard,
} from '@/features/cluster/components';
import {
  useClusterCurrentSeason,
  useClusterHistory,
  useClusterSeasons,
  useCurrentSeason,
  useClusterId,
} from '@/features/cluster/api';
// Sửa import này từ production-plans sang cluster
import { ProductionPlanDetailDialog } from '@/features/cluster/components/production-plan-detail-dialog';
import { useGroupDetail } from '@/features/groups/api/get-groups-detail';
import { useUser } from '@/lib/auth';
import {
  Loader2,
  AlertCircle,
  Users,
  MapPin,
  Sprout,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlanStatusBadge } from '@/components/ui/plan-status-badge';
import { usePlots } from '@/features/plots/api/get-all-plots';

type UIPlanStatus = 'awaiting-plan' | 'in-progress' | 'completed';

// TaskStatus enum from backend
enum TaskStatus {
  Draft = 'Draft',
  PendingApproval = 'PendingApproval',
  Approved = 'Approved',
  InProgress = 'InProgress',
  OnHold = 'OnHold',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Emergency = 'Emergency',
  EmergencyApproval = 'EmergencyApproval',
}

// Tách GroupCard thành component riêng để fetch group detail
const GroupCard = ({
  group,
  index,
  groupColors,
  onSelectGroup
}: {
  group: any;
  index: number;
  groupColors: string[];
  onSelectGroup: (groupInfo: any) => void;
}) => {
  // Fetch group detail để kiểm tra production plan
  const { data: groupDetail, isLoading: isLoadingDetail } = useGroupDetail({
    groupId: group.groupId,
    queryConfig: { enabled: !!group.groupId }
  });

  const getUIPlanStatus = (group: any, groupDetail: any): UIPlanStatus => {
    // If group status is completed, show completed regardless of plan
    if (group.status === 'Completed') return 'completed';

    // Check if production plan exists with proper TaskStatus
    const hasPlan = groupDetail?.productionPlans &&
      groupDetail.productionPlans.length > 0;

    if (!hasPlan) return 'awaiting-plan';

    // Check TaskStatus of production plans
    const approvedOrActivePlan = groupDetail.productionPlans.some((plan: any) =>
      plan.status === TaskStatus.Approved ||
      plan.status === TaskStatus.InProgress ||
      plan.status === TaskStatus.Completed
    );

    if (!approvedOrActivePlan) return 'awaiting-plan';

    // If has approved/active plan but group not completed, show in progress
    return 'in-progress';
  };

  const getButtonConfig = (status: UIPlanStatus) => {
    switch (status) {
      case 'awaiting-plan':
        return {
          label: 'Awaiting Plan',
          disabled: true,
          className: 'w-full bg-gray-100 text-gray-500 cursor-not-allowed hover:bg-gray-100 disabled:opacity-100',
        };
      case 'in-progress':
        return {
          label: 'View Plan Details',
          disabled: false,
          className: 'w-full bg-blue-600 hover:bg-blue-700 text-white',
        };
      case 'completed':
        return {
          label: 'View Completed Plan',
          disabled: false,
          className: 'w-full bg-green-600 hover:bg-green-700 text-white',
        };
      default:
        return {
          label: 'Awaiting Plan',
          disabled: true,
          className: 'w-full bg-gray-100 text-gray-500 cursor-not-allowed hover:bg-gray-100 disabled:opacity-100',
        };
    }
  };

  const uiStatus = getUIPlanStatus(group, groupDetail);
  const buttonConfig = getButtonConfig(uiStatus);
  const color = group.color || groupColors[index % groupColors.length];
  const supervisorName = group.supervisorName || groupDetail?.supervisorName || 'Unassigned Supervisor';
  const supervisorEmail = group.supervisorEmail || 'N/A';

  const handleButtonClick = () => {
    if (buttonConfig.disabled) return;

    onSelectGroup({
      id: group.groupId,
      name: `Group ${group.riceVarietyName || groupDetail?.riceVarietyName || ''}`.trim(),
      totalArea: group.totalArea ?? groupDetail?.totalArea ?? 0,
    });
  };

  // Debug log để kiểm tra TaskStatus
  console.log('Production Plan Status for group:', group.groupId, {
    plans: groupDetail?.productionPlans?.map((p: any) => ({ id: p.id, status: p.status })),
    uiStatus,
  });

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
            style={{ backgroundColor: color }}
          />
          <div className="flex-1">
            <h3 className="font-bold text-foreground text-lg">
              {group.riceVarietyName || groupDetail?.riceVarietyName
                ? `Group ${group.riceVarietyName || groupDetail?.riceVarietyName}`
                : 'Group'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Group ID: #{group.groupId?.slice(0, 8)}...
            </p>
          </div>
        </div>

        {/* Group Metrics */}
        <div className="space-y-2 mb-4 pb-4 border-b border-muted">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Plots Assigned
            </span>
            <span className="font-semibold text-foreground">
              {group.plotCount ?? groupDetail?.plots?.length ?? 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Total Area
            </span>
            <span className="font-semibold text-foreground">
              {(group.totalArea ?? groupDetail?.totalArea ?? 0)} ha
            </span>
          </div>
        </div>

        {/* Supervisor Info */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Supervisor
          </p>
          <p className="font-medium text-foreground mt-1">
            {supervisorName}
          </p>
          <p className="text-xs text-muted-foreground">
            {supervisorEmail}
          </p>
        </div>

        {/* Plan Status */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Plan Status
          </p>
          {isLoadingDetail ? (
            <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <PlanStatusBadge status={uiStatus} />
          )}
        </div>

        {/* Action button */}
        <Button
          className={buttonConfig.className}
          disabled={buttonConfig.disabled || isLoadingDetail}
          onClick={handleButtonClick}
        >
          {isLoadingDetail ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : (
            buttonConfig.label
          )}
        </Button>
      </div>
    </Card>
  );
};

const ClusterDashboard = () => {
  const user = useUser();
  const [showFormationModal, setShowFormationModal] = useState(false);

  const [selectedGroupForView, setSelectedGroupForView] = useState<{
    id: string;
    name: string;
    totalArea: number;
  } | null>(null);

  // Get ClusterManagerId from logged-in user
  const clusterManagerId = user?.data?.id || '';

  // Fetch the actual clusterId using ClusterManagerId
  const {
    data: clusterIdData,
    isLoading: isLoadingClusterId,
    error: clusterIdError,
  } = useClusterId({
    clusterManagerId,
    queryConfig: {
      enabled: !!clusterManagerId && !!user,
    },
  });

  const clusterId = clusterIdQuery.data?.clusterId || '';
  const isLoadingClusterId = clusterIdQuery.isLoading;
  const clusterIdError = clusterIdQuery.error;

  // Fetch cluster data from API
  const {
    data: currentSeason,
    isLoading: isLoadingSeason,
    error,
  } = useClusterCurrentSeason({
    clusterId,
    queryConfig: {
      enabled: !!clusterId,
    },
  });

  const currentSeason = currentSeasonQuery.data;
  const isLoadingSeason = currentSeasonQuery.isLoading;
  const error = currentSeasonQuery.error;

  const historyDataQuery = useClusterHistory({
    params: { clusterId, limit: 4 },
    queryConfig: {
      enabled: !!clusterId,
    },
  });
  const historyData = historyDataQuery.data;

  const seasonsDataQuery = useClusterSeasons({
    params: { clusterId, limit: 10 },
    queryConfig: {
      enabled: !!clusterId,
    },
  });
  const seasonsData = seasonsDataQuery.data;

  const { data: globalSeason } = useCurrentSeason();

  // ================== PLOTS DATA (for PlotsOverviewCard) ==================
  const { data: plotsData } = usePlots({
    params: {
      pageNumber: 1,
      pageSize: 10,
    },
    queryConfig: {
      enabled: !!clusterId,
    },
  });

  const overviewPlots =
    plotsData?.data?.map((plot) => {
      const plantingDate = plot.seasons?.[0]?.startDate;
      return {
        plotId: plot.plotId,
        plotName: `Plot ${plot.soThua}/${plot.soTo}`,
        crop: plot.varietyName || 'Unknown',
        area: plot.area,
        plantingDate: plantingDate ? plantingDate.slice(0, 10) : 'N/A',
        owner: plot.farmerName,
        status: plot.status as any,
      };
    }) ?? [];

  const totalPlotsFromApi = plotsData?.totalCount;

  const isLoading = isLoadingClusterId || isLoadingSeason;

  // màu dot cho group
  const groupColors = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#0ea5e9'];

  // ================== LOADING / ERROR STATES ==================

  if (isLoading) {
    return (
      <ContentLayout title="Cluster Manager Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading cluster data...</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (!user?.data) {
    return (
      <ContentLayout title="Cluster Manager Dashboard">
        <Card className="border-destructive/50">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Failed to Load Cluster ID
              </h3>
              <p className="text-muted-foreground mb-4">
                {clusterIdError.message ||
                  'Could not fetch cluster information for your account.'}
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </ContentLayout>
    );
  }

  if (clusterIdError) {
    return (
      <ContentLayout title="Cluster Manager Dashboard">
        <Card className="border-destructive/50">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Failed to Load Cluster ID
              </h3>
              <p className="text-muted-foreground mb-4">
                {clusterIdError.message ||
                  'Could not fetch cluster information for your account.'}
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout title="Cluster Manager Dashboard">
        <Card className="border-destructive/50">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Failed to Load Cluster Data
              </h3>
              <p className="text-muted-foreground mb-4">
                {error.message ||
                  'An error occurred while fetching cluster information.'}
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </ContentLayout>
    );
  }

  if (!clusterId || !currentSeason) {
    return (
      <ContentLayout title="Cluster Manager Dashboard">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-warning mx-auto" />
            <div>
              <h3 className="font-semibold text-lg mb-2">No Cluster Assigned</h3>
              <p className="text-muted-foreground">
                You don&apos;t have a cluster assigned yet. Please contact your
                administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </ContentLayout>
    );
  }

  // ================== QUICK STATS ==================

  const stats = [
    {
      label: 'Farmers',
      value: currentSeason?.riceVarietySelection?.totalFarmers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Plots',
      value: currentSeason?.readiness?.availablePlots || 0,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: 'Varieties',
      value: currentSeason?.riceVarietySelection?.selections?.length || 0,
      icon: Sprout,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      label: 'Selection Rate',
      value: `${currentSeason.riceVarietySelection?.selectionCompletionRate?.toFixed(0) ||
        0
        }%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
  ];

  // ================== MAIN RENDER ==================

  return (
    <ContentLayout title="Cluster Manager Dashboard">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {currentSeason?.clusterName}
                </h1>
                <Badge
                  variant={currentSeason.hasGroups ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {currentSeason.hasGroups ? 'Groups Active' : 'Forming Stage'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">
                  {globalSeason?.displayName ||
                    `${currentSeason.currentSeason.seasonName} ${currentSeason.currentSeason.year}`}
                </span>
                {globalSeason && (
                  <>
                    <span>•</span>
                    <span>Day {globalSeason?.daysIntoSeason}</span>
                    <span>•</span>
                    <span>
                      {globalSeason.startDate} - {globalSeason.endDate}
                    </span>
                  </>
                )}
              </div>
            </div>
            <SeasonSelectorV0
              seasons={seasonsData || null}
              currentClusterId={clusterId}
            />
          </div>
        </div>

        {/* Quick Stats Grid */}
        {!currentSeason.hasGroups && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {!currentSeason.hasGroups && (
              <CurrentSeasonCardV0 data={currentSeason} />
            )}

            {!currentSeason.hasGroups && currentSeason.readiness && (
              <>
                <PlotsOverviewCard
                  plots={overviewPlots as any}
                  totalPlots={
                    totalPlotsFromApi ?? currentSeason.readiness.availablePlots
                  }
                  onViewAll={() => {
                    window.location.href = '/app/cluster/plots';
                  }}
                />

                <SupervisorOverviewCard
                  supervisors={[
                    {
                      supervisorId: '1',
                      name: 'John Smith',
                      email: 'john.smith@example.com',
                      phone: '+1 234-567-8901',
                      assignedGroups: 0,
                      totalPlots: 0,
                      totalArea: 0,
                      status: 'Available',
                    },
                    {
                      supervisorId: '2',
                      name: 'Sarah Johnson',
                      email: 'sarah.johnson@example.com',
                      phone: '+1 234-567-8902',
                      assignedGroups: 0,
                      totalPlots: 0,
                      totalArea: 0,
                      status: 'Available',
                    },
                    {
                      supervisorId: '3',
                      name: 'Michael Brown',
                      email: 'michael.brown@example.com',
                      phone: '+1 234-567-8903',
                      assignedGroups: 1,
                      totalPlots: 15,
                      totalArea: 45.5,
                      status: 'Assigned',
                    },
                    {
                      supervisorId: '4',
                      name: 'Emily Davis',
                      email: 'emily.davis@example.com',
                      phone: '+1 234-567-8904',
                      assignedGroups: 0,
                      totalPlots: 0,
                      totalArea: 0,
                      status: 'Available',
                    },
                  ]}
                  totalSupervisors={currentSeason.readiness.availableSupervisors}
                  onViewAll={() => {
                    console.log('View all supervisors');
                  }}
                />
              </>
            )} */}

            {historyData &&
              historyData.seasons &&
              historyData.seasons.length > 0 && (
                <HistoryChartV0 data={historyData} />
              )}
          </div>

          {/* Right: Readiness Panel (1/3) – chỉ hiện khi CHƯA form groups */}
          {!currentSeason.hasGroups && (
            <div className="lg:col-span-1">
              <ReadinessPanelV0
                readiness={currentSeason.readiness}
                hasGroups={currentSeason.hasGroups}
                onViewDetails={() => {
                  console.log('View readiness details');
                }}
                onFormGroups={() => setShowFormationModal(true)}
              />
            </div>
          )}
        </div>

        {/* ================== ACTIVE GROUPS SECTION (UPDATED) ================== */}
        {currentSeason.hasGroups &&
          currentSeason.groups &&
          currentSeason.groups.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Active Groups
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentSeason.groups.length} groups managing{' '}
                    {currentSeason.groups.reduce(
                      (sum: number, g: any) => sum + (g.plotCount || 0),
                      0,
                    )}{' '}
                    plots
                  </p>
                </div>
              </div>

              {/* Grid nhóm theo design GroupCard */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentSeason.groups.map((g: any, index: number) => (
                  <GroupCard
                    key={g.groupId}
                    group={g}
                    index={index}
                    groupColors={groupColors}
                    onSelectGroup={setSelectedGroupForView}
                  />
                ))}
              </div>
            </div>
          )}

        {/* Group Formation Modal */}
        {currentSeason?.readiness && (
          <GroupFormationModal
            isOpen={showFormationModal}
            onClose={() => setShowFormationModal(false)}
            clusterId={clusterId}
            seasonId={currentSeason?.currentSeason?.seasonId || ''}
            year={currentSeason?.currentSeason?.year || new Date().getFullYear()}
            availablePlots={currentSeason?.readiness?.availablePlots || 0}
          />
        )}

        {/* Production Plan Detail Dialog (View Only) */}
        {selectedGroupForView && (
          <ProductionPlanDetailDialog
            isOpen={!!selectedGroupForView}
            onClose={() => setSelectedGroupForView(null)}
            groupId={selectedGroupForView.id}
          />
        )}
      </div>
    </ContentLayout>
  );
};

export default ClusterDashboard;