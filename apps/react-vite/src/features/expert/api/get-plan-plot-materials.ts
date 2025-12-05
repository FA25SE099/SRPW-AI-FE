import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type PlotMaterial = {
  materialId: string;
  materialName: string;
  materialUnit: string;
  imgUrl: string | null;
  quantityPerHa: number;
  totalQuantity: number;
  pricePerUnit: number;
  priceValidFrom: string;
  priceValidTo: string | null;
  isOutdated: boolean;
  totalCost: number;
};

export type PlotWithMaterials = {
  plotId: string;
  plotArea: number;
  soThua: number | null;
  soTo: number | null;
  farmerName: string;
  materials: PlotMaterial[];
  totalEstimatedCost: number;
};

export type PlanPlotMaterialsResponse = {
  planId: string;
  planName: string;
  plots: PlotWithMaterials[];
};

export type PlanPlotMaterialsResult = {
  succeeded: boolean;
  message: string;
  data: PlanPlotMaterialsResponse;
  errors: string[];
};

export const getPlanPlotMaterials = (planId: string): Promise<PlanPlotMaterialsResponse> => {
  return api.get(`/expert/plans/${planId}/plot-materials`).then((result: any) => {
    console.log('Raw API Response:', result);

    // Check if the response has the wrapper structure {succeeded, message, data, errors}
    if (result && typeof result === 'object' && 'data' in result && 'succeeded' in result) {
      console.log('Unwrapping nested data:', result.data);
      return result.data;
    }

    // If result already has plots property, it's already unwrapped
    if (result && typeof result === 'object' && 'plots' in result) {
      console.log('Data already unwrapped:', result);
      return result;
    }

    console.error('Unexpected API response structure:', result);
    // Return a default structure to prevent undefined
    return {
      planId: planId,
      planName: '',
      plots: []
    };
  });
};

export const getPlanPlotMaterialsQueryOptions = (planId: string) => {
  return queryOptions({
    queryKey: ['plan-plot-materials', planId],
    queryFn: () => getPlanPlotMaterials(planId),
    enabled: !!planId,
  });
};

type UsePlanPlotMaterialsOptions = {
  planId: string;
  queryConfig?: QueryConfig<typeof getPlanPlotMaterials>;
};

export const usePlanPlotMaterials = ({ planId, queryConfig }: UsePlanPlotMaterialsOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['plan-plot-materials', planId],
    queryFn: () => getPlanPlotMaterials(planId),
    enabled: !!planId && (queryConfig?.enabled !== false),
  });
};

