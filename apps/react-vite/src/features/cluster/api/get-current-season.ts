import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { CurrentSeason } from '../types';

export const getCurrentSeason = (): Promise<CurrentSeason> => {
  return api.get('/Season/current');
};

export const getCurrentSeasonQueryOptions = () =>
  queryOptions({
    queryKey: ['current-season'],
    queryFn: () => getCurrentSeason(),
  });

type UseCurrentSeasonOptions = {
  queryConfig?: QueryConfig<typeof getCurrentSeason>;
};

export const useCurrentSeason = ({ queryConfig }: UseCurrentSeasonOptions = {}) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['current-season'],
    queryFn: () => getCurrentSeason(),
  });
};

