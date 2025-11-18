import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, Calendar, Plus } from 'lucide-react';

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
import { CreateProductionPlanDialog } from '@/features/production-plans/components';
import { paths } from '@/config/paths';
import { Head } from '@/components/seo/head';

const SupervisorGroupPage = () => {
  const navigate = useNavigate();
  const [selectedSeason, setSelectedSeason] = useState<{
    seasonId?: string;
    year?: number;
  }>();
  const [showCreatePlanDialog, setShowCreatePlanDialog] = useState(false);

  // Get available seasons for dropdown
  const { data: availableSeasons, isLoading: isLoadingSeasons } = useAvailableSeasons();

  // Get current or selected season's group
  const { data: group, isLoading, error } = useGroupBySeason({
    params: selectedSeason,
  });

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
  };

  const handleCreateProductionPlan = () => {
    setShowCreatePlanDialog(true);
  };

  const handleFixPolygons = () => {
    navigate(paths.app.supervisor.dashboard.getHref());
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">My Group Management</h1>
                <p className="text-muted-foreground">
                  No group assigned for the selected season
                </p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Group for This Season</AlertTitle>
              <AlertDescription>
                You don't have a group assigned for this season. Try selecting a different season below.
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
                  {availableSeasons.map((season) => (
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
          <AlertTitle>{isNotFound ? 'No Group Assigned' : 'Error Loading Group'}</AlertTitle>
          <AlertDescription>
            {isNotFound
              ? "You don't have a group assigned yet. Please contact your cluster manager."
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

  if (!group) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Group Data</AlertTitle>
          <AlertDescription>
            Unable to load group information.
          </AlertDescription>
        </Alert>
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
      <Head title="My Group Management" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              My Group - {group.season.seasonName} {group.seasonYear}
            </h1>
            <p className="text-muted-foreground">
              {group.isCurrentSeason ? 'Current Season' : `Past Season (${group.seasonYear})`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {group.currentState === 'PrePlanning' && group.readiness?.isReady && !group.planOverview && (
              <Button onClick={handleCreateProductionPlan}>
                <Plus className="mr-2 h-4 w-4" />
                Create Production Plan
              </Button>
            )}
            {/* {group.currentState === 'PrePlanning' && !group.readiness?.isReady && (
              // <Button variant="outline" onClick={handleFixPolygons}>
              //   Fix {group.readiness?.plotsWithoutPolygon} Missing Polygons
              // </Button>
            )} */}
          </div>
        </div>

        {/* Season Selector */}
        {availableSeasons && availableSeasons.length > 1 && (
          <div className="flex items-center gap-4">Production Plan Readiness

            <Calendar className="h-5 w-5 text-muted-foreground" />
            <Select
              value={selectedSeason ? `${selectedSeason.seasonId}|${selectedSeason.year}` : 'current'}
              onValueChange={handleSeasonChange}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                {availableSeasons.map((season) => (
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
        )}

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
              <PlotsTable plots={group.plots} />
            </>
          )}

          {/* Planning State - Show Basic Plan Info */}
          {group.currentState === 'Planning' && (
            <>
              <GroupInfoCard group={groupInfoData as any} />
              {group.planOverview && (
                <PlanProgressCard progress={group.planOverview} />
              )}
              <PlotsTable plots={group.plots} />
            </>
          )}

          {/* InProduction State - Show Progress */}
          {group.currentState === 'InProduction' && (
            <>
              <GroupInfoCard group={groupInfoData as any} />
              {group.planOverview && (
                <PlanProgressCard progress={group.planOverview} />
              )}
              <PlotsTable plots={group.plots} />
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
              <PlotsTable plots={group.plots} />
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
          seasonId={group.season.seasonId}
        />
      )}
    </>
  );
};

export default SupervisorGroupPage;
