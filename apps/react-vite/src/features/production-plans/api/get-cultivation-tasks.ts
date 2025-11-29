import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type CultivationTask = {
  taskId: string;
  taskName: string;
  description: string;
  taskType: string;
  status: string;
  scheduledEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  plotId: string;
  plotName: string;
  farmerId: string;
  farmerName: string;
  actualMaterialCost: number;
  actualServiceCost: number;
  isContingency: boolean;
  contingencyReason?: string;
};

type GetCultivationTasksParams = {
  planId: string;
  status?: string;
  plotId?: string;
};

export const getCultivationTasks = async (
  params: GetCultivationTasksParams
): Promise<CultivationTask[]> => {
  const queryParams = new URLSearchParams();

  if (params.status) queryParams.append('status', params.status);
  if (params.plotId) queryParams.append('plotId', params.plotId);

  const url = `/production-plans/${params.planId}/cultivation-tasks${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  return api.get(url);
};

type UseCultivationTasksOptions = {
  params: GetCultivationTasksParams;
  queryConfig?: QueryConfig<typeof getCultivationTasks>;
};

export const useCultivationTasks = ({
  params,
  queryConfig,
}: UseCultivationTasksOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['production-plan', params.planId, 'cultivation-tasks', params],
    queryFn: () => getCultivationTasks(params),
    enabled: !!params.planId && (queryConfig?.enabled !== false),
  });
};
