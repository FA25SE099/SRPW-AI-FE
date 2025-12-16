import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { PagedResult } from '@/types/api';
import {
  PlotWithLateCountDTO,
  GetLatePlotsInClusterParams,
} from '../types';

export const getLatePlots = (
  params: GetLatePlotsInClusterParams
): Promise<PagedResult<PlotWithLateCountDTO[]>> => {
  return api.get('/LateFarmerRecord/plots', {
    params: {
      agronomyExpertId: params.agronomyExpertId,
      supervisorId: params.supervisorId,
      pageNumber: params.pageNumber || 1,
      pageSize: params.pageSize || 10,
      searchTerm: params.searchTerm,
    },
  });
};

export const getLatePlotsQueryOptions = (
  params: GetLatePlotsInClusterParams
) => {
  return queryOptions({
    queryKey: ['late-plots', params],
    queryFn: () => getLatePlots(params),
  });
};

type UseLatePlotsOptions = {
  params: GetLatePlotsInClusterParams;
  queryConfig?: QueryConfig<typeof getLatePlots>;
};


export const useLatePlots = ({
  params,
  queryConfig,
}: UseLatePlotsOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['late-plots', params],
    queryFn: () => getLatePlots(params),
    enabled: !!(params.agronomyExpertId || params.supervisorId) && (queryConfig?.enabled !== false),
  });
};
