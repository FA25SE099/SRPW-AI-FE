import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export const deleteRiceVariety = async (riceVarietyId: string): Promise<string> => {
  return api.delete(`/ricevariety/${riceVarietyId}`);
};

type UseDeleteRiceVarietyOptions = {
  mutationConfig?: MutationConfig<typeof deleteRiceVariety>;
};

export const useDeleteRiceVariety = ({ mutationConfig }: UseDeleteRiceVarietyOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: deleteRiceVariety,
    onSuccess: (...args) => {
      // Invalidate rice varieties queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['rice-varieties'] });
      
      // Then call any custom onSuccess callback
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
