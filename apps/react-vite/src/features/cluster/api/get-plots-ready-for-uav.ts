import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export interface UavPlotReadinessResponse {
  plotId: string;
  plotName: string;
  plotCultivationId: string | null;
  cultivationTaskId: string | null; // Individual CultivationTask ID (unique per task)
  plotArea: number;
  readyDate: string | null;
  taskType: string | null;
  estimatedMaterialCost: number;
  cultivationTaskName: string;
  isReady: boolean;
  readyStatus: string;
  hasActiveUavOrder: boolean;
}

export interface GetPlotsReadyForUavParams {
  groupId: string;
  requiredTaskType?: string;
  daysBeforeScheduled?: number; // Default: 7 days
}

export const getPlotsReadyForUav = (
  params: GetPlotsReadyForUavParams
): Promise<UavPlotReadinessResponse[]> => {
  const searchParams = new URLSearchParams();
  
  searchParams.append('GroupId', params.groupId);
  
  if (params.requiredTaskType) {
    searchParams.append('RequiredTaskType', params.requiredTaskType);
  }
  
  if (params.daysBeforeScheduled !== undefined) {
    searchParams.append('DaysBeforeScheduled', params.daysBeforeScheduled.toString());
  }
  
  const url = `/uav/orders/uav/ready-plots?${searchParams.toString()}`;
  
  return api.get(url);
};

export const getPlotsReadyForUavQueryOptions = (params: GetPlotsReadyForUavParams) => {
  return queryOptions({
    queryKey: ['uav-ready-plots', params],
    queryFn: () => getPlotsReadyForUav(params),
    enabled: !!params.groupId,
  });
};

type UsePlotsReadyForUavOptions = {
  params: GetPlotsReadyForUavParams;
  queryConfig?: QueryConfig<typeof getPlotsReadyForUav>;
};

export const usePlotsReadyForUav = ({ 
  params, 
  queryConfig 
}: UsePlotsReadyForUavOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['uav-ready-plots', params],
    queryFn: () => getPlotsReadyForUav(params),
    enabled: !!params.groupId && (queryConfig?.enabled ?? true),
  });
};

