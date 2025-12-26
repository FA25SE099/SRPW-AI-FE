'use client';

import { useState, useEffect, useMemo } from 'react';
import { ContentLayout } from '@/components/layouts';
import {
  CurrentSeasonCardV0,
  ReadinessPanelV0,
  HistoryChartV0,
  SeasonSelectorV0,
  GroupFormationModal,
  GroupFormationModalV2,
  PlotsOverviewCard,
  SupervisorOverviewCard,
} from '@/features/cluster/components';
import {
  useClusterCurrentSeason,
  useClusterHistory,
  useClusterSeasons,
  useCurrentSeason,
  useClusterId,
  useClusterSupervisors,
} from '@/features/cluster/api';
import {
  useYearSeasonsByCluster,
  useYearSeasonReadiness,
  useYearSeasonFarmerSelections,
  useYearSeasonGroups,
} from '@/features/yearseason';
import { transformToClusterCurrentSeason, transformToClusterSeasonsList } from '@/features/cluster/utils/yearseason-transform';
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
  Layers,
  Building2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlanStatusBadge } from '@/components/ui/plan-status-badge';
import { usePlots } from '@/features/plots/api/get-all-plots';
import { usePlotsByYearSeason } from '@/features/plots/api/get-plots-by-yearseason';

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
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground text-lg">
              {group.groupName || `Group ${index + 1}`}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {group.riceVarietyName || groupDetail?.riceVarietyName || 'Rice Variety'} • {group.plotCount} plots • {group.totalArea.toFixed(1)} ha
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
  const [selectedYearSeasonId, setSelectedYearSeasonId] = useState<string | null>(null);

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

  const clusterId = clusterIdData?.clusterId || '';

  // ================== NEW: Fetch YearSeason data ==================
  // Step 1: Get all YearSeasons for the cluster
  const yearSeasonsQuery = useYearSeasonsByCluster({
    clusterId,
    queryConfig: {
      enabled: !!clusterId,
    },
  });

  const yearSeasonsData = yearSeasonsQuery.data as import('@/features/yearseason/types').YearSeasonsByClusterResponse | undefined;
  const currentYearSeasonId = yearSeasonsData?.currentSeason?.id || '';

  // Use selected yearSeasonId if set, otherwise use current
  const activeYearSeasonId = selectedYearSeasonId || currentYearSeasonId;

  // Update selectedYearSeasonId when currentYearSeasonId becomes available
  // Only set initial value if nothing selected
  useEffect(() => {
    if (currentYearSeasonId && selectedYearSeasonId === null) {
      setSelectedYearSeasonId(currentYearSeasonId);
    }
  }, [currentYearSeasonId, selectedYearSeasonId]);
  // Log when activeYearSeasonId changes
  useEffect(() => {
    console.log('🔄 activeYearSeasonId changed to:', activeYearSeasonId);
    console.log('🔑 Expected Query Keys:');
    console.log('  - Readiness:', ['yearseason', activeYearSeasonId, 'readiness']);
    console.log('  - Farmer Selections:', ['yearseason', activeYearSeasonId, 'farmer-selections']);
    console.log('  - Groups:', ['yearseason', activeYearSeasonId, 'groups']);
  }, [activeYearSeasonId]);

  // Step 2: Get readiness info for active YearSeason
  const readinessQuery = useYearSeasonReadiness({
    id: activeYearSeasonId,
    queryConfig: {
      enabled: !!activeYearSeasonId,
    },
  });
  const typedReadinessData = readinessQuery.data as import('@/features/yearseason/types').YearSeasonReadinessResponse | undefined;

  // Step 3: Get farmer selections for active YearSeason
  const farmerSelectionsQuery = useYearSeasonFarmerSelections({
    id: activeYearSeasonId,
    queryConfig: {
      enabled: !!activeYearSeasonId,
    },
  });
  const typedFarmerSelectionsData = farmerSelectionsQuery.data as import('@/features/yearseason/types').YearSeasonFarmerSelectionsResponse | undefined;

  // Step 4: Get groups for active YearSeason (when groups exist)
  const groupsQuery = useYearSeasonGroups({
    yearSeasonId: activeYearSeasonId,
    queryConfig: {
      enabled: !!activeYearSeasonId,
    },
  });
  const typedGroupsData = groupsQuery.data as import('@/features/yearseason/api/get-yearseason-groups').YearSeasonGroupsResponse | undefined;

  // Transform to legacy format for compatibility
  // Find the selected season's data to pass to transform
  const allSeasons = [
    yearSeasonsData?.currentSeason,
    ...(yearSeasonsData?.pastSeasons || []),
    ...(yearSeasonsData?.upcomingSeasons || []),
  ].filter(Boolean);

  const selectedSeasonData = allSeasons.find(s => s?.id === activeYearSeasonId);

  // Create a modified yearSeasonsData that uses the selected season as "current"
  const modifiedYearSeasonsData = selectedSeasonData ? {
    ...yearSeasonsData,
    currentSeason: selectedSeasonData,
  } : yearSeasonsData;

  const currentSeasonData = transformToClusterCurrentSeason(
    modifiedYearSeasonsData as any,
    typedReadinessData,
    typedFarmerSelectionsData
  );

  // Override groups with data from groups API if available
  if (currentSeasonData && typedGroupsData?.groups) {
    currentSeasonData.groups = typedGroupsData.groups.map((g: any) => ({
      groupId: g.groupId,
      groupName: g.groupName || undefined,
      supervisorId: g.supervisorId || '',
      supervisorName: g.supervisorName || 'Unassigned',
      supervisorEmail: undefined,
      riceVarietyId: typedGroupsData.riceVarietyId,
      riceVarietyName: typedGroupsData.riceVarietyName,
      plantingDate: g.plantingDate || '',
      status: g.status,
      plotCount: g.plotCount,
      totalArea: g.totalArea,
    }));
  }

  // Debug: Log the YearSeason data
  console.log('=== YEARSEASON DATA FOR CLUSTER ===');
  console.log('Cluster ID:', clusterId);
  console.log('Cluster Name:', yearSeasonsData?.clusterName);
  console.log('\n📊 Total YearSeasons in Cluster:', {
    current: yearSeasonsData?.currentSeason ? 1 : 0,
    past: yearSeasonsData?.pastSeasons?.length || 0,
    upcoming: yearSeasonsData?.upcomingSeasons?.length || 0,
    total: (yearSeasonsData?.currentSeason ? 1 : 0) +
      (yearSeasonsData?.pastSeasons?.length || 0) +
      (yearSeasonsData?.upcomingSeasons?.length || 0),
  });

  console.log('\n🟢 Current Season:', yearSeasonsData?.currentSeason ? {
    id: yearSeasonsData.currentSeason.id,
    seasonId: yearSeasonsData.currentSeason.seasonId,
    displayName: yearSeasonsData.currentSeason.displayName,
    seasonName: yearSeasonsData.currentSeason.seasonName,
    year: yearSeasonsData.currentSeason.year,
    groupCount: yearSeasonsData.currentSeason.groupCount,
  } : 'No current season');

  console.log('\n⚪ Past Seasons:', yearSeasonsData?.pastSeasons?.map(s => ({
    id: s.id,
    seasonId: s.seasonId,
    displayName: s.displayName,
    seasonName: s.seasonName,
    year: s.year,
    groupCount: s.groupCount,
  })) || []);

  console.log('\n🔵 Upcoming Seasons:', yearSeasonsData?.upcomingSeasons?.map(s => ({
    id: s.id,
    seasonId: s.seasonId,
    displayName: s.displayName,
    seasonName: s.seasonName,
    year: s.year,
    groupCount: s.groupCount,
  })) || []);

  console.log('\n📋 Dashboard Data Debug:', {
    selectedYearSeasonId,
    currentYearSeasonId,
    activeYearSeasonId,
    'Are they different?': activeYearSeasonId !== currentYearSeasonId,
    'Selected Season Data': selectedSeasonData ? {
      id: selectedSeasonData.id,
      displayName: selectedSeasonData.displayName,
      year: selectedSeasonData.year,
    } : null,
    hasGroups: currentSeasonData?.hasGroups,
    groupsCount: currentSeasonData?.groups?.length,
    groups: currentSeasonData?.groups,
    readinessHasGroups: typedReadinessData?.hasGroups,
    groupsApiData: typedGroupsData?.groups?.length,
    groupsApiTotal: typedGroupsData?.totalGroupCount,
    'Readiness Query State': {
      isFetching: readinessQuery.isFetching,
      isLoading: readinessQuery.isLoading,
      dataUpdatedAt: readinessQuery.dataUpdatedAt,
    },
    'Farmer Selections Query State': {
      isFetching: farmerSelectionsQuery.isFetching,
      isLoading: farmerSelectionsQuery.isLoading,
      dataUpdatedAt: farmerSelectionsQuery.dataUpdatedAt,
    },
    'Groups Query State': {
      isFetching: groupsQuery.isFetching,
      isLoading: groupsQuery.isLoading,
      dataUpdatedAt: groupsQuery.dataUpdatedAt,
    },
  });
  console.log('=== END YEARSEASON DATA ===\n');

  const isLoadingSeason = yearSeasonsQuery.isLoading || readinessQuery.isLoading;
  const seasonError = yearSeasonsQuery.error || readinessQuery.error;

  const currentSeason = currentSeasonData;

  // Transform seasons list for selector
  const seasonsData = transformToClusterSeasonsList(yearSeasonsData);

  // History data - use past seasons from YearSeason API
  const pastSeasons = yearSeasonsData?.pastSeasons?.slice(0, 4) || [];
  const historyData = pastSeasons.length > 0 ? {
    clusterId,
    clusterName: yearSeasonsData?.clusterName || '',
    seasons: pastSeasons.map((season) => ({
      seasonId: season.seasonId,
      seasonName: season.seasonName,
      year: season.year,
      groupCount: season.groupCount,
      plotCount: 0, // TODO: Fetch from dashboard if needed
      farmerCount: 0, // TODO: Fetch from dashboard if needed
      totalArea: 0, // TODO: Fetch from dashboard if needed
      riceVarieties: [],
    })),
  } : undefined;

  // Handle season selection change
  const handleSeasonChange = (yearSeasonId: string) => {
    console.log('🔄 Season Change Requested:', { yearSeasonId });
    console.log('🔄 Current selectedYearSeasonId:', selectedYearSeasonId);
    console.log('🔄 Current currentYearSeasonId:', currentYearSeasonId);

    // Check if we're actually changing to a different season
    if (yearSeasonId === selectedYearSeasonId) {
      console.warn('⚠️ You selected the same season that is already active!');
      console.warn('⚠️ Please select a DIFFERENT season from the dropdown to see data change.');
    } else {
      console.log('✅ Changing to a DIFFERENT season!');
      console.log('✅ Setting selectedYearSeasonId to:', yearSeasonId);
    }

    setSelectedYearSeasonId(yearSeasonId);
  };

  const { data: globalSeason } = useCurrentSeason();

  // ================== PLOTS DATA (for PlotsOverviewCard) ==================
  // Use YearSeason-specific plots API
  // Memoize params to ensure stable reference and proper refetching
  const plotsParams = useMemo(() => ({
    yearSeasonId: activeYearSeasonId,
    pageNumber: 1,
    pageSize: 10,
    clusterManagerId,
  }), [activeYearSeasonId, clusterManagerId]);

  // Log when params change
  useEffect(() => {
    console.log('🔑 Plots Params Changed:', plotsParams);
    console.log('🔑 YearSeasonId being used:', activeYearSeasonId);
    console.log('🔑 Expected Query Key:', [
      'plots',
      'by-year-season',
      activeYearSeasonId,
      1,
      10,
      undefined,
      clusterManagerId,
      undefined,
      undefined,
      undefined,
    ]);
    console.log('🔑 Params object:', {
      yearSeasonId: activeYearSeasonId,
      pageNumber: 1,
      pageSize: 10,
      clusterManagerId,
    });
  }, [activeYearSeasonId, clusterManagerId]);

  const { data: plotsData, isFetching: isFetchingPlots, dataUpdatedAt: plotsDataUpdatedAt } = usePlotsByYearSeason({
    params: plotsParams,
    queryConfig: {
      enabled: !!activeYearSeasonId && !!clusterManagerId,
    },
  });
  
  const typedPlotsData = plotsData as import('@/features/plots/api/get-plots-by-yearseason').YearSeasonPlotsResponse | undefined;

  // ================== SUPERVISORS DATA ==================
  const { data: supervisorsData, isLoading: isLoadingSupervisors, error: supervisorsError } = useClusterSupervisors({
    clusterId,
    queryConfig: {
      enabled: !!clusterId,
    },
  });

  // Debug logging
  console.log('Supervisors Data:', supervisorsData);
  console.log('Supervisors Loading:', isLoadingSupervisors);
  console.log('Supervisors Error:', supervisorsError);

  const overviewPlots =
    typedPlotsData?.data?.map((plot) => {
      // Format planting date safely
      let plantingDateDisplay = 'Not Selected';
      if (plot.selectedPlantingDate) {
        try {
          const date = new Date(plot.selectedPlantingDate);
          if (!isNaN(date.getTime())) {
            plantingDateDisplay = date.toLocaleDateString('en-GB');
          }
        } catch (error) {
          console.error('Error parsing date:', plot.selectedPlantingDate, error);
        }
      }

      // Map to correct status for PlotsOverviewCard
      let status: 'Ready' | 'Pending' | 'Issue' = 'Pending';
      if (plot.hasMadeSelection) {
        status = 'Ready';
      }

      return {
        plotId: plot.plotId,
        plotName: `Plot ${plot.soThua}/${plot.soTo}`,
        crop: plot.selectedRiceVarietyName || plot.yearSeasonRiceVarietyName || 'Not Selected',
        area: plot.area,
        plantingDate: plantingDateDisplay,
        owner: plot.farmerName,
        status,
      };
    }) ?? [];

  // Log plots query state - AFTER overviewPlots is defined
  useEffect(() => {
    console.log('📊 Plots Query State:', {
      isFetching: isFetchingPlots,
      dataUpdatedAt: plotsDataUpdatedAt,
      totalPlots: typedPlotsData?.totalCount,
      plotsLength: typedPlotsData?.data?.length,
      overviewPlotsLength: overviewPlots.length,
      yearSeasonId: activeYearSeasonId,
    });
  }, [isFetchingPlots, plotsDataUpdatedAt, typedPlotsData?.totalCount, typedPlotsData?.data?.length, overviewPlots.length, activeYearSeasonId]);

  const totalPlotsFromApi = typedPlotsData?.totalCount;

  // Transform supervisor data for SupervisorOverviewCard
  const supervisors = supervisorsData?.map((supervisor) => {
    const groupCount = supervisor.supervisedGroups?.length || 0;
    const status: 'Available' | 'Assigned' | 'Busy' =
      groupCount === 0 ? 'Available' :
        groupCount < 3 ? 'Assigned' : 'Busy';

    return {
      supervisorId: supervisor.supervisorId,
      name: supervisor.supervisorName,
      email: 'N/A', // API doesn't return email
      phone: 'N/A', // API doesn't return phone
      assignedGroups: groupCount,
      totalPlots: supervisor.supervisedGroups?.reduce((sum, group) => sum + group.plotCount, 0) || 0,
      totalArea: supervisor.supervisedGroups?.reduce((sum, group) => sum + group.totalArea, 0) || 0,
      status,
    };
  }) || [];

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
                Failed to Load User Data
              </h3>
              <p className="text-muted-foreground mb-4">
                {clusterIdError?.message ||
                  'Could not fetch user information.'}
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

  if (seasonError) {
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
                {seasonError.message ||
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
      label: 'Supervisors',
      value: currentSeason?.readiness?.availableSupervisors || 0, icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ];

  // ================== MAIN RENDER ==================

  return (
    <div>
      <div className="space-y-6">
        <div className="bg-white border-b border-neutral-200 px-6 py-4 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
              <Building2 className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Cluster Manager Dashboard
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                Monitor and manage your cluster: farmers, plots, groups, and production plans
              </p>
            </div>
          </div>
        </div>
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
                  {selectedSeasonData?.displayName ||
                    `${currentSeason.currentSeason.seasonName} ${currentSeason.currentSeason.year}`}
                </span>
                {selectedSeasonData && (
                  <>
                    <span>•</span>
                    <span>Year {selectedSeasonData.year}</span>
                  </>
                )}
                {/* Show global season info only if viewing the actual current season */}
                {globalSeason && activeYearSeasonId === currentYearSeasonId && (
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
              selectedYearSeasonId={selectedYearSeasonId || undefined}
              onSeasonChange={handleSeasonChange}
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
            {/* Commented out Rice Variety Selection Progress UI */}
            {/* {!currentSeason.hasGroups && (
              <CurrentSeasonCardV0 data={currentSeason} />
            )} */}

            {!currentSeason.hasGroups && currentSeason.readiness && (
              <>
                <PlotsOverviewCard
                  key={`plots-${activeYearSeasonId}-${plotsDataUpdatedAt}`}
                  plots={overviewPlots}
                  totalPlots={
                    totalPlotsFromApi ?? currentSeason.readiness.availablePlots
                  }
                  onViewAll={() => {
                    window.location.href = '/app/cluster/plots';
                  }}
                />

                <SupervisorOverviewCard
                  supervisors={supervisors}
                  totalSupervisors={supervisorsData?.length || 0}
                  onViewAll={() => {
                    console.log('Alert admin: No supervisors assigned to cluster');
                    // TODO: Implement admin notification system
                  }}
                />
              </>
            )}

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
                  <p className="textF-sm text-muted-foreground mt-1">
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

        {/* Group Formation Modal - New Workflow with Editable Preview */}
        {currentSeason?.readiness && (
          <GroupFormationModalV2
            isOpen={showFormationModal}
            onClose={() => setShowFormationModal(false)}
            clusterId={clusterId}
            seasonId={currentSeason?.currentSeason?.seasonId || ''}
            year={currentSeason?.currentSeason?.year || new Date().getFullYear()}
            availablePlots={currentSeason?.readiness?.availablePlots || 0}
            onGroupsCreated={async () => {
              // Refresh YearSeason data after groups are created
              await yearSeasonsQuery.refetch();
              await readinessQuery.refetch();
              await farmerSelectionsQuery.refetch();
              await groupsQuery.refetch();
              setShowFormationModal(false);
            }}
          />
        )}

        {selectedGroupForView && (
          <ProductionPlanDetailDialog
            isOpen={!!selectedGroupForView}
            onClose={() => setSelectedGroupForView(null)}
            groupId={selectedGroupForView.id}
          />
        )}
      </div>
    </div>
  );
};

export default ClusterDashboard;