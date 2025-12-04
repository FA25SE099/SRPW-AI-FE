import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { UpdateProductionPlanInput } from '../types';

export const updateProductionPlan = async (
  data: UpdateProductionPlanInput
): Promise<{ productionPlanId: string }> => {
  // Don't include planId in the body, it's in the payload at root level
  return api.put(`/production-plans`, data);
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
      queryClient.invalidateQueries({ queryKey: ['production-plan'] });
      queryClient.invalidateQueries({ queryKey: ['plan-detail'] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateProductionPlan,
  });
};

