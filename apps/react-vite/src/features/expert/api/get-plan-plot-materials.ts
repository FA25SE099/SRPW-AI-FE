import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type PlotMaterial = {
  MaterialId: string;
  MaterialName: string;
  MaterialUnit: string;
  ImgUrl: string | null;
  QuantityPerHa: number;
  TotalQuantity: number;
  PricePerUnit: number;
  PriceValidFrom: string;
  PriceValidTo: string | null;
  IsOutdated: boolean;
  TotalCost: number;
};

export type PlotWithMaterials = {
  PlotId: string;
  PlotArea: number;
  SoThua: number | null;
  SoTo: number | null;
  FarmerName: string;
  Materials: PlotMaterial[];
  TotalEstimatedCost: number;
};

export type PlanPlotMaterialsResponse = {
  PlanId: string;
  PlanName: string;
  Plots: PlotWithMaterials[];
};

export type PlanPlotMaterialsResult = {
  Succeeded: boolean;
  Message: string;
  Data: PlanPlotMaterialsResponse;
};

export const getPlanPlotMaterials = (planId: string): Promise<PlanPlotMaterialsResult> => {
  return api.get(`/expert/plans/${planId}/plot-materials`);
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

