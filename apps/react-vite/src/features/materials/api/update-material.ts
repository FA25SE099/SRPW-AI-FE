import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { UpdateMaterialRequest } from '@/types/api';

export const updateMaterial = async (data: UpdateMaterialRequest): Promise<string> => {
  return api.put(`/material/${data.materialId}`, data);
};

type UseUpdateMaterialOptions = {
  mutationConfig?: MutationConfig<typeof updateMaterial>;
};

export const useUpdateMaterial = ({ mutationConfig }: UseUpdateMaterialOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: updateMaterial,
    onSuccess: (...args) => {
      // Always invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      
      // Then call any custom onSuccess callback
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
