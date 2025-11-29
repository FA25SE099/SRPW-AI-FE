import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export type SubmitProductionPlanRequest = {
  planId: string;
  supervisorId: string;
};

export const submitProductionPlan = async (
  data: SubmitProductionPlanRequest
): Promise<string> => {
  return api.post(`/production-plans/${data.planId}/submit`, data);
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
    mutationFn: submitProductionPlan,
    onSuccess: (...args) => {
      // Invalidate queries to refresh
      queryClient.invalidateQueries({ queryKey: ['production-plans'] });
      queryClient.invalidateQueries({ queryKey: ['production-plan'] });

      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
