import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { CreateRiceVarietyRequest } from '@/types/api';

export const createRiceVariety = async (data: CreateRiceVarietyRequest): Promise<string> => {
  return api.post('/ricevariety/create', data);
};

type UseCreateRiceVarietyOptions = {
  mutationConfig?: MutationConfig<typeof createRiceVariety>;
};

export const useCreateRiceVariety = ({ mutationConfig }: UseCreateRiceVarietyOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: createRiceVariety,
    onSuccess: (...args) => {
      // Invalidate rice varieties queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['rice-varieties'] });
      
      // Then call any custom onSuccess callback
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
