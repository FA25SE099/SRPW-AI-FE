import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { ClusterSeasonsList } from '../types';

export type GetClusterSeasonsParams = {
  clusterId: string;
  includeEmpty?: boolean;
  limit?: number;
};

export const getClusterSeasons = ({
  clusterId,
  includeEmpty,
  limit,
}: GetClusterSeasonsParams): Promise<ClusterSeasonsList> => {
  const params = new URLSearchParams();
  if (includeEmpty !== undefined) params.append('includeEmpty', includeEmpty.toString());
  if (limit) params.append('limit', limit.toString());

  const queryString = params.toString();
  const url = `/Cluster/${clusterId}/seasons${queryString ? `?${queryString}` : ''}`;

  return api.get(url);
};

export const getClusterSeasonsQueryOptions = (params: GetClusterSeasonsParams) =>
  queryOptions({
    queryKey: ['cluster-seasons', params],
    queryFn: () => getClusterSeasons(params),
  });

type UseClusterSeasonsOptions = {
  params: GetClusterSeasonsParams;
  queryConfig?: QueryConfig<typeof getClusterSeasonsQueryOptions>;
};

export const useClusterSeasons = ({
  params,
  queryConfig,
}: UseClusterSeasonsOptions) => {
  return useQuery({
    ...getClusterSeasonsQueryOptions(params),
    ...queryConfig,
  }) as ReturnType<typeof useQuery<ClusterSeasonsList, Error>>;
};

