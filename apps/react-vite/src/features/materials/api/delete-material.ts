import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export const deleteMaterial = async (materialId: string): Promise<string> => {
  return api.delete(`/material/${materialId}`);
};

type UseDeleteMaterialOptions = {
  mutationConfig?: MutationConfig<typeof deleteMaterial>;
};

export const useDeleteMaterial = ({ mutationConfig }: UseDeleteMaterialOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: deleteMaterial,
    onSuccess: (...args) => {
      // Invalidate materials queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      
      // Then call any custom onSuccess callback
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
