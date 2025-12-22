import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type FarmLogMaterialRecord = {
  materialName: string;
  actualQuantityUsed: number;
  actualCost: number;
  notes?: string;
};

export type FarmLogDetailResponse = {
  farmLogId: string;
  cultivationTaskName: string;
  soThua: number;
  soTo: number;
  loggedDate: string;
  workDescription?: string;
  completionPercentage: number;
  actualAreaCovered?: number;
  serviceCost?: number;
  serviceNotes?: string;
  photoUrls?: string[];
  weatherConditions?: string;
  interruptionReason?: string;
  materialsUsed: FarmLogMaterialRecord[];
};

export type GetFarmLogsByProductionPlanTaskParams = {
  productionPlanTaskId: string;
  currentPage?: number;
  pageSize?: number;
};

export type FarmLogsResponse = {
  succeeded: boolean;
  data: FarmLogDetailResponse[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  message: string;
};

export const getFarmLogsByProductionPlanTask = async (
  params: GetFarmLogsByProductionPlanTaskParams
): Promise<FarmLogsResponse> => {
  return api.post('/Farmlog/farm-logs/by-production-plan-task', {
    productionPlanTaskId: params.productionPlanTaskId,
    currentPage: params.currentPage || 1,
    pageSize: params.pageSize || 20,
  });
};

type UseFarmLogsByProductionPlanTaskOptions = {
  params: GetFarmLogsByProductionPlanTaskParams;
  queryConfig?: QueryConfig<typeof getFarmLogsByProductionPlanTask>;
};

export const useFarmLogsByProductionPlanTask = ({
  params,
  queryConfig,
}: UseFarmLogsByProductionPlanTaskOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['farm-logs-by-production-plan-task', params],
    queryFn: () => getFarmLogsByProductionPlanTask(params),
    enabled: !!params.productionPlanTaskId && (queryConfig?.enabled !== false),
  });
};
