import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { PlotImplementation } from '../types';

export const getPlotImplementation = async (params: {
  plotId: string;
  productionPlanId: string;
}): Promise<PlotImplementation> => {
  const response = await api.get('/production-plans/plot-implementation', {
    params: {
      plotId: params.plotId,
      productionPlanId: params.productionPlanId,
    },
  });
  return response.data;
};

type UsePlotImplementationOptions = {
  params: {
    plotId: string;
    productionPlanId: string;
  };
  queryConfig?: QueryConfig<typeof getPlotImplementation>;
};

export const usePlotImplementation = ({
  params,
  queryConfig,
}: UsePlotImplementationOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['plot-implementation', params],
    queryFn: () => getPlotImplementation(params),
  });
};

