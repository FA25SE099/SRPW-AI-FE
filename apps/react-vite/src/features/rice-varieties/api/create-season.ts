import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { CreateSeasonRequest } from '@/types/api';

export const createSeason = async (data: CreateSeasonRequest): Promise<string> => {
  return api.post('/season', data);
};

type UseCreateSeasonOptions = {
  mutationConfig?: MutationConfig<typeof createSeason>;
};

export const useCreateSeason = ({ mutationConfig }: UseCreateSeasonOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: createSeason,
    onSuccess: (...args) => {
      // Invalidate seasons queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['seasons'] });
      
      // Then call any custom onSuccess callback
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
