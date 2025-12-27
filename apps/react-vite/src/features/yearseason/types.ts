// YearSeason Core Types
export type YearSeasonStatus = 'Draft' | 'PlanningOpen' | 'Active' | 'Completed';

export type YearSeason = {
  id: string;
  seasonId: string;
  clusterId: string;
  year: number;
  riceVarietyId?: string | null; // 🔄 CHANGED: Now optional - farmers can select their own
  riceVarietyName?: string;
  startDate: string;
  endDate: string;
  planningWindowStart: string;
  planningWindowEnd: string;
  allowedPlantingFlexibilityDays: number;
  materialConfirmationDaysBeforePlanting: number;
  status: YearSeasonStatus;
  
  // ✨ NEW: Farmer Selection Feature Fields
  allowFarmerSelection?: boolean; // Toggle for farmer selection feature
  farmerSelectionWindowStart?: string | null; // ISO date string
  farmerSelectionWindowEnd?: string | null; // ISO date string
};

export type YearSeasonListItem = {
  id: string;
  seasonName: string;
  year: number;
  status: YearSeasonStatus;
  startDate: string;
  endDate: string;
  riceVarietyName: string;
  clusterName: string;
};

// ✨ NEW: Farmer Selection Status Types
export type VarietyDistribution = {
  varietyId: string;
  varietyName: string;
  plotCount: number;
  totalArea: number;
  farmerCount: number;
};

export type FarmerSelectionStatus = {
  isEnabled: boolean;
  selectionWindowStart: string | null;
  selectionWindowEnd: string | null;
  isSelectionWindowOpen: boolean;
  daysUntilDeadline: number | null;
  totalPlots: number;
  confirmedPlots: number;
  pendingPlots: number;
  completionPercentage: number;
  varietyDistribution: VarietyDistribution[];
};

// Dashboard Types
export type YearSeasonDashboard = {
  season: {
    yearSeasonId: string;
    seasonName: string;
    year: number;
    status: YearSeasonStatus;
    startDate: string;
    endDate: string;
    riceVarietyName: string;
    clusterName: string;
    expertName: string;
  };
  groupStatus: {
    totalGroups: number;
    activeGroups: number;
    groupsWithSupervisor: number;
    totalAreaHectares: number;
    totalFarmersInGroups: number;
  };
  planningStatus: {
    totalPlans: number;
    plansApproved: number;
    plansPendingApproval: number;
    groupsWithPlans: number;
    groupsWithoutPlans: number;
    planningCompletionRate: number;
  };
  materialStatus: {
    totalDistributions: number;
    distributionsCompleted: number;
    distributionsPending: number;
    distributionsOverdue: number;
    materialCompletionRate: number;
  };
  timeline: YearSeasonTimeline;
  alerts: YearSeasonAlert[];
  
  // ✨ NEW: Farmer selection progress status
  selectionStatus?: FarmerSelectionStatus | null;
};

export type YearSeasonTimeline = {
  planningWindowStart: string;
  planningWindowEnd: string;
  seasonStartDate: string;
  seasonEndDate: string;
  daysUntilSeasonStart: number;
  daysUntilSeasonEnd: number;
  progressPercentage: number;
  isPlanningWindowOpen: boolean;
  hasSeasonStarted: boolean;
  hasSeasonEnded?: boolean;
  daysElapsed?: number;
  daysRemaining?: number;
  daysUntilPlanningWindowStart?: number;
  daysUntilPlanningWindowEnd?: number;
};

export type YearSeasonAlert = {
  type: 'Error' | 'Warning' | 'Success' | 'Info';
  code: string;
  message: string;
  category: string;
  timestamp: string;
  metadata?: Record<string, any>;
};

// Validation Types
export type ValidateProductionPlanRequest = {
  groupId: string;
  basePlantingDate: string;
};

export type ValidationError = {
  code: string;
  message: string;
  severity: 'Error';
};

export type ValidationWarning = {
  code: string;
  message: string;
  severity: 'Warning';
};

