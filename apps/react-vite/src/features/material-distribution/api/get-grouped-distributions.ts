import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { GroupedDistributionsResponse } from '../types';

export const getGroupedDistributions = (
  groupId: string
): Promise<GroupedDistributionsResponse> => {
  return api.get(`/material-distribution/group/${groupId}/grouped`);
};

export const getGroupedDistributionsQueryOptions = (groupId: string) => {
  return queryOptions({
    queryKey: ['material-distributions', 'grouped', groupId],
    queryFn: () => getGroupedDistributions(groupId),
    enabled: !!groupId,
  });
};

type UseGroupedDistributionsOptions = {
  groupId: string;
  queryConfig?: QueryConfig<typeof getGroupedDistributions>;
};

export const useGroupedDistributions = ({
  groupId,
  queryConfig,
}: UseGroupedDistributionsOptions) => {
  return useQuery({
    ...getGroupedDistributionsQueryOptions(groupId),
    ...(queryConfig as any),
  });
};

