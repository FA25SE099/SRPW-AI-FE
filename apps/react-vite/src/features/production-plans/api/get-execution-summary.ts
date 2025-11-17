import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { ExecutionSummary } from '../types';

export const getExecutionSummary = async (planId: string): Promise<ExecutionSummary> => {
  const response = await api.get(`/production-plans/${planId}/execution-summary`);
  return response.data;
};

type UseExecutionSummaryOptions = {
  planId: string;
  queryConfig?: QueryConfig<typeof getExecutionSummary>;
};

export const useExecutionSummary = ({
  planId,
  queryConfig,
}: UseExecutionSummaryOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['execution-summary', planId],
    queryFn: () => getExecutionSummary(planId),
  });
};

