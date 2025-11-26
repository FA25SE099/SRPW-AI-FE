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
    tempGroupId: string;
    riceVariety: string;
    plantingDateRange: {
      earliest: string;
      latest: string;
      varianceDays: number;
    };
    suggestedSupervisor?: {
      supervisorId: string;
      supervisorName: string;
      currentPlotCount: number;
    };
    plotCount: number;
    totalArea: number;
    compactness: 'very-compact' | 'compact' | 'spread' | 'scattered';
    radiusKm: number;
    isReadyForUAV: boolean;
    plots: Array<{
      plotId: string;
      farmerName: string;
      area: number;
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
    coordinate: any;
    boundaryWkt: string;
    ungroupReason: string;
    reasonDescription: string;
    distanceToNearestGroup: number;
    nearestGroupNumber: number | null;
    suggestions: string[];
    nearbyGroups: Array<{
      groupId: string;
      groupNumber: number;
      distance: number;
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

