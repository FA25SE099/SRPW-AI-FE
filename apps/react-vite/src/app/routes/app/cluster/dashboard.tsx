import { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import {
  CurrentSeasonCardV0,
  ReadinessPanelV0,
  HistoryChartV0,
  SeasonSelectorV0,
  GroupFormationModal,
  GroupsDashboard,
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
import { CreateProductionPlanDialog } from '@/features/production-plans/components';
import { useUser } from '@/lib/auth';
import {
  Loader2,
  AlertCircle,
  Users,
  MapPin,
  Sprout,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ClusterDashboard = () => {
  const user = useUser();
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [showCreatePlanDialog, setShowCreatePlanDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);

  // Get ClusterManagerId from logged-in user
  const clusterManagerId = user?.data?.id || '';

  // Fetch the actual clusterId using ClusterManagerId
  const clusterIdQuery = useClusterId({
    clusterManagerId,
    queryConfig: {
      enabled: !!clusterManagerId && !!user,
    },
  });

  const clusterId = clusterIdQuery.data?.clusterId || '';
  const isLoadingClusterId = clusterIdQuery.isLoading;
  const clusterIdError = clusterIdQuery.error;

  // Fetch cluster data from API
  const currentSeasonQuery = useClusterCurrentSeason({
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

  const globalSeasonQuery = useCurrentSeason();
  const globalSeason = globalSeasonQuery.data;

  const isLoading = isLoadingClusterId || isLoadingSeason || !user;

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
              <h3 className="font-semibold text-lg mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">
                Unable to load user information. Please try logging in again.
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
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
              <h3 className="font-semibold text-lg mb-2">Failed to Load Cluster ID</h3>
              <p className="text-muted-foreground mb-4">
                {clusterIdError.message || 'Could not fetch cluster information for your account.'}
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
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
              <h3 className="font-semibold text-lg mb-2">Failed to Load Cluster Data</h3>
              <p className="text-muted-foreground mb-4">
                {error.message || 'An error occurred while fetching cluster information.'}
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
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
                You don't have a cluster assigned yet. Please contact your administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </ContentLayout>
    );
  }

  // Calculate quick stats
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
      value: `${currentSeason?.riceVarietySelection?.selectionCompletionRate?.toFixed(0) || 0}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
  ];

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
                <Badge variant={currentSeason?.hasGroups ? 'default' : 'secondary'} className="text-xs">
                  {currentSeason?.hasGroups ? 'Groups Active' : 'Forming Stage'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">
                  {globalSeason?.displayName || `${currentSeason?.currentSeason?.seasonName} ${currentSeason?.currentSeason?.year}`}
                </span>
                {globalSeason && (
                  <>
                    <span>•</span>
                    <span>Day {globalSeason?.daysIntoSeason}</span>
                    <span>•</span>
                    <span>{globalSeason?.startDate} - {globalSeason?.endDate}</span>
                  </>
                )}
              </div>
            </div>
            <SeasonSelectorV0 seasons={seasonsData || null} currentClusterId={clusterId} />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <CurrentSeasonCardV0 data={currentSeason} />

            {/* Show Plots Overview only when in Forming Stage (no groups) */}
            {/* {!currentSeason?.hasGroups && currentSeason?.readiness && (
              <>
                <PlotsOverviewCard
                  plots={[
                    {
                      plotId: '1',
                      plotName: 'Plot A-01',
                      crop: 'Rice',
                      area: 5.2,
                      plantingDate: '2025-12-01',
                      owner: 'Farm Corp A',
                      status: 'Ready',
                    },
                    {
                      plotId: '2',
                      plotName: 'Plot A-02',
                      crop: 'Rice',
                      area: 4.8,
                      plantingDate: '2025-12-01',
                      owner: 'Farm Corp A',
                      status: 'Ready',
                    },
                    {
                      plotId: '3',
                      plotName: 'Plot A-03',
                      crop: 'Wheat',
                      area: 6.1,
                      plantingDate: '2025-11-15',
                      owner: 'Farm Corp A',
                      status: 'Ready',
                    },
                    {
                      plotId: '4',
                      plotName: 'Plot B-01',
                      crop: 'Rice',
                      area: 5.5,
                      plantingDate: '2025-12-01',
                      owner: 'Farm Corp B',
                      status: 'Ready',
                    },
                    {
                      plotId: '5',
                      plotName: 'Plot B-02',
                      crop: 'Maize',
                      area: 4.2,
                      plantingDate: '2025-12-10',
                      owner: 'Farm Corp B',
                      status: 'Ready',
                    },
                    {
                      plotId: '6',
                      plotName: 'Plot B-03',
                      crop: 'Rice',
                      area: 7.0,
                      plantingDate: '2025-12-01',
                      owner: 'Farm Corp B',
                      status: 'Pending',
                    },
                    {
                      plotId: '7',
                      plotName: 'Plot C-01',
                      crop: 'Wheat',
                      area: 5.8,
                      plantingDate: '2025-11-15',
                      owner: 'Farm Corp C',
                      status: 'Ready',
                    },
                    {
                      plotId: '8',
                      plotName: 'Plot C-02',
                      crop: 'Wheat',
                      area: 6.3,
                      plantingDate: '2025-11-20',
                      owner: 'Farm Corp C',
                      status: 'Ready',
                    },
                    {
                      plotId: '9',
                      plotName: 'Plot B-15',
                      crop: 'Rice',
                      area: 4.5,
                      plantingDate: '2025-12-01',
                      owner: 'Farm Corp B',
                      status: 'Issue',
                    },
                    {
                      plotId: '10',
                      plotName: 'Plot D-01',
                      crop: 'Maize',
                      area: 5.0,
                      plantingDate: '2025-12-10',
                      owner: 'Farm Corp D',
                      status: 'Ready',
                    },
                  ]}
                  totalPlots={currentSeason?.readiness?.availablePlots || 0}
                  onViewAll={() => window.location.href = '/app/cluster/plots'}
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
                  totalSupervisors={currentSeason?.readiness?.availableSupervisors || 0}
                  onViewAll={() => console.log('View all supervisors')}
                />
              </>
            )} */}

            {historyData && historyData.seasons && historyData.seasons.length > 0 && (
              <HistoryChartV0 data={historyData} />
            )}
          </div>

          {/* Right: Readiness Panel (1/3) */}
          <div className="lg:col-span-1">
            <ReadinessPanelV0
              readiness={currentSeason?.readiness}
              hasGroups={currentSeason?.hasGroups || false}
              onViewDetails={() => console.log('View readiness details')}
              onFormGroups={() => setShowFormationModal(true)}
            />
          </div>
        </div>

        {/* Active Groups Section */}
        {currentSeason?.hasGroups && currentSeason?.groups && currentSeason.groups.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Active Groups</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentSeason.groups.length} groups managing {currentSeason.groups.reduce((sum, g) => sum + g.plotCount, 0)} plots
                </p>
              </div>
            </div>
            <GroupsDashboard
              groups={currentSeason.groups}
              clusterId={clusterId}
              seasonId={currentSeason?.currentSeason?.seasonId || ''}
              onCreatePlan={(groupId) => {
                const group = currentSeason?.groups?.find(g => g.groupId === groupId);
                if (group) {
                  setSelectedGroup({ id: groupId, name: `Group ${group.riceVarietyName}` });
                  setShowCreatePlanDialog(true);
                }
              }}
              onViewDetails={(groupId) => {
                console.log('View details for group:', groupId);
              }}
            />
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

        {/* Create Production Plan Dialog
        {selectedGroup && (
          <CreateProductionPlanDialog
            isOpen={showCreatePlanDialog}
            onClose={() => {
              setShowCreatePlanDialog(false);
              setSelectedGroup(null);
            }}
            groupId={selectedGroup.id}
            groupName={selectedGroup.name}
            seasonId={currentSeason.currentSeason.seasonId}
          />
        )} */}
      </div>
    </ContentLayout>
  );
};

export default ClusterDashboard;