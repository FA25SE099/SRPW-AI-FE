import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type FarmLogMaterialRecord = {
  materialName: string;
  actualQuantityUsed: number;
  actualCost: number;
  notes?: string;
};

export type FarmLogTaskDetailResponse = {
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

export type GetFarmLogsByCultivationTaskParams = {
  cultivationTaskId: string;
  currentPage?: number;
  pageSize?: number;
};

export type FarmLogsTaskResponse = {
  succeeded: boolean;
  data: FarmLogTaskDetailResponse[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  message: string;
  hasPrevious: boolean;
  hasNext: boolean;
};

export const getFarmLogsByCultivationTask = async (
  params: GetFarmLogsByCultivationTaskParams
): Promise<FarmLogsTaskResponse> => {
  return api.post('/Farmlog/farm-logs/by-cultivation-task', {
    cultivationTaskId: params.cultivationTaskId,
    currentPage: params.currentPage || 1,
    pageSize: params.pageSize || 10,
  });
};

type UseFarmLogsByCultivationTaskOptions = {
  params: GetFarmLogsByCultivationTaskParams;
  queryConfig?: QueryConfig<typeof getFarmLogsByCultivationTask>;
};

export const useFarmLogsByCultivationTask = ({
  params,
  queryConfig,
}: UseFarmLogsByCultivationTaskOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['farm-logs-by-cultivation-task', params],
    queryFn: () => getFarmLogsByCultivationTask(params),
    enabled: !!params.cultivationTaskId && (queryConfig?.enabled !== false),
  });
};