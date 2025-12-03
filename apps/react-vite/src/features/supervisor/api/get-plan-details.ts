import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { PlanDetails } from '@/types/plan';

export const getPlanDetails = (planId: string): Promise<PlanDetails> => {
  return api.get(`/supervisor/plan/${planId}/details`);
};

export const getPlanDetailsQueryOptions = (planId: string) => {
  return queryOptions({
    queryKey: ['supervisor-plan-details', planId],
    queryFn: () => getPlanDetails(planId),
    enabled: !!planId,
  });
};

type UsePlanDetailsOptions = {
  planId: string;
  queryConfig?: QueryConfig<typeof getPlanDetails>;
};

export const usePlanDetails = ({ planId, queryConfig }: UsePlanDetailsOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['supervisor-plan-details', planId],
    queryFn: () => getPlanDetails(planId),
    enabled: queryConfig?.enabled ?? !!planId,
  });
};

