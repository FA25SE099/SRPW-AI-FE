import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { RiceVarietySeasonAssociation } from '@/types/api';

type GetRiceVarietySeasonsParams = {
  riceVarietyId?: string;
  seasonId?: string;
  isRecommended?: boolean;
};

export const getRiceVarietySeasons = async (params: GetRiceVarietySeasonsParams = {}): Promise<RiceVarietySeasonAssociation[]> => {
  const searchParams = new URLSearchParams();
  if (params.riceVarietyId) searchParams.append('riceVarietyId', params.riceVarietyId);
  if (params.seasonId) searchParams.append('seasonId', params.seasonId);
  if (params.isRecommended !== undefined) searchParams.append('isRecommended', params.isRecommended.toString());
  
  const queryString = searchParams.toString();
  const url = queryString ? `/ricevarietyseason?${queryString}` : '/ricevarietyseason';
  
  return api.get(url);
};

export const getRiceVarietySeasonsQueryOptions = (params: GetRiceVarietySeasonsParams = {}) => {
  return queryOptions({
    queryKey: ['rice-variety-seasons', params],
    queryFn: () => getRiceVarietySeasons(params),
  });
};

type UseRiceVarietySeasonsOptions = {
  params?: GetRiceVarietySeasonsParams;
  queryConfig?: QueryConfig<typeof getRiceVarietySeasons>;
};

export const useRiceVarietySeasons = ({ params = {}, queryConfig }: UseRiceVarietySeasonsOptions = {}) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['rice-variety-seasons', params],
    queryFn: () => getRiceVarietySeasons(params),
  });
};
