import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { GroupFormationParams, GroupPreviewResult } from '../types';

export const previewGroupFormation = async (
  params: GroupFormationParams,
): Promise<GroupPreviewResult> => {
  const queryParams = new URLSearchParams({
    clusterId: params.clusterId,
    seasonId: params.seasonId,
    year: params.year.toString(),
    proximityThreshold: params.proximityThresholdMeters.toString(),
    plantingDateTolerance: params.plantingDateToleranceDays.toString(),
    minGroupArea: params.minGroupAreaHa.toString(),
    maxGroupArea: params.maxGroupAreaHa.toString(),
    minPlotsPerGroup: params.minPlots.toString(),
    maxPlotsPerGroup: params.maxPlots.toString(),
  });

  const response = await api.get(`/Group/preview?${queryParams.toString()}`);
  
  // Transform backend response to frontend format
  return {
    totalGroupsFormed: response.summary?.groupsToBeFormed || 0,
    totalPlotsGrouped: response.summary?.plotsGrouped || 0,
    ungroupedPlots: response.summary?.ungroupedPlots || 0,
    proposedGroups: response.previewGroups?.map((group: any) => ({
      tempGroupId: `group-${group.groupNumber}`,
      riceVariety: group.riceVarietyName,
      plantingDateRange: {
        earliest: group.plantingWindowStart,
        latest: group.plantingWindowEnd,
        varianceDays: 0, // Calculate if needed
      },
      plotCount: group.plotCount,
      totalArea: group.totalArea,
      compactness: 'compact' as const, // Determine based on data if available
      radiusKm: 0, // Calculate if needed
      isReadyForUAV: group.plotCount >= 5, // Example logic
      plots: group.plots?.map((plot: any) => ({
        plotId: plot.plotId,
        farmerName: plot.farmerName,
        area: plot.area,
      })) || [],
    })) || [],
    ungroupedPlotsList: response.ungroupedPlots || [],
  };
};

type UsePreviewGroupFormationOptions = {
  mutationConfig?: MutationConfig<typeof previewGroupFormation>;
};

export const usePreviewGroupFormation = ({
  mutationConfig,
}: UsePreviewGroupFormationOptions = {}) => {
  return useMutation({
    mutationFn: previewGroupFormation,
    ...mutationConfig,
  });
};

