import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { ProductionPlanDraft } from '../types';

export const getProductionPlanDraft = async (params: {
  standardPlanId: string;
  groupId: string;
  basePlantingDate: string;
}): Promise<ProductionPlanDraft> => {
  const queryParams = new URLSearchParams({
    standardPlanId: params.standardPlanId,
    groupId: params.groupId,
    basePlantingDate: params.basePlantingDate,
  });

  return api.get(`/production-plans/draft?${queryParams.toString()}`);
};

type UseProductionPlanDraftOptions = {
  params: {
    standardPlanId: string;
    groupId: string;
    basePlantingDate: string;
  };
  queryConfig?: QueryConfig<typeof getProductionPlanDraft>;
};

export const useProductionPlanDraft = ({
  params,
  queryConfig,
}: UseProductionPlanDraftOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['production-plan-draft', params],
    queryFn: () => getProductionPlanDraft(params),
  });
};

