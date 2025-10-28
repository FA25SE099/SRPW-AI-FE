import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { StandardPlanDetail } from '@/types/api';

export const getStandardPlanDetail = async (id: string): Promise<StandardPlanDetail> => {
  return api.get(`/standardplan/${id}`);
};

export const getStandardPlanDetailQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ['standard-plan', id],
    queryFn: () => getStandardPlanDetail(id),
    enabled: !!id,
  });
};

type UseStandardPlanDetailOptions = {
  id: string;
  queryConfig?: QueryConfig<typeof getStandardPlanDetailQueryOptions>;
};

export const useStandardPlanDetail = ({ id, queryConfig }: UseStandardPlanDetailOptions) => {
  return useQuery({
    ...getStandardPlanDetailQueryOptions(id),
    ...queryConfig,
  });
};

