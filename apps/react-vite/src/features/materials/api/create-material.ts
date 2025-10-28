import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { CreateMaterialRequest } from '@/types/api';

export const createMaterial = async (data: CreateMaterialRequest): Promise<string> => {
  return api.post('/material', data);
};

type UseCreateMaterialOptions = {
  mutationConfig?: MutationConfig<typeof createMaterial>;
};

export const useCreateMaterial = ({ mutationConfig }: UseCreateMaterialOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: createMaterial,
    onSuccess: (...args) => {
      // Invalidate materials queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      
      // Then call any custom onSuccess callback
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
