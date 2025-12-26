import { useQuery, queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type ExpertProfile = {
  expertId: string;
  expertName: string;
  email: string;
  clusterId: string | null;
  clusterName: string | null;
  assignedDate: string | null;
};

export const getExpertProfile = (): Promise<ExpertProfile> => {
  return api.get('/AgronomyExpert/me');
};

export const getExpertProfileQueryOptions = () =>
  queryOptions({
    queryKey: ['expert-profile'],
    queryFn: () => getExpertProfile(),
  });

type UseExpertProfileOptions = {
  queryConfig?: QueryConfig<typeof getExpertProfile>;
};

export const useExpertProfile = ({ queryConfig }: UseExpertProfileOptions = {}) => {
  return useQuery({
    ...getExpertProfileQueryOptions(),
    ...queryConfig,
  });
};

