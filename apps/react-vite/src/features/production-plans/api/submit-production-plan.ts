import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { SubmitPlanInput } from '../types';

export const submitProductionPlan = async (
  data: SubmitPlanInput
): Promise<{ productionPlanId: string }> => {
  const response = await api.post(`/production-plans/${data.planId}/submit`, {
    supervisorId: data.supervisorId,
  });
  return response.data;
};

type UseSubmitProductionPlanOptions = {
  mutationConfig?: MutationConfig<typeof submitProductionPlan>;
};

export const useSubmitProductionPlan = ({
  mutationConfig,
}: UseSubmitProductionPlanOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['production-plans'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['production-plan', args[1].planId] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: submitProductionPlan,
  });
};

