import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

type GetClusterIdResponse = {
  clusterId: string;
};

export const getClusterId = (
  clusterManagerId: string,
): Promise<GetClusterIdResponse> => {
  const url = `/ClusterManager/get-cluster-id?clusterManagerId=${clusterManagerId}`;

  return api.get<string>(url).then((response: any) => {
    const clusterId = typeof response === 'string' ? response : response.data;
    return { clusterId };
  });
};

export const getClusterIdQueryOptions = (clusterManagerId: string) =>
  queryOptions({
    queryKey: ['cluster-manager-id', clusterManagerId],
    queryFn: () => getClusterId(clusterManagerId),
    enabled: !!clusterManagerId,
  });

type UseClusterIdOptions = {
  clusterManagerId: string;
  queryConfig?: QueryConfig<typeof getClusterId>;
};

export const useClusterId = ({
  clusterManagerId,
  queryConfig,
}: UseClusterIdOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['cluster-manager-id', clusterManagerId],
    queryFn: () => getClusterId(clusterManagerId),
    enabled: !!clusterManagerId,
  });
};

