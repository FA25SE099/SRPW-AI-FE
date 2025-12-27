import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export type MaterialCostCalculationRequest = {
  area: number;
  tasks: Array<{
    taskName: string;
    taskDescription?: string;
    materials: Array<{
      materialId: string;
      quantityPerHa: number;
    }>;
  }>;
};

export type MaterialCostItem = {
  materialId: string;
  materialName: string;
  unit: string;
  quantityPerHa: number;
  totalQuantityNeeded: number;
  amountPerMaterial: number;
  packagesNeeded: number;
  actualQuantity: number;
  pricePerMaterial: number;
  totalCost: number;
  costPerHa: number;
  priceValidFrom: string;
};

export type MaterialCostCalculationResponse = {
  area: number;
  totalCostPerHa: number;
  totalCostForArea: number;
  materialCostItems: MaterialCostItem[];
  priceWarnings: string[];
};

export const calculateMaterialsCost = (
  data: MaterialCostCalculationRequest,
): Promise<MaterialCostCalculationResponse> => {
  return api.post('/Material/calculate-materials-cost-by-area', data);
};

export type PlotMaterialCostCalculationRequest = {
  plotId: string;
  materials: Array<{
    materialId: string;
    quantityPerHa: number;
  }>;
};

export const calculateMaterialsCostByPlot = (
  data: PlotMaterialCostCalculationRequest,
): Promise<MaterialCostCalculationResponse> => {
  return api.post('/Material/calculate-materials-cost-by-plot-id', data);
};

type UseCalculateMaterialsCostOptions = {
  mutationConfig?: MutationConfig<typeof calculateMaterialsCost>;
};

export const useCalculateMaterialsCost = ({
  mutationConfig,
}: UseCalculateMaterialsCostOptions = {}) => {
  return useMutation({
    ...mutationConfig,
    mutationFn: calculateMaterialsCost,
  });
};

type UseCalculateMaterialsCostByPlotOptions = {
  mutationConfig?: MutationConfig<typeof calculateMaterialsCostByPlot>;
};

export const useCalculateMaterialsCostByPlot = ({
  mutationConfig,
}: UseCalculateMaterialsCostByPlotOptions = {}) => {
  return useMutation({
    ...mutationConfig,
    mutationFn: calculateMaterialsCostByPlot,
  });
};
