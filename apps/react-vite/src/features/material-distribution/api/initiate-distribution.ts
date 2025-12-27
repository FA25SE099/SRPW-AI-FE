import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { InitiateDistributionRequest } from '../types';

export const initiateDistribution = (
  data: InitiateDistributionRequest
): Promise<void> => {
  return api.post('/material-distribution/initiate', data);
};

type UseInitiateDistributionOptions = {
  mutationConfig?: MutationConfig<typeof initiateDistribution>;
};

export const useInitiateDistribution = ({
  mutationConfig,
}: UseInitiateDistributionOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: initiateDistribution,
    onSuccess: (...args) => {
      // Invalidate material distribution and production plan queries
      queryClient.invalidateQueries({
        queryKey: ['material-distributions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['production-plans'],
      });

      // Call any custom onSuccess callback
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};

