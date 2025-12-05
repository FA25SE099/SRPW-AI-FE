import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { ProductionPlan } from '../types';

export type CreateProductionPlanDTO = {
  groupId: string;
  standardPlanId: string;
  planName?: string;
  basePlantingDate: string;
  totalArea: number;
  stages: Array<{
    stageName: string;
    sequenceOrder: number;
    description?: string;
    typicalDurationDays: number;
    colorCode?: string;
    tasks: Array<{
      taskName: string;
      description?: string;
      taskType: string;
      scheduledDate: string;
      scheduledEndDate?: string;
      priority?: string;
      sequenceOrder: number;
      materials: Array<{
        materialId: string;
        quantityPerHa: number;
      }>;
    }>;
  }>;
};

export const createProductionPlan = (data: CreateProductionPlanDTO): Promise<{
  succeeded: boolean;
  data: string;
  message: string;
  errors: string[];
}> => {
  return api.post('/production-plans', data);
};

type UseCreateProductionPlanOptions = {
  mutationConfig?: MutationConfig<typeof createProductionPlan>;
};

export const useCreateProductionPlan = ({
  mutationConfig,
}: UseCreateProductionPlanOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['production-plans'] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createProductionPlan,
  });
};

