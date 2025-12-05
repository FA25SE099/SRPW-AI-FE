import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { PlanDetail } from '@/types/api';

export const getPlanDetail = (planId: string): Promise<PlanDetail> => {
  return api.get(`/expert/plans/${planId}`);
};

export const getPlanDetailQueryOptions = (planId: string) => {
  return queryOptions({
    queryKey: ['plan-detail', planId],
    queryFn: () => getPlanDetail(planId),
    enabled: !!planId,
  });
};

type UsePlanDetailOptions = {
  planId: string;
  queryConfig?: QueryConfig<typeof getPlanDetail>;
};

export const usePlanDetail = ({ planId, queryConfig }: UsePlanDetailOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['plan-detail', planId],
    queryFn: () => getPlanDetail(planId),
    enabled: !!planId && (queryConfig?.enabled !== false),
  });
};


