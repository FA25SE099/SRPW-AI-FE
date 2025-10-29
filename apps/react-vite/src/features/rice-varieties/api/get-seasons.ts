import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Season } from '@/types/api';

type GetSeasonsParams = {
  search?: string;
  isActive?: boolean;
};

export const getSeasons = async (params: GetSeasonsParams = {}): Promise<Season[]> => {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.append('search', params.search);
  if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
  
  const queryString = searchParams.toString();
  const url = queryString ? `/season?${queryString}` : '/season';
  
  return api.get(url);
};

export const getSeasonsQueryOptions = (params: GetSeasonsParams = {}) => {
  return queryOptions({
    queryKey: ['seasons', params],
    queryFn: () => getSeasons(params),
  });
};

type UseSeasonsOptions = {
  params?: GetSeasonsParams;
  queryConfig?: QueryConfig<typeof getSeasonsQueryOptions>;
};

export const useSeasons = ({ params = {}, queryConfig }: UseSeasonsOptions = {}) => {
  return useQuery({
    ...getSeasonsQueryOptions(params),
    ...queryConfig,
  });
};
