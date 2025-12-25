import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, Calendar, Plus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGroupBySeason } from '@/features/supervisor/api/get-group-by-season';
import { useAvailableSeasons } from '@/features/supervisor/api/get-available-seasons';
import { ReadinessCard } from '@/features/supervisor/components/readiness-card';
import { GroupInfoCard } from '@/features/supervisor/components/group-info-card';
import { PlotsTable } from '@/features/supervisor/components/plots-table';
import { PlanProgressCard } from '@/features/supervisor/components/plan-progress-card';
import { EconomicsCard } from '@/features/supervisor/components/economics-card';
import { CultivationPlanDetailDialog } from '@/features/supervisor/components/cultivation-plan-detail-dialog';
import { CreateProductionPlanDialog } from '@/features/production-plans/components';
import { paths } from '@/config/paths';
import { Head } from '@/components/seo/head';
import { PlotDetail } from '@/types/group';

const SupervisorGroupPage = () => {
  const navigate = useNavigate();
  const [selectedSeason, setSelectedSeason] = useState<{
    seasonId?: string;
    year?: number;
  }>();
  const [selectedGroupId, setSelectedGroupId] = useState<string>();
  const [showCreatePlanDialog, setShowCreatePlanDialog] = useState(false);
  const [showCultivationPlanDialog, setShowCultivationPlanDialog] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<PlotDetail | null>(null);

  // Get available seasons for dropdown
  const { data: availableSeasonsData, isLoading: isLoadingSeasons } = useAvailableSeasons();

  // Ensure availableSeasons is always an array
  const availableSeasons = Array.isArray(availableSeasonsData) ? availableSeasonsData : [];

  // Get current or selected season's groups (now returns array)
  const { data: groupsData, isLoading, error } = useGroupBySeason({
    params: selectedSeason,
  });

  // Ensure groups is always an array
  const groups = Array.isArray(groupsData) ? groupsData : [];

  // Get selected group from array
  const group = groups.find((g: any) => g.groupId === selectedGroupId);

  // Auto-select first group when groups are loaded
  useEffect(() => {
    if (groups && groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].groupId);
    }
  }, [groups, selectedGroupId]);

  const handleSeasonChange = (value: string) => {
    if (value === 'current') {
      setSelectedSeason(undefined);
    } else {
      // Parse "seasonId|year" format (using | to avoid conflict with GUID hyphens)
      const [seasonId, yearStr] = value.split('|');
      setSelectedSeason({
        seasonId,
        year: parseInt(yearStr)
      });
    }
    setSelectedGroupId(undefined); // Reset group selection when season changes
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const handleCreateProductionPlan = () => {
    setShowCreatePlanDialog(true);
  };

  const handleFixPolygons = () => {
    navigate(paths.app.supervisor.dashboard.getHref());
  };

  const handleViewPlotDetail = (plot: PlotDetail) => {
    setSelectedPlot(plot);
    setShowCultivationPlanDialog(true);
  };

  const handleCloseCultivationPlanDialog = () => {
    setShowCultivationPlanDialog(false);
    setSelectedPlot(null);
  };

  if (isLoading || isLoadingSeasons) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    const errorMessage = error.message || '';
    const isNotFound =
      errorMessage.includes('404') ||
      errorMessage.includes('not found') ||
      errorMessage.includes('No group assigned');

    if (isNotFound && availableSeasons && availableSeasons.length > 0) {
      // Has other seasons but not this one - show selector
      return (
        <>
          <Head title="My Group Management" />

          <div className="space-y-6">
            <div className="bg-white border-b border-neutral-200 px-6 py-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
                  <Users className="size-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900">
                    My Group Management
                  </h1>
                  <p className="text-sm text-neutral-600 mt-1">
                    List groups assigned for the selected season
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Groups for This Season</AlertTitle>
              <AlertDescription>
                You don't have any groups assigned for this season. Try selecting a different season below.
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <Select
                value={selectedSeason ? `${selectedSeason.seasonId}|${selectedSeason.year}` : 'current'}
                onValueChange={handleSeasonChange}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a season" />
                </SelectTrigger>
                <SelectContent>
                  {availableSeasons.map((season: any) => (
                    <SelectItem
                      key={`${season.seasonId}-${season.year}`}
                      value={season.isCurrent ? 'current' : `${season.seasonId}|${season.year}`}
                    >
                      {season.displayName} {season.isCurrent && '(Current)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      );
    }

    // True error or no seasons at all
    return (
      <div className="space-y-4">
        <Alert variant={isNotFound ? 'default' : 'destructive'}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{isNotFound ? 'No Groups Assigned' : 'Error Loading Groups'}</AlertTitle>
          <AlertDescription>
            {isNotFound
              ? "You don't have any groups assigned yet. Please contact your cluster manager."
              : errorMessage || 'Failed to load your group information. Please try again later.'}
          </AlertDescription>
        </Alert>
        {!isNotFound && (
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Groups Found</AlertTitle>
          <AlertDescription>
            You don't have any groups assigned for this season.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!group) {
    // Still loading or auto-selecting first group
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Convert to legacy format for GroupInfoCard compatibility
  const groupInfoData = {
    groupName: group.groupName,
    status: group.status,
    season: group.season,
    plantingDate: group.plantingDate,
    totalArea: group.totalArea,
    riceVarietyName: group.riceVarietyName,
    clusterName: group.clusterName,
    productionPlans: group.planOverview ? {
      totalPlans: 1,
      activePlans: group.planOverview.status === 'InProgress' ? 1 : 0,
      draftPlans: group.planOverview.status === 'Draft' ? 1 : 0,
      approvedPlans: group.planOverview.status === 'Completed' ? 1 : 0,
      hasActiveProductionPlan: group.planOverview.status === 'InProgress',
    } : {
      totalPlans: 0,
      activePlans: 0,
      draftPlans: 0,
      approvedPlans: 0,
      hasActiveProductionPlan: false,
    },
  };

  return (
    <>
      <div className="space-y-6">
        {/* Beautiful Header - nhất quán với các trang khác */}
        <div className="bg-white border-b border-neutral-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
                <Users className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  My Groups - {group.season?.seasonName} {group.season?.year || (group as any).seasonYear}
                </h1>
                <p className="text-sm text-neutral-600 mt-1">
                  {(group as any).isCurrentSeason ? 'Current Season' : `Past Season (${group.season?.year || (group as any).seasonYear})`}
                  {groups.length > 1 && ` • Managing ${groups.length} groups`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {group.currentState === 'PrePlanning' && group.readiness?.isReady && !group.planOverview && (
                <Button onClick={handleCreateProductionPlan}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Production Plan
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Season and Group Selectors */}
        <div className="flex items-center gap-4">
          {/* Season Selector */}
          {availableSeasons && availableSeasons.length > 1 && (
            <>
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <Select
                value={selectedSeason ? `${selectedSeason.seasonId}|${selectedSeason.year}` : 'current'}
                onValueChange={handleSeasonChange}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  {availableSeasons.map((season: any) => (
                    <SelectItem
                      key={`${season.seasonId}-${season.year}`}
                      value={season.isCurrent ? 'current' : `${season.seasonId}|${season.year}`}
                    >
                      {season.displayName} {season.isCurrent && '(Current)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {/* Group Selector */}
          {groups.length > 1 && (
            <>
              <div className="text-muted-foreground">|</div>
              <Users className="h-5 w-5 text-muted-foreground" />
              <Select
                value={selectedGroupId || groups[0].groupId}
                onValueChange={handleGroupChange}
              >
                <SelectTrigger className="w-[350px]">
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.groupId} value={g.groupId}>
                      {g.groupName} - {g.clusterName} ({g.currentState})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* State-based Content */}
        <div className="space-y-6">
          {/* PrePlanning State - Show Readiness */}
          {group.currentState === 'PrePlanning' && group.readiness && (
            <>
              <ReadinessCard readiness={group.readiness} />
              <GroupInfoCard group={groupInfoData as any} />
              {group.planOverview && (
                <PlanProgressCard progress={group.planOverview} />
              )}
              <PlotsTable
                plots={group.plots}
                groupId={group.groupId}
                onViewDetail={handleViewPlotDetail}
              />
            </>
          )}

          {/* Planning State - Show Basic Plan Info */}
          {group.currentState === 'Planning' && (
            <>
              <GroupInfoCard group={groupInfoData as any} />
              {group.planOverview && (
                <PlanProgressCard progress={group.planOverview} />
              )}
              <PlotsTable
                plots={group.plots}
                groupId={group.groupId}
                onViewDetail={handleViewPlotDetail}
              />
            </>
          )}

          {/* InProduction State - Show Progress */}
          {group.currentState === 'InProduction' && (
            <>
              <GroupInfoCard group={groupInfoData as any} />
              {group.planOverview && (
                <PlanProgressCard progress={group.planOverview} />
              )}
              <PlotsTable
                plots={group.plots}
                groupId={group.groupId}
                onViewDetail={handleViewPlotDetail}
              />
            </>
          )}

          {/* Completed/Archived State - Show Progress + Economics */}
          {(group.currentState === 'Completed' || group.currentState === 'Archived') && (
            <>
              <GroupInfoCard group={groupInfoData as any} />
              {group.planOverview && (
                <PlanProgressCard progress={group.planOverview} />
              )}
              {group.economicsOverview && (
                <EconomicsCard economics={group.economicsOverview} />
              )}
              <PlotsTable
                plots={group.plots}
                groupId={group.groupId}
                onViewDetail={handleViewPlotDetail}
              />
            </>
          )}
        </div>
      </div>

      {/* Create Production Plan Dialog */}
      {group && (
        <CreateProductionPlanDialog
          isOpen={showCreatePlanDialog}
          onClose={() => setShowCreatePlanDialog(false)}
          groupId={group.groupId}
          groupName={group.groupName}
          totalArea={group.totalArea || 1}
          seasonId={group.season.seasonId}
        />
      )}

      {/* Cultivation Plan Detail Dialog */}
      {selectedPlot && group && (
        <CultivationPlanDetailDialog
          isOpen={showCultivationPlanDialog}
          onClose={handleCloseCultivationPlanDialog}
          plotId={selectedPlot.plotId}
          groupId={group.groupId}
          plotName={`Tờ ${selectedPlot.soTo}, Thửa ${selectedPlot.soThua}`}
        />
      )}
    </>
  );
};

export default SupervisorGroupPage;
