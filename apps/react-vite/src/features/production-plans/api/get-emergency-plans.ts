import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { PagedResult } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import { EmergencyPlanListItem, GetEmergencyPlansDTO } from '../types';

export const getEmergencyPlans = (
  params: GetEmergencyPlansDTO,
): Promise<PagedResult<EmergencyPlanListItem>> => {
  return api.post('/production-plans/emergency', params);
};

type UseEmergencyPlansOptions = {
  params: GetEmergencyPlansDTO;
  queryConfig?: QueryConfig<typeof getEmergencyPlans>;
};

export const useEmergencyPlans = ({ params, queryConfig }: UseEmergencyPlansOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['emergency-plans', params],
    queryFn: () => getEmergencyPlans(params),
  }) as ReturnType<typeof useQuery<PagedResult<EmergencyPlanListItem>, Error>>;
};