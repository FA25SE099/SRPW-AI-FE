import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { StandardPlanReview } from '@/types/api';

type ReviewParams = {
  id: string;
  sowDate: string;
  areaInHectares: number;
};

export const getStandardPlanReview = async ({
  id,
  sowDate,
  areaInHectares,
}: ReviewParams): Promise<StandardPlanReview> => {
  const params = new URLSearchParams({
    sowDate,
    areaInHectares: areaInHectares.toString(),
  });
  
  return api.get(`/standardplan/${id}/review?${params.toString()}`);
};

export const getStandardPlanReviewQueryOptions = (params: ReviewParams) => {
  return queryOptions({
    queryKey: ['standard-plan-review', params],
    queryFn: () => getStandardPlanReview(params),
    enabled: !!params.id && !!params.sowDate && params.areaInHectares > 0,
  });
};

type UseStandardPlanReviewOptions = {
  params: ReviewParams;
  queryConfig?: QueryConfig<typeof getStandardPlanReview>;
};

export const useStandardPlanReview = ({ params, queryConfig }: UseStandardPlanReviewOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['standard-plan-review', params],
    queryFn: () => getStandardPlanReview(params),
    enabled: !!params.id && !!params.sowDate && params.areaInHectares > 0 && (queryConfig?.enabled !== false),
  });
};

