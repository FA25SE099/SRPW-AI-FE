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
      groupNumber: group.groupNumber,
      riceVariety: group.riceVarietyName,
      riceVarietyId: group.riceVarietyId,
      riceVarietyName: group.riceVarietyName,
      plantingDateRange: {
        earliest: group.plantingWindowStart,
        latest: group.plantingWindowEnd,
        varianceDays: Math.ceil(
          (new Date(group.plantingWindowEnd).getTime() - 
           new Date(group.plantingWindowStart).getTime()) / 
          (1000 * 60 * 60 * 24)
        ),
      },
      plantingWindowStart: group.plantingWindowStart,
      plantingWindowEnd: group.plantingWindowEnd,
      medianPlantingDate: group.medianPlantingDate,
      plotCount: group.plotCount,
      totalArea: group.totalArea,
      compactness: 'compact' as const,
      radiusKm: 0,
      isReadyForUAV: group.plotCount >= 5,
      centroidLat: group.centroidLat,
      centroidLng: group.centroidLng,
      groupBoundaryWkt: group.groupBoundaryWkt,
      groupBoundaryGeoJson: group.groupBoundaryGeoJson,
      plotIds: group.plotIds,
      plots: group.plots?.map((plot: any) => ({
        plotId: plot.plotId,
        farmerId: plot.farmerId,
        farmerName: plot.farmerName,
        farmerPhone: plot.farmerPhone,
        area: plot.area,
        plantingDate: plot.plantingDate,
        boundaryWkt: plot.boundaryWkt,
        boundaryGeoJson: plot.boundaryGeoJson,
        soilType: plot.soilType,
        soThua: plot.soThua,
        soTo: plot.soTo,
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

