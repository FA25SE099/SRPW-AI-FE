import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { MaterialDistributionsResponse } from '../types';

export const getDistributionsByGroup = (
  groupId: string
): Promise<MaterialDistributionsResponse> => {
  return api.get(`/material-distribution/group/${groupId}`);
};

export const getDistributionsByGroupQueryOptions = (groupId: string) => {
  return queryOptions({
    queryKey: ['material-distributions', 'group', groupId],
    queryFn: () => getDistributionsByGroup(groupId),
    enabled: !!groupId,
  });
};

type UseDistributionsByGroupOptions = {
  groupId: string;
  queryConfig?: QueryConfig<typeof getDistributionsByGroupQueryOptions>;
};

export const useDistributionsByGroup = ({
  groupId,
  queryConfig,
}: UseDistributionsByGroupOptions) => {
  return useQuery({
    ...getDistributionsByGroupQueryOptions(groupId),
    ...queryConfig,
  } as any);
};

