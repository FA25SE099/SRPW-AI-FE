import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { BulkConfirmDistributionRequest, BulkConfirmDistributionResponse } from '../types';

export const bulkConfirmDistribution = (
  data: BulkConfirmDistributionRequest
): Promise<BulkConfirmDistributionResponse> => {
  return api.post('/material-distribution/confirm-bulk', data);
};

type UseBulkConfirmDistributionOptions = {
  mutationConfig?: MutationConfig<typeof bulkConfirmDistribution>;
};

export const useBulkConfirmDistribution = ({
  mutationConfig,
}: UseBulkConfirmDistributionOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: bulkConfirmDistribution,
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

