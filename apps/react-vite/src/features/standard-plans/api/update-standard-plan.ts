import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { UpdateStandardPlanRequest } from '@/types/api';

export const updateStandardPlan = async (data: UpdateStandardPlanRequest): Promise<string> => {
  return api.put(`/standardplan/${data.standardPlanId}`, data);
};

type UseUpdateStandardPlanOptions = {
  mutationConfig?: MutationConfig<typeof updateStandardPlan>;
};

export const useUpdateStandardPlan = ({ mutationConfig }: UseUpdateStandardPlanOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: updateStandardPlan,
    onSuccess: (...args) => {
      // Invalidate standard plans queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['standard-plans'] });
      queryClient.invalidateQueries({ queryKey: ['standard-plan'] });
      
      // Then call any custom onSuccess callback
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};

