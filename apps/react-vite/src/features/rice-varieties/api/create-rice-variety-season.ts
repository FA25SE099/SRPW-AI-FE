import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { CreateRiceVarietySeasonRequest } from '@/types/api';

export const createRiceVarietySeason = async (data: CreateRiceVarietySeasonRequest): Promise<string> => {
  return api.post('/ricevarietyseason', data);
};

type UseCreateRiceVarietySeasonOptions = {
  mutationConfig?: MutationConfig<typeof createRiceVarietySeason>;
};

export const useCreateRiceVarietySeason = ({ mutationConfig }: UseCreateRiceVarietySeasonOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: createRiceVarietySeason,
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
