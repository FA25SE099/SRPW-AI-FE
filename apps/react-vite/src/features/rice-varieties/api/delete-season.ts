import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export const deleteSeason = async (seasonId: string): Promise<string> => {
  return api.delete(`/season/${seasonId}`);
};

type UseDeleteSeasonOptions = {
  mutationConfig?: MutationConfig<typeof deleteSeason>;
};

export const useDeleteSeason = ({ mutationConfig }: UseDeleteSeasonOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: deleteSeason,
    onSuccess: (...args) => {
      // Invalidate seasons queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['seasons'] });
      
      // Then call any custom onSuccess callback
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
