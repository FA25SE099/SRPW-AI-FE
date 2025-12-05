import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { CultivationPlanDetail } from '../types/cultivation-plan';

export interface GetCultivationPlanParams {
  plotId: string;
  groupId: string;
}

export const getCultivationPlanByGroupPlot = async (
  params: GetCultivationPlanParams
): Promise<CultivationPlanDetail> => {
  return api.post('/cultivation-plan/by-group-plot', params);
};

type UseCultivationPlanByGroupPlotOptions = {
  params: GetCultivationPlanParams;
  queryConfig?: QueryConfig<typeof getCultivationPlanByGroupPlot>;
};

export const useCultivationPlanByGroupPlot = ({
  params,
  queryConfig,
}: UseCultivationPlanByGroupPlotOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['cultivation-plan', params.groupId, params.plotId],
    queryFn: () => getCultivationPlanByGroupPlot(params),
    enabled: !!params.plotId && !!params.groupId,
  });
};
