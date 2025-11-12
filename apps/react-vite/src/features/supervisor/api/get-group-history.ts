/**
 * @deprecated This API is deprecated. Use `get-group-by-season.ts` and `get-available-seasons.ts` instead.
 * The new API provides unified access to current and historical groups with better performance.
 * See API_USAGE_GUIDE.md for migration instructions.
 */

import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { GroupHistorySummary } from '@/types/group';

export interface GetGroupHistoryParams {
  year?: number;
  includeCurrentSeason?: boolean;
}

export const getGroupHistory = (
  params?: GetGroupHistoryParams
): Promise<GroupHistorySummary[]> => {
  const searchParams = new URLSearchParams();
  if (params?.year) {
    searchParams.append('year', params.year.toString());
  }
  if (params?.includeCurrentSeason !== undefined) {
    searchParams.append('includeCurrentSeason', params.includeCurrentSeason.toString());
  }

  const queryString = searchParams.toString();
  const url = queryString
    ? `/Supervisor/group-history?${queryString}`
    : '/Supervisor/group-history';

  return api.get(url);
};

export const getGroupHistoryQueryOptions = (params?: GetGroupHistoryParams) => {
  return queryOptions({
    queryKey: ['supervisor-group-history', params],
    queryFn: () => getGroupHistory(params),
  });
};

type UseGroupHistoryOptions = {
  params?: GetGroupHistoryParams;
  queryConfig?: QueryConfig<typeof getGroupHistoryQueryOptions>;
};

export const useGroupHistory = ({ params, queryConfig }: UseGroupHistoryOptions = {}) => {
  return useQuery({
    ...getGroupHistoryQueryOptions(params),
    ...queryConfig,
  });
};

