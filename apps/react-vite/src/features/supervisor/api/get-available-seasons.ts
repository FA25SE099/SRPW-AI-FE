import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { AvailableSeason } from '@/types/group';

export const getAvailableSeasons = (): Promise<AvailableSeason[]> => {
  return api.get('/supervisor/available-seasons');
};

export const getAvailableSeasonsQueryOptions = () => {
  return queryOptions({
    queryKey: ['supervisor-available-seasons'],
    queryFn: () => getAvailableSeasons(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes - seasons rarely change
  });
};

type UseAvailableSeasonsOptions = {
  queryConfig?: QueryConfig<typeof getAvailableSeasonsQueryOptions>;
};

export const useAvailableSeasons = (
  { queryConfig }: UseAvailableSeasonsOptions = {}
) => {
  return useQuery({
    ...getAvailableSeasonsQueryOptions(),
    ...queryConfig,
  });
};

