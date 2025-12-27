import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { MaterialDistribution } from '../types';

export const getPendingDistributions = (
  supervisorId: string
): Promise<MaterialDistribution[]> => {
  return api.get(`/material-distribution/supervisor/${supervisorId}/pending`);
};

export const getPendingDistributionsQueryOptions = (supervisorId: string) => {
  return queryOptions({
    queryKey: ['material-distributions', 'pending', supervisorId],
    queryFn: () => getPendingDistributions(supervisorId),
    enabled: !!supervisorId,
  });
};

type UsePendingDistributionsOptions = {
  supervisorId: string;
  queryConfig?: QueryConfig<typeof getPendingDistributionsQueryOptions>;
};

export const usePendingDistributions = ({
  supervisorId,
  queryConfig,
}: UsePendingDistributionsOptions) => {
  return useQuery({
    ...getPendingDistributionsQueryOptions(supervisorId),
    ...queryConfig,
  } as any);
};

