import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { FormGroupsFromPreviewRequest, FormGroupsResponse } from '../types';

export const formGroupsFromPreview = (
  request: FormGroupsFromPreviewRequest,
): Promise<FormGroupsResponse> => {
  return api.post('/Group/form-from-preview', request);
};

type UseFormGroupsFromPreviewOptions = {
  mutationConfig?: MutationConfig<typeof formGroupsFromPreview>;
};

export const useFormGroupsFromPreview = ({ 
  mutationConfig 
}: UseFormGroupsFromPreviewOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: formGroupsFromPreview,
    onSuccess: (data, variables) => {
      // Invalidate cluster current season to refresh the dashboard
      queryClient.invalidateQueries({
        queryKey: ['cluster-current-season', variables.clusterId],
      });
      // Invalidate groups list
      queryClient.invalidateQueries({
        queryKey: ['groups'],
      });
    },
    ...mutationConfig,
  });
};

