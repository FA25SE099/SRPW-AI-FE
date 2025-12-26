// Cluster Management Types

// Current Season Types
export type ClusterCurrentSeason = {
  clusterId: string;
  clusterName: string;
  currentSeason: {
    seasonId: string;
    seasonName: string;
    year: number;
    isCurrent: boolean;
  };
  hasGroups: boolean;

  // Readiness Info (when hasGroups = false)
  readiness?: {
    isReadyToFormGroups: boolean;
    availableFarmers: number;
    availablePlots: number;
    plotsWithPolygon: number;
    plotsWithoutPolygon: number;
    availableSupervisors: number;
    farmersWithSelection?: number; // NEW: Number of farmers who completed selection
    blockingIssues: string[];
    recommendations: string[];
    readinessScore: number;
  };

  // Rice Variety Selection Progress
  riceVarietySelection?: {
    totalFarmers: number;
    farmersWithSelection: number;
    farmersPending: number;
    selectionCompletionRate: number;
    selections: Array<{
      varietyId: string;
      varietyName: string;
      selectedBy: number;
      previousSeason?: number;
      switchedIn?: number;
      switchedOut?: number;
    }>;
    pendingFarmers: Array<{
      farmerId: string;
      farmerName: string;
      previousVariety?: string;
      plotCount: number;
    }>;
  };

  // Active Groups (when hasGroups = true)
  groups?: Array<{
    groupId: string;
    groupName?: string; // e.g., "DC-DX25-ST2-G01"
    supervisorId: string;
    supervisorName: string;
    riceVarietyId: string;
    riceVarietyName: string;
    plantingDate: string;
    status: string;
    plotCount: number;
    totalArea: number;
  }>;
};

// Group Formation Parameters
export type GroupFormationParams = {
  clusterId: string;
  seasonId: string;
  year: number;
  strategy: 'quick' | 'balanced' | 'precise';
  proximityThresholdMeters: number;
  plantingDateToleranceDays: number;
  minGroupAreaHa: number;
  maxGroupAreaHa: number;
  minPlots: number;
  maxPlots: number;
  autoAssignSupervisors: boolean;
};

// Group Preview Result
export type GroupPreviewResult = {
  totalGroupsFormed: number;
  totalPlotsGrouped: number;
  ungroupedPlots: number;

  proposedGroups?: Array<{
    tempGroupId?: string;
    groupNumber?: number;
    groupName?: string;
    riceVariety: string;
    riceVarietyId?: string;
    riceVarietyName?: string;
    plantingDateRange?: {
      earliest: string;
      latest: string;
      varianceDays: number;
    };
    plantingWindowStart?: string;
    plantingWindowEnd?: string;
    medianPlantingDate?: string;
    suggestedSupervisor?: {
      supervisorId: string;
      supervisorName: string;
      currentPlotCount: number;
    };
    plotCount: number;
    totalArea: number;
    compactness?: 'very-compact' | 'compact' | 'spread' | 'scattered';
    radiusKm?: number;
    isReadyForUAV?: boolean;
    centroidLat?: number;
    centroidLng?: number;
    groupBoundaryWkt?: string;
    groupBoundaryGeoJson?: string;
    plotIds?: string[];
    plots: Array<{
      plotId: string;
      farmerId?: string;
      farmerName: string;
      farmerPhone?: string;
      area: number;
      plantingDate?: string;
      boundaryWkt?: string;
      boundaryGeoJson?: string;
      soilType?: string;
      soThua?: number;
      soTo?: number;
    }>;
  }>;

  ungroupedPlotsList?: Array<{
    plotId: string;
    farmerId: string;
    farmerName: string;
    farmerPhone: string;
    riceVarietyId: string;
    riceVarietyName: string;
    plantingDate: string;
    area: number;
    coordinate?: {
      lat: number;
      lng: number;
    };
    boundaryWkt?: string;
    boundaryGeoJson?: string;
    soilType?: string;
    soThua?: number;
    soTo?: number;
    ungroupReason: string;
    reasonDescription: string;
    distanceToNearestGroup: number;
    nearestGroupNumber: number | null;
    suggestions: string[];
    nearbyGroups: Array<{
      groupId?: string;
      groupNumber?: number;
      distance?: number;
    }>;
  }>;
};

