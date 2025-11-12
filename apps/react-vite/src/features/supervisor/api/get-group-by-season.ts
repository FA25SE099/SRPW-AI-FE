import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { GroupBySeason } from '@/types/group';

export interface GetGroupBySeasonParams {
  seasonId?: string;
  year?: number;
}

export const getGroupBySeason = (
  params?: GetGroupBySeasonParams
): Promise<GroupBySeason> => {
  const searchParams = new URLSearchParams();
  
  if (params?.seasonId) {
    searchParams.append('seasonId', params.seasonId);
  }
  if (params?.year) {
    searchParams.append('year', params.year.toString());
  }
  
  const queryString = searchParams.toString();
  const url = queryString 
    ? `/supervisor/group-by-season?${queryString}`
    : '/supervisor/group-by-season';
  
  return api.get(url);
};

export const getGroupBySeasonQueryOptions = (params?: GetGroupBySeasonParams) => {
  return queryOptions({
    queryKey: ['supervisor-group-by-season', params],
    queryFn: () => getGroupBySeason(params),
  });
};

type UseGroupBySeasonOptions = {
  params?: GetGroupBySeasonParams;
  queryConfig?: QueryConfig<typeof getGroupBySeasonQueryOptions>;
};

export const useGroupBySeason = ({ 
  params, 
  queryConfig 
}: UseGroupBySeasonOptions = {}) => {
  return useQuery({
    ...getGroupBySeasonQueryOptions(params),
    ...queryConfig,
  });
};

