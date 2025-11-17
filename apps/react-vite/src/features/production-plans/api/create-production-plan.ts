import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { CreateProductionPlanInput } from '../types';

export const createProductionPlan = async (
  data: CreateProductionPlanInput
): Promise<{ productionPlanId: string }> => {
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
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createProductionPlan,
  });
};