// Cluster History
export type ClusterHistoryEntry = {
  seasonId: string;
  seasonName: string;
  year: number;
  groupCount: number;
  plotCount: number;
  farmerCount: number;
  totalArea: number;
  riceVarieties: Array<{
    varietyName: string;
    groupCount: number;
    plotCount: number;
  }>;
  averageYield?: number;
  totalProduction?: number;
};

export type ClusterHistory = {
  clusterId: string;
  clusterName: string;
  seasons: ClusterHistoryEntry[];
};

// Cluster Seasons List
export type ClusterSeasonsList = {
  currentSeason?: {
    id: string; // YearSeason ID
    seasonId: string;
    seasonName: string;
    year: number;
    displayName: string;
    isCurrent: true;
    hasGroups: boolean;
    groupCount: number;
    selectionProgress?: number;
    selectionsPending?: number;
    canFormGroups: boolean;
  };
  pastSeasons: Array<{
    id: string; // YearSeason ID
    seasonId: string;
    seasonName: string;
    year: number;
    displayName: string;
    hasGroups: boolean;
    groupCount: number;
    totalPlots?: number;
    totalArea?: number;
  }>;
  upcomingSeasons: Array<{
    id: string; // YearSeason ID
    seasonId: string;
    seasonName: string;
    year: number;
    displayName: string;
  }>;
};

// Current Season (Global)
export type CurrentSeason = {
  seasonId: string;
  seasonName: string;
  seasonType: string;
  year: number;
  startDate: string;
  endDate: string;
  displayName: string;
  isActive: boolean;
  daysIntoSeason: number;
};

// Group Formation Response
export type GroupFormationResponse = {
  success: boolean;
  groupsCreated: number;
  plotsAssigned: number;
  ungroupedPlots: number;
  createdGroups: Array<{
    groupId: string;
    groupName: string;
    riceVariety: string;
    supervisorId?: string;
    plotCount: number;
    totalArea: number;
  }>;
};

// Cluster Management Types
export type Cluster = {
  clusterId: string;
  clusterName: string;
  clusterManagerId: string;
  agronomyExpertId: string | null;
  clusterManagerName: string;
  clusterManagerPhoneNumber: string;
  clusterManagerEmail: string;
  agronomyExpertName: string | null;
  agronomyExpertPhoneNumber: string | null;
  agronomyExpertEmail: string | null;
  area: number | null;
  supervisors: SupervisorSummary[] | null;
};

export type ClusterManager = {
  clusterManagerId: string;
  clusterManagerName: string;
  clusterManagerPhoneNumber: string;
  email: string;
  clusterId: string | null;
  assignedDate: string | null;
};

export type AgronomyExpert = {
  expertId: string;
  expertName: string;
  expertPhoneNumber: string;
  email: string;
  clusterId: string | null;
  assignedDate: string | null;
};

export type SupervisorSummary = {
  supervisorId: string;
  fullName: string | null;
  phoneNumber: string | null;
  email: string | null;
  currentFarmerCount: number;
  maxFarmerCapacity: number;
  assignedDate: string | null;
};

export type Supervisor = {
  supervisorId: string;
  supervisorName: string;
  supervisorPhoneNumber: string;
  email: string;
  clusterId: string | null;
  assignedDate: string | null;
  currentFarmerCount: number;
  maxFarmerCapacity: number;
};

export type CreateSupervisorDto = {
  fullName: string;
  email: string;
  phoneNumber: string;
  maxFarmerCapacity?: number;
};

export type CreateClusterDto = {
  clusterName: string;
  clusterManagerId?: string | null;
  agronomyExpertId?: string | null;
  supervisorIds?: string[] | null;
};

export type CreateClusterManagerDto = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

export type CreateAgronomyExpertDto = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

export enum SortBy {
  NameAscending = 'NameAscending',
  NameDescending = 'NameDescending',
  DateCreatedAscending = 'DateCreatedAscending',
  DateCreatedDescending = 'DateCreatedDescending',
}

export type UpdateClusterDto = {
  clusterId: string;
  clusterName: string;
  clusterManagerId?: string | null;
  agronomyExpertId?: string | null;
  supervisorIds?: string[] | null;
};

// ========================================
// NEW GROUP FORMATION WORKFLOW TYPES
// ========================================

