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
  return api.get(`/expert/plans/${planId}/plot-materials`).then(result => result.data);
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

