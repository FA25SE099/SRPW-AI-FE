import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

// Request types based on API_CalculateMaterialsCostByPlotId.md
export type TaskWithMaterialsInput = {
  taskName: string;
  taskDescription?: string;
  materials: TaskMaterialInput[];
};

export type TaskMaterialInput = {
  materialId: string;
  quantityPerHa: number;
};

export type PlotMaterialCostWithTasksRequest = {
  plotId: string;
  tasks: TaskWithMaterialsInput[];
};

// Response types based on API_CalculateMaterialsCostByPlotId.md
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

export type TaskCostBreakdown = {
  taskName: string;
  taskDescription?: string;
  materials: MaterialCostItem[];
  totalTaskCost: number;
};

export type PlotMaterialCostWithTasksResponse = {
  area: number;
  totalCostPerHa: number;
  totalCostForArea: number;
  materialCostItems: MaterialCostItem[];
  taskCostBreakdowns: TaskCostBreakdown[];
  priceWarnings: string[];
};

export const calculatePlotMaterialCostWithTasks = (
  data: PlotMaterialCostWithTasksRequest,
): Promise<PlotMaterialCostWithTasksResponse> => {
  return api.post('/Material/calculate-materials-cost-by-plot-id', data);
};

type UseCalculatePlotMaterialCostWithTasksOptions = {
  mutationConfig?: MutationConfig<typeof calculatePlotMaterialCostWithTasks>;
};

export const useCalculatePlotMaterialCostWithTasks = ({
  mutationConfig,
}: UseCalculatePlotMaterialCostWithTasksOptions = {}) => {
  return useMutation({
    ...mutationConfig,
    mutationFn: calculatePlotMaterialCostWithTasks,
  });
};
