import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { ApprovedPlan } from '../types';

export const getApprovedPlans = async (params?: {
  groupId?: string;
  supervisorId?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<ApprovedPlan[]> => {
  const response = await api.get('/production-plans/approved', { params });
  // Ensure we always return an array, never undefined or null
  const data = response.data;
  return Array.isArray(data) ? data : [];
};

type UseApprovedPlansOptions = {
  params?: {
    groupId?: string;
    supervisorId?: string;
    fromDate?: string;
    toDate?: string;
  };
  queryConfig?: QueryConfig<typeof getApprovedPlans>;
};

export const useApprovedPlans = ({
  params,
  queryConfig,
}: UseApprovedPlansOptions = {}) => {
  return useQuery({
    queryKey: ['approved-plans', params ?? {}],
    queryFn: () => getApprovedPlans(params),
    ...queryConfig,
  });
};

