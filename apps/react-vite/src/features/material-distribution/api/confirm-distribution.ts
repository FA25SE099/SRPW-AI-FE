import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { ConfirmDistributionRequest } from '../types';

export const confirmDistribution = (
  data: ConfirmDistributionRequest
): Promise<void> => {
  return api.post('/material-distribution/confirm', data);
};

type UseConfirmDistributionOptions = {
  mutationConfig?: MutationConfig<typeof confirmDistribution>;
};

export const useConfirmDistribution = ({
  mutationConfig,
}: UseConfirmDistributionOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: confirmDistribution,
    onSuccess: (...args) => {
      // Invalidate material distribution queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['material-distributions'],
      });

      // Call any custom onSuccess callback
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};

