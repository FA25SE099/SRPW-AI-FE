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
  plotName: string;
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

export type GetFarmLogsByCultivationParams = {
  plotCultivationId: string;
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

export const getFarmLogsByCultivation = async (
  params: GetFarmLogsByCultivationParams
): Promise<FarmLogsResponse> => {
  return api.post('/farmlog/farm-logs/by-cultivation', {
    plotCultivationId: params.plotCultivationId,
    currentPage: params.currentPage || 1,
    pageSize: params.pageSize || 10,
  });
};

type UseFarmLogsByCultivationOptions = {
  params: GetFarmLogsByCultivationParams;
  queryConfig?: QueryConfig<typeof getFarmLogsByCultivation>;
};

export const useFarmLogsByCultivation = ({
  params,
  queryConfig,
}: UseFarmLogsByCultivationOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['farm-logs-by-cultivation', params],
    queryFn: () => getFarmLogsByCultivation(params),
    enabled: !!params.plotCultivationId && (queryConfig?.enabled !== false),
  });
};
