import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { ProductionPlan } from '../types';

export const getProductionPlan = async (planId: string): Promise<ProductionPlan> => {
  return api.get(`/production-plans/${planId}`);
};

type UseProductionPlanOptions = {
  planId: string;
  queryConfig?: QueryConfig<typeof getProductionPlan>;
};

export const useProductionPlan = ({
  planId,
  queryConfig,
}: UseProductionPlanOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['production-plan', planId],
    queryFn: () => getProductionPlan(planId),
  });
};

