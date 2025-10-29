import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { UpdateSeasonRequest } from '@/types/api';

export const updateSeason = async (data: UpdateSeasonRequest): Promise<string> => {
  return api.put(`/season/${data.seasonId}`, data);
};

type UseUpdateSeasonOptions = {
  mutationConfig?: MutationConfig<typeof updateSeason>;
};

export const useUpdateSeason = ({ mutationConfig }: UseUpdateSeasonOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: updateSeason,
    onSuccess: (...args) => {
      // Invalidate seasons queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['seasons'] });
      
      // Then call any custom onSuccess callback
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
