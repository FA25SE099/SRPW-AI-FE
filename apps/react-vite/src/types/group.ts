// Group Management Types based on ViewGroupBySeason API

export interface SeasonInfo {
  seasonId: string;
  seasonName: string;
  seasonType: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  year?: number;
}

export interface PlotDetail {
  plotId: string;
  soThua: number | null;
  soTo: number | null;
  area: number;
  soilType: string | null;
  hasPolygon: boolean;
  polygonGeoJson: string | null;
  centroidGeoJson: string | null;
  status: string;
  farmerId: string;
  farmerName: string | null;
  farmerPhone: string | null;
  farmerAddress: string | null;
  farmCode: string | null;
  readiness?: PlotReadiness;
}

export interface PlotReadiness {
  isReady: boolean;
  blockingIssues: string[];
  warnings: string[];
  readinessLevel: string;
}

export interface GroupReadinessInfo {
  isReady: boolean;
  readinessScore: number;
  readinessLevel: string;
  hasRiceVariety: boolean;
  hasTotalArea: boolean;
  hasPlots: boolean;
  allPlotsHavePolygons: boolean;
  allPlotsReady?: boolean;
  blockingIssues: string[];
  warnings: string[];
  totalPlots: number;
  readyPlots?: number;
  plotsWithIssues?: number;
  plotsWithPolygon: number;
  plotsWithoutPolygon: number;
}

export interface PlanProgressOverview {
  productionPlanId: string;
  planName: string;
  status: string;
  basePlantingDate: string;
  submittedAt?: string | null;
  approvedAt?: string | null;
  totalStages: number;
  completedStages: number;
  inProgressStages?: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks?: number;
  overallProgressPercentage: number;
  daysElapsed: number;
  estimatedTotalDays?: number;
  estimatedDaysRemaining?: number;
  isOnSchedule: boolean;
  daysBehindSchedule: number | null;
  estimatedTotalCost: number;
  actualCostToDate: number;
  costVariancePercentage?: number;
  contingencyTasksCount: number;
  tasksWithInterruptions?: number;
  hasActiveIssues?: boolean;
  hasDetailedProgress?: boolean;
}

export interface EconomicsOverview {
  totalEstimatedCost: number;
  totalActualCost: number;
  costVariancePercentage: number;
  expectedYield: number;
  actualYield: number;
  yieldVariancePercentage: number;
  profitMargin: number;
  performanceRating: string;
}

export type GroupState = 'PrePlanning' | 'Planning' | 'InProduction' | 'Completed' | 'Archived';

export interface GroupBySeason {
  groupId: string;
  groupName: string;
  status: string;
  plantingDate: string | null;
  totalArea: number | null;
  areaGeoJson: string | null;
  riceVarietyId: string | null;
  riceVarietyName: string | null;
  season: SeasonInfo;
  seasonYear: number;
  isCurrentSeason: boolean;
  isPastSeason: boolean;
  clusterId: string;
  clusterName: string | null;
  currentState: GroupState;
  plots: PlotDetail[];
  readiness: GroupReadinessInfo | null;
  planOverview: PlanProgressOverview | null;
  economicsOverview: EconomicsOverview | null;
}

export interface AvailableSeason {
  seasonId: string;
  seasonName: string;
  seasonType: string;
  year: number;
  displayName: string;
  isCurrent: boolean;
  isPast: boolean;
  hasGroup: boolean;
}

// Legacy types for backward compatibility (deprecated)
export interface ProductionPlansSummary {
  totalPlans: number;
  activePlans: number;
  draftPlans: number;
  approvedPlans: number;
  hasActiveProductionPlan: boolean;
}

export interface MyGroupResponse {
  groupId: string;
  groupName: string;
  status: string;
  plantingDate: string | null;
  totalArea: number | null;
  areaGeoJson: string | null;
  riceVarietyId: string | null;
  riceVarietyName: string | null;
  season: SeasonInfo;
  clusterId: string;
  clusterName: string | null;
  plots: PlotDetail[];
  readiness: GroupReadinessInfo;
  productionPlans: ProductionPlansSummary;
}

export interface GroupHistorySummary {
  groupId: string;
  groupName: string;
  status: string;
  season: SeasonInfo;
  totalArea: number | null;
  totalPlots: number;
  riceVarietyName: string | null;
  plantingDate: string | null;
  productionPlansCount: number;
  clusterName: string | null;
}
