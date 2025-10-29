import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { UpdateRiceVarietyRequest } from '@/types/api';

export const updateRiceVariety = async (data: UpdateRiceVarietyRequest): Promise<string> => {
  return api.put(`/ricevariety/${data.riceVarietyId}`, data);
};

type UseUpdateRiceVarietyOptions = {
  mutationConfig?: MutationConfig<typeof updateRiceVariety>;
};

export const useUpdateRiceVariety = ({ mutationConfig }: UseUpdateRiceVarietyOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: updateRiceVariety,
    onSuccess: (...args) => {
      // Invalidate rice varieties queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['rice-varieties'] });
      
      // Then call any custom onSuccess callback
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
