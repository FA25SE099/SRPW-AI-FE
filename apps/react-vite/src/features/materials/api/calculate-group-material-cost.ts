import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export type GroupMaterialCostRequest = {
  groupId: string;
  materials: Array<{
    materialId: string;
    quantity: number;
  }>;
};

export type MaterialCostDetail = {
  materialId: string;
  materialName: string;
  unit: string;
  requiredQuantity: number;
  packagesNeeded: number;
  effectivePricePerPackage: number;
  materialTotalCost: number;
  priceValidFrom: string;
};

export type PlotCostDetail = {
  plotId: string;
  plotName: string;
  plotArea: number;
  areaRatio: number;
  allocatedCost: number;
};

export type GroupMaterialCostResponse = {
  groupId: string;
  totalGroupArea: number;
  totalGroupCost: number;
  materialCostDetails: MaterialCostDetail[];
  plotCostDetails: PlotCostDetail[];
  priceWarnings: string[];
};

export const calculateGroupMaterialCost = async (
  request: GroupMaterialCostRequest
): Promise<GroupMaterialCostResponse> => {
  return api.post('/Material/calculate-group-material-cost', request);
};

export const useCalculateGroupMaterialCost = () => {
  return useMutation({
    mutationFn: calculateGroupMaterialCost,
  });
};
