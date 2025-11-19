import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { CultivationTask, CultivationTaskStatus } from '../types';

export const getCultivationTasks = async (params: {
  planId: string;
  status?: CultivationTaskStatus;
  plotId?: string;
}): Promise<CultivationTask[]> => {
  const response = await api.get(`/production-plans/${params.planId}/cultivation-tasks`, {
    params: {
      status: params.status,
      plotId: params.plotId,
    },
  });
  // Ensure we always return an array, never undefined or null
  const data = response.data;
  return Array.isArray(data) ? data : [];
};

type UseCultivationTasksOptions = {
  params: {
    planId: string;
    status?: CultivationTaskStatus;
    plotId?: string;
  };
  queryConfig?: QueryConfig<typeof getCultivationTasks>;
};

export const useCultivationTasks = ({
  params,
  queryConfig,
}: UseCultivationTasksOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['cultivation-tasks', params],
    queryFn: () => getCultivationTasks(params),
  });
};

