import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export const deleteRiceVarietySeason = async (riceVarietySeasonId: string): Promise<string> => {
  return api.delete(`/ricevarietyseason/${riceVarietySeasonId}`);
};

type UseDeleteRiceVarietySeasonOptions = {
  mutationConfig?: MutationConfig<typeof deleteRiceVarietySeason>;
};

export const useDeleteRiceVarietySeason = ({ mutationConfig }: UseDeleteRiceVarietySeasonOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: deleteRiceVarietySeason,
    onSuccess: (...args) => {
      // Invalidate related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['rice-variety-seasons'] });
      queryClient.invalidateQueries({ queryKey: ['rice-varieties'] });
      
      // Then call any custom onSuccess callback
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
