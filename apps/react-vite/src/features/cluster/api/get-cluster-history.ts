import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { ClusterHistory } from '../types';

export type GetClusterHistoryParams = {
  clusterId: string;
  seasonId?: string;
  year?: number;
  limit?: number;
};

export const getClusterHistory = ({
  clusterId,
  seasonId,
  year,
  limit,
}: GetClusterHistoryParams): Promise<ClusterHistory> => {
  const params = new URLSearchParams();
  if (seasonId) params.append('seasonId', seasonId);
  if (year) params.append('year', year.toString());
  if (limit) params.append('limit', limit.toString());

  const queryString = params.toString();
  const url = `/Cluster/${clusterId}/history${queryString ? `?${queryString}` : ''}`;

  return api.get(url);
};

export const getClusterHistoryQueryOptions = (params: GetClusterHistoryParams) =>
  queryOptions({
    queryKey: ['cluster-history', params],
    queryFn: () => getClusterHistory(params),
  });

type UseClusterHistoryOptions = {
  params: GetClusterHistoryParams;
  queryConfig?: QueryConfig<typeof getClusterHistory>;
};

export const useClusterHistory = ({
  params,
  queryConfig,
}: UseClusterHistoryOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['cluster-history', params],
    queryFn: () => getClusterHistory(params),
  });
};

