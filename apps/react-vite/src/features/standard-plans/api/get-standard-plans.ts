import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { StandardPlan } from '@/types/api';

type GetStandardPlansParams = {
  categoryId?: string;
  searchTerm?: string;
  isActive?: boolean;
};

export const getStandardPlans = async (
  params?: GetStandardPlansParams,
): Promise<StandardPlan[]> => {
  const queryParams = new URLSearchParams();
  
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm);
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

  const url = `/standardplan${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return api.get(url);
};

export const getStandardPlansQueryOptions = (params?: GetStandardPlansParams) => {
  return queryOptions({
    queryKey: ['standard-plans', params],
    queryFn: () => getStandardPlans(params),
  });
};

type UseStandardPlansOptions = {
  params?: GetStandardPlansParams;
  queryConfig?: QueryConfig<typeof getStandardPlansQueryOptions>;
};

export const useStandardPlans = ({ params, queryConfig }: UseStandardPlansOptions = {}) => {
  return useQuery({
    ...getStandardPlansQueryOptions(params),
    ...queryConfig,
  });
};

// Get individual standard plan by ID
export const getStandardPlan = async (standardPlanId: string): Promise<StandardPlan> => {
  return api.get(`/standardplan/${standardPlanId}`);
};

export const getStandardPlanQueryOptions = (standardPlanId: string) => {
  return queryOptions({
    queryKey: ['standard-plan', standardPlanId],
    queryFn: () => getStandardPlan(standardPlanId),
    enabled: !!standardPlanId,
  });
};

type UseStandardPlanOptions = {
  standardPlanId: string;
  queryConfig?: QueryConfig<typeof getStandardPlanQueryOptions>;
};

export const useStandardPlan = ({ standardPlanId, queryConfig }: UseStandardPlanOptions) => {
  return useQuery({
    ...getStandardPlanQueryOptions(standardPlanId),
    ...queryConfig,
  });
};