// Supervisor for assignment (available supervisors in preview)
export type SupervisorForAssignment = {
  supervisorId: string;
  fullName: string;
  phoneNumber?: string;
  clusterId?: string;
  clusterName?: string;

  // Current workload
  currentFarmerCount?: number; // Optional - not used for availability
  maxFarmerCapacity?: number; // Optional - not used for availability
  currentGroupCount: number;
  currentTotalArea: number;

  // Area capacity (from system settings) - PRIMARY CONSTRAINT
  maxAreaCapacity?: number; // Optional - main constraint for availability (if provided)
  remainingAreaCapacity?: number; // Optional - calculated remaining capacity (if maxAreaCapacity provided)

  // Availability (based on area capacity only, if available)
  isAvailable: boolean;
  unavailableReason?: string; // e.g., "Area capacity reached", "No remaining capacity"
};

// Enhanced Preview Response with supervisors and auto-generated names
export type PreviewGroupsResponse = {
  clusterId: string;
  seasonId: string;
  year: number;
  parameters: GroupingParameters;

  // List of available supervisors
  availableSupervisors: SupervisorForAssignment[];

  summary: PreviewSummary;
  previewGroups: PreviewGroup[];
  ungroupedPlots: UngroupedPlot[];
};

export type GroupingParameters = {
  proximityThreshold: number;
  plantingDateTolerance: number;
  minGroupArea: number;
  maxGroupArea: number;
  minPlotsPerGroup: number;
  maxPlotsPerGroup: number;
};

export type PreviewSummary = {
  totalEligiblePlots: number;
  plotsGrouped: number;
  ungroupedPlots: number;
  groupsToBeFormed: number;
  estimatedTotalArea: number;

  // Supervisor statistics
  supervisorsNeeded: number;
  supervisorsAvailable: number;
  groupsWithoutSupervisor: number;
  hasSufficientSupervisors: boolean;
};

export type PreviewGroup = {
  groupNumber: number;

  // Auto-generated group name
  groupName: string; // e.g., "CLS-W24-JAS-G01"

  riceVarietyId: string;
  riceVarietyName: string;

  // Auto-assigned supervisor
  supervisorId?: string;
  supervisorName?: string;

  plantingWindowStart: string;
  plantingWindowEnd: string;
  medianPlantingDate: string;
  plotCount: number;
  totalArea: number;
  centroidLat: number;
  centroidLng: number;
  groupBoundaryGeoJson?: string;
  plotIds: string[];
  plots: PlotInGroup[];
};

export type PlotInGroup = {
  plotId: string;
  farmerId?: string;
  farmerName: string;
  farmerPhone?: string;
  area: number;
  plantingDate?: string;
  boundaryWkt?: string;
  boundaryGeoJson?: string;
  soilType?: string;
  soThua?: number;
  soTo?: number;
};

export type UngroupedPlot = {
  plotId: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  riceVarietyId: string;
  riceVarietyName: string;
  plantingDate: string;
  area: number;
  coordinate?: {
    lat: number;
    lng: number;
  };
  boundaryWkt?: string;
  boundaryGeoJson?: string;
  soilType?: string;
  soThua?: number;
  soTo?: number;
  ungroupReason: string;
  reasonDescription: string;
  distanceToNearestGroup: number;
  nearestGroupNumber: number | null;
  suggestions: string[];
  nearbyGroups: Array<{
    groupId?: string;
    groupNumber?: number;
    distance?: number;
  }>;
};

// Form Groups From Preview Request
export type FormGroupsFromPreviewRequest = {
  clusterId: string;
  seasonId: string;
  year: number;
  createGroupsImmediately: boolean; // true = Active, false = Draft
  groups: PreviewGroupInput[];
};

export type PreviewGroupInput = {
  groupName?: string; // User can edit this
  riceVarietyId: string;
  plantingWindowStart: string; // ISO date string
  plantingWindowEnd: string; // ISO date string
  medianPlantingDate: string; // ISO date string
  plotIds: string[]; // Can be edited (add/remove plots)
  supervisorId?: string; // User can change this
};

// Form Groups Response (for both old and new endpoints)
// Note: API client unwraps Result<T> responses, so this is the inner data object
export type FormGroupsResponse = {
  groupsCreated: number;
  plotsAssigned: number;
  ungroupedPlots: number;
  createdGroups: Array<{
    groupId: string;
    groupName: string;
    riceVariety: string;
    supervisorId?: string;
    plotCount: number;
    totalArea: number;
  }>;
  warnings: string[];
};

