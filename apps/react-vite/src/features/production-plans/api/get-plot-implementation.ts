import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type PlotImplementation = {
  plotId: string;
  plotName: string;
  soThua: string;
  soTo: string;
  plotArea: number;
  farmerId: string;
  farmerName: string;
  productionPlanId: string;
  productionPlanName: string;
  seasonName: string;
  riceVarietyName: string;
  plantingDate: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  completionPercentage: number;
  tasks: Array<{
    taskId: string;
    taskName: string;
    description: string;
    taskType: string;
    status: string;
    executionOrder: number;
    scheduledEndDate: string;
    actualStartDate?: string;
    actualEndDate?: string;
    actualMaterialCost: number;
    materials: Array<{
      materialId: string;
      materialName: string;
      plannedQuantity: number;
      actualQuantity: number;
      actualCost: number;
      unit: string;
    }>;
  }>;
};

type GetPlotImplementationParams = {
  plotId: string;
  productionPlanId: string;
};

export const getPlotImplementation = async (
  params: GetPlotImplementationParams
): Promise<PlotImplementation> => {
  const queryParams = new URLSearchParams({
    plotId: params.plotId,
    productionPlanId: params.productionPlanId,
  });

  return api.get(`/production-plans/plot-implementation?${queryParams.toString()}`);
};

type UsePlotImplementationOptions = {
  params: GetPlotImplementationParams;
  queryConfig?: QueryConfig<typeof getPlotImplementation>;
};

export const usePlotImplementation = ({
  params,
  queryConfig,
}: UsePlotImplementationOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['production-plan', 'plot-implementation', params],
    queryFn: () => getPlotImplementation(params),
    enabled: !!params.plotId && !!params.productionPlanId && (queryConfig?.enabled !== false),
  });
};
