import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { UpdateRiceVarietySeasonRequest } from '@/types/api';

export const updateRiceVarietySeason = async (data: UpdateRiceVarietySeasonRequest): Promise<string> => {
  return api.put(`/ricevarietyseason/${data.riceVarietySeasonId}`, data);
};

type UseUpdateRiceVarietySeasonOptions = {
  mutationConfig?: MutationConfig<typeof updateRiceVarietySeason>;
};

export const useUpdateRiceVarietySeason = ({ mutationConfig }: UseUpdateRiceVarietySeasonOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: updateRiceVarietySeason,
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