export type YearSeasonValidationContext = {
  yearSeasonId: string;
  seasonName: string;
  year: number;
  status: YearSeasonStatus;
  startDate: string;
  endDate: string;
  planningWindowEnd?: string;
  daysUntilPlanningWindowEnd?: number;
  isPlanningWindowOpen: boolean;
  groupPlantingDate?: string;
  allowedPlantingFlexibilityDays?: number;
};

export type ProductionPlanValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  yearSeasonContext: YearSeasonValidationContext;
};

// Create/Update Types (for Expert)
export type CreateYearSeasonDto = {
  seasonId: string;
  clusterId: string;
  year: number;
  riceVarietyId?: string | null; // 🔄 CHANGED: Now optional
  startDate: string;
  endDate: string;
  planningWindowStart: string;
  planningWindowEnd: string;
  allowedPlantingFlexibilityDays?: number;
  materialConfirmationDaysBeforePlanting?: number;
  
  // ✨ NEW: Farmer Selection Feature Fields
  allowFarmerSelection?: boolean;
  farmerSelectionWindowStart?: string | null;
  farmerSelectionWindowEnd?: string | null;
};

export type UpdateYearSeasonDto = Partial<CreateYearSeasonDto>;

export type UpdateYearSeasonStatusDto = {
  id?: string; // Optional because it's added automatically in the API call
  status: YearSeasonStatus;
};

// ============================================
// YearSeason Readiness Types
// ============================================
export type YearSeasonReadiness = {
  isReadyToFormGroups: boolean;
  availablePlots: number;
  plotsWithPolygon: number;
  plotsWithoutPolygon: number;
  availableSupervisors: number;
  availableFarmers: number;
  farmersWithSelection: number; // NEW: Number of farmers who made their selection
  readinessScore: number;
  blockingIssues: string[];
  recommendations: string[];
};

export type YearSeasonReadinessResponse = {
  yearSeasonId: string;
  seasonName: string;
  year: number;
  clusterName: string;
  hasGroups: boolean;
  readiness?: YearSeasonReadiness;
  groups?: Array<{
    groupId: string;
    groupName: string;
    supervisorId: string;
    supervisorName: string;
    supervisorEmail?: string;
    riceVarietyId: string;
    riceVarietyName: string;
    plantingDate: string;
    status: string;
    plotCount: number;
    totalArea: number;
  }>;
};

// ============================================
// YearSeason Farmer Selections Types
// ============================================
export type VarietySelection = {
  varietyId: string;
  varietyName: string;
  selectedByCount: number;
  previousSeasonCount: number;
  isRecommended: boolean;
  switchedIn: number;
  switchedOut: number;
  percentageOfTotal: number;
};

export type PendingFarmer = {
  farmerId: string;
  farmerName: string;
  phoneNumber: string;
  previousVariety: string;
  plotCount: number;
  totalArea: number;
};

export type SelectionStatus = {
  totalFarmers: number;
  farmersWithSelection: number;
  farmersPending: number;
  selectionCompletionRate: number;
  varietySelections: VarietySelection[];
  pendingFarmers: PendingFarmer[];
};

export type YearSeasonFarmerSelectionsResponse = {
  yearSeasonId: string;
  seasonName: string;
  year: number;
  clusterName: string;
  clusterRiceVarietyId: string | null;
  clusterRiceVarietyName: string | null;
  allowFarmerSelection: boolean;
  selectionWindowStart: string | null;
  selectionWindowEnd: string | null;
  isSelectionWindowOpen: boolean;
  selectionStatus: SelectionStatus;
};

// ============================================
// YearSeasons by Cluster Response
// ============================================
export type YearSeasonSummary = {
  id: string;
  seasonId: string;
  seasonName: string;
  seasonType: string;
  year: number;
  riceVarietyId: string | null;
  riceVarietyName: string;
  startDate: string;
  endDate: string;
  status: YearSeasonStatus;
  groupCount: number;
  isCurrent: boolean;
  isPast: boolean;
  isUpcoming: boolean;
  displayName: string;
};

export type YearSeasonsByClusterResponse = {
  clusterId: string;
  clusterName: string;
  currentSeason: YearSeasonSummary | null;
  pastSeasons: YearSeasonSummary[];
  upcomingSeasons: YearSeasonSummary[];
  allSeasons: YearSeasonSummary[];
};

