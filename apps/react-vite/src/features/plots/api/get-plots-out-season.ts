import { useQuery, queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import type { PlotDTO } from './get-all-plots';

export type GetPlotsOutSeasonParams = {
  currentDate?: string; // Format: YYYY-MM-DD or ISO 8601
  searchTerm?: string;
  clusterManagerId?: string;
};

export type GetPlotsOutSeasonResponse = {
  succeeded: boolean;
  message?: string;
  errors?: string[];
  data: PlotDTO[];
};

export const getPlotsOutSeason = ({
  params,
}: {
  params?: GetPlotsOutSeasonParams;
}): Promise<GetPlotsOutSeasonResponse> => {
  return api.get('/Plot/out-season', { params });
};

export const getPlotsOutSeasonQueryOptions = (params?: GetPlotsOutSeasonParams) => {
  return queryOptions({
    queryKey: ['plots', 'out-season', params],
    queryFn: () => getPlotsOutSeason({ params }),
  });
};

type UsePlotsOutSeasonOptions = {
  params?: GetPlotsOutSeasonParams;
  queryConfig?: QueryConfig<typeof getPlotsOutSeasonQueryOptions>;
};

export const usePlotsOutSeason = ({
  params,
  queryConfig
}: UsePlotsOutSeasonOptions = {}) => {
  return useQuery({
    ...getPlotsOutSeasonQueryOptions(params),
    ...queryConfig,
  });
};