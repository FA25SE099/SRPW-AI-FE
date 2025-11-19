import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { GroupFormationParams, GroupPreviewResult } from '../types';

export const previewGroupFormation = (
  params: GroupFormationParams,
): Promise<GroupPreviewResult> => {
  const queryParams = new URLSearchParams({
    clusterId: params.clusterId,
    seasonId: params.seasonId,
    year: params.year.toString(),
    strategy: params.strategy,
    proximityThresholdMeters: params.proximityThresholdMeters.toString(),
    plantingDateToleranceDays: params.plantingDateToleranceDays.toString(),
    minGroupAreaHa: params.minGroupAreaHa.toString(),
    maxGroupAreaHa: params.maxGroupAreaHa.toString(),
    minPlots: params.minPlots.toString(),
    maxPlots: params.maxPlots.toString(),
    autoAssignSupervisors: params.autoAssignSupervisors.toString(),
  });

  return api.get(`/Group/preview?${queryParams.toString()}`);
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

