import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type Season = {
  id: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  seasonType: string;
  isActive: boolean;
  createdAt: string;
};

export type GetSeasonsResponse = {
  succeeded: boolean;
  data: Season[];
  message: string;
  errors: string[];
};

export const getSeasons = (): Promise<GetSeasonsResponse> => {
  return api.get('/Season');
};

export const useSeasons = (config?: QueryConfig<typeof getSeasons>) => {
  return useQuery({
    ...config,
    queryKey: ['seasons'],
    queryFn: getSeasons,
  });
};