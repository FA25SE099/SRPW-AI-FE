import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { UpdateProductionPlanInput } from '../types';

export const updateProductionPlan = async (
  data: UpdateProductionPlanInput
): Promise<{ productionPlanId: string }> => {
  const { planId, ...updateData } = data;
  return api.put(`/production-plans/${planId}`, updateData);
};

type UseUpdateProductionPlanOptions = {
  mutationConfig?: MutationConfig<typeof updateProductionPlan>;
};

export const useUpdateProductionPlan = ({
  mutationConfig,
}: UseUpdateProductionPlanOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['production-plans'] });
      queryClient.invalidateQueries({ queryKey: ['production-plan', args[1].planId] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateProductionPlan,
  });
};

