import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { PagedResult } from '@/types/api';
import {
  FarmerWithLateCountDTO,
  GetLateFarmersInClusterParams,
} from '../types';

export const getLateFarmers = (
  params: GetLateFarmersInClusterParams
): Promise<PagedResult<FarmerWithLateCountDTO[]>> => {
  return api.get('/LateFarmerRecord/farmers', {
    params: {
      agronomyExpertId: params.agronomyExpertId,
      supervisorId: params.supervisorId,
      pageNumber: params.pageNumber || 1,
      pageSize: params.pageSize || 10,
      searchTerm: params.searchTerm,
    },
  });
};

export const getLateFarmersQueryOptions = (
  params: GetLateFarmersInClusterParams
) => {
  return queryOptions({
    queryKey: ['late-farmers', params],
    queryFn: () => getLateFarmers(params),
  });
};

type UseLateFarmersOptions = {
  params: GetLateFarmersInClusterParams;
  queryConfig?: QueryConfig<typeof getLateFarmers>;
};

export const useLateFarmers = ({
  params,
  queryConfig,
}: UseLateFarmersOptions) => {
  return useQuery({
    ...getLateFarmersQueryOptions(params),
    enabled: !!(params.agronomyExpertId || params.supervisorId),
    ...queryConfig,
  });
};
