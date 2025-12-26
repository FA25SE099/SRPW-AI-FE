/**
 * Utility functions to transform YearSeason API responses to legacy ClusterCurrentSeason format
 * This allows gradual migration from old Cluster endpoints to new YearSeason endpoints
 */

import {
  YearSeasonsByClusterResponse,
  YearSeasonReadinessResponse,
  YearSeasonFarmerSelectionsResponse,
} from '@/features/yearseason';
import { ClusterCurrentSeason, ClusterHistory, ClusterSeasonsList } from '../types';

/**
 * Transform YearSeason data to legacy ClusterCurrentSeason format
 */
export function transformToClusterCurrentSeason(
  yearSeasonsData: YearSeasonsByClusterResponse | undefined,
  readinessData: YearSeasonReadinessResponse | undefined,
  farmerSelectionsData: YearSeasonFarmerSelectionsResponse | undefined
): ClusterCurrentSeason | undefined {
  if (!yearSeasonsData?.currentSeason) {
    return undefined;
  }

  const current = yearSeasonsData.currentSeason;
  const hasGroups = readinessData?.hasGroups || false;

  return {
    clusterId: yearSeasonsData.clusterId,
    clusterName: yearSeasonsData.clusterName,
    currentSeason: {
      seasonId: current.seasonId,
      seasonName: current.seasonName,
      year: current.year,
      isCurrent: true,
    },
    hasGroups,

    // Map readiness if available and no groups formed
    readiness: !hasGroups && readinessData?.readiness
      ? {
          isReadyToFormGroups: readinessData.readiness.isReadyToFormGroups,
          availableFarmers: readinessData.readiness.availableFarmers,
          availablePlots: readinessData.readiness.availablePlots,
          plotsWithPolygon: readinessData.readiness.plotsWithPolygon,
          plotsWithoutPolygon: readinessData.readiness.plotsWithoutPolygon,
          availableSupervisors: readinessData.readiness.availableSupervisors,
          blockingIssues: readinessData.readiness.blockingIssues,
          recommendations: readinessData.readiness.recommendations,
          readinessScore: readinessData.readiness.readinessScore,
        }
      : undefined,

    // Map farmer selections if available
    riceVarietySelection: farmerSelectionsData?.selectionStatus
      ? {
          totalFarmers: farmerSelectionsData.selectionStatus.totalFarmers,
          farmersWithSelection: farmerSelectionsData.selectionStatus.farmersWithSelection,
          farmersPending: farmerSelectionsData.selectionStatus.farmersPending,
          selectionCompletionRate: farmerSelectionsData.selectionStatus.selectionCompletionRate,
          selections:
            farmerSelectionsData.selectionStatus.varietySelections.map((v) => ({
              varietyId: v.varietyId,
              varietyName: v.varietyName,
              selectedBy: v.selectedByCount,
              previousSeason: v.previousSeasonCount,
              switchedIn: v.switchedIn,
              switchedOut: v.switchedOut,
            })) || [],
          pendingFarmers:
            farmerSelectionsData.selectionStatus.pendingFarmers.map((f) => ({
              farmerId: f.farmerId,
              farmerName: f.farmerName,
              previousVariety: f.previousVariety,
              plotCount: f.plotCount,
            })) || [],
        }
      : undefined,

    // Map groups if available
    groups: hasGroups && readinessData?.groups
      ? readinessData.groups.map((g) => ({
          groupId: g.groupId,
          groupName: g.groupName,
          supervisorId: g.supervisorId,
          supervisorName: g.supervisorName,
          supervisorEmail: g.supervisorEmail,
          riceVarietyId: g.riceVarietyId,
          riceVarietyName: g.riceVarietyName,
          plantingDate: g.plantingDate,
          status: g.status,
          plotCount: g.plotCount,
          totalArea: g.totalArea,
        }))
      : undefined,
  };
}

/**
 * Transform YearSeasons by Cluster to legacy ClusterSeasonsList format
 */
export function transformToClusterSeasonsList(
  yearSeasonsData: YearSeasonsByClusterResponse | undefined
): ClusterSeasonsList | undefined {
  if (!yearSeasonsData) {
    return undefined;
  }

  return {
    currentSeason: yearSeasonsData.currentSeason
      ? {
          id: yearSeasonsData.currentSeason.id, // Add yearseason ID
          seasonId: yearSeasonsData.currentSeason.seasonId,
          seasonName: yearSeasonsData.currentSeason.seasonName,
          year: yearSeasonsData.currentSeason.year,
          displayName: yearSeasonsData.currentSeason.displayName,
          isCurrent: true,
          hasGroups: yearSeasonsData.currentSeason.groupCount > 0,
          groupCount: yearSeasonsData.currentSeason.groupCount,
          canFormGroups: yearSeasonsData.currentSeason.groupCount === 0,
        }
      : undefined,
    pastSeasons: yearSeasonsData.pastSeasons.map((s) => ({
      id: s.id, // Add yearseason ID
      seasonId: s.seasonId,
      seasonName: s.seasonName,
      year: s.year,
      displayName: s.displayName,
      hasGroups: s.groupCount > 0,
      groupCount: s.groupCount,
    })),
    upcomingSeasons: yearSeasonsData.upcomingSeasons.map((s) => ({
      id: s.id, // Add yearseason ID
      seasonId: s.seasonId,
      seasonName: s.seasonName,
      year: s.year,
      displayName: s.displayName,
    })),
  };
}

