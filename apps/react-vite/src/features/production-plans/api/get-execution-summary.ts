import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type ExecutionSummary = {
  planId: string;
  planName: string;
  approvedAt: string;
  approvedByExpert: string;
  groupId: string;
  groupName: string;
  seasonName: string;
  totalArea: number;
  plotCount: number;
  farmerCount: number;
  totalTasksCreated: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksPending: number;
  completionPercentage: number;
  estimatedCost: number;
  actualCost: number;
  firstTaskStarted?: string;
  lastTaskCompleted?: string;
  plotSummaries: Array<{
    plotId: string;
    plotName: string;
    farmerName: string;
    plotArea: number;
    taskCount: number;
    completedTasks: number;
    completionRate: number;
  }>;
};

export const getExecutionSummary = async (planId: string): Promise<ExecutionSummary> => {
  return api.get(`/production-plans/${planId}/execution-summary`);
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
    queryKey: ['production-plan', planId, 'execution-summary'],
    queryFn: () => getExecutionSummary(planId),
    enabled: !!planId && (queryConfig?.enabled !== false),
  });
};
