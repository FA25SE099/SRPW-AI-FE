import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export type CreateStandardPlanStageTask = {
  taskName: string;
  description: string;
  daysAfter: number;
  durationDays: number;
  taskType: string;
  priority: string;
  sequenceOrder: number;
  materials: {
    materialId: string;
    quantityPerHa: number;
  }[];
};

export type CreateStandardPlanStage = {
  stageName: string;
  sequenceOrder: number;
  expectedDurationDays: number;
  isMandatory: boolean;
  notes?: string;
  tasks: CreateStandardPlanStageTask[];
};

export type CreateStandardPlanRequest = {
  categoryId: string;
  planName: string;
  description?: string;
  totalDurationDays: number;
  isActive?: boolean;
  stages: CreateStandardPlanStage[];
};

export const createStandardPlan = async (data: CreateStandardPlanRequest): Promise<string> => {
  return api.post('/StandardPlan', data);
};

type UseCreateStandardPlanOptions = {
  mutationConfig?: MutationConfig<typeof createStandardPlan>;
};

export const useCreateStandardPlan = ({ mutationConfig }: UseCreateStandardPlanOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: createStandardPlan,
    onSuccess: (...args) => {
      // Invalidate standard plans queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['standard-plans'] });
      
      // Then call any custom onSuccess callback
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};

