import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { ClusterCurrentSeason } from '../types';

export const getClusterCurrentSeason = (
  clusterId: string,
): Promise<ClusterCurrentSeason> => {
  return api.get(`/Cluster/${clusterId}/current-season`);
};

export const getClusterCurrentSeasonQueryOptions = (clusterId: string) =>
  queryOptions({
    queryKey: ['cluster-current-season', clusterId],
    queryFn: () => getClusterCurrentSeason(clusterId),
  });

type UseClusterCurrentSeasonOptions = {
  clusterId: string;
  queryConfig?: QueryConfig<typeof getClusterCurrentSeason>;
};

export const useClusterCurrentSeason = ({
  clusterId,
  queryConfig,
}: UseClusterCurrentSeasonOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['cluster-current-season', clusterId],
    queryFn: () => getClusterCurrentSeason(clusterId),
  });
};

