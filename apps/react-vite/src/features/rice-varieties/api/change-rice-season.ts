import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { ChangeRiceSeasonRequest } from '@/types/api';
import { useNotifications } from '@/components/ui/notifications';

export const changeRiceSeason = async (
  data: ChangeRiceSeasonRequest,
): Promise<string> => {
  return api.post('/ricevariety/change-rice-season', data);
};

type UseChangeRiceSeasonOptions = {
  mutationConfig?: MutationConfig<typeof changeRiceSeason>;
};

export const useChangeRiceSeason = ({
  mutationConfig,
}: UseChangeRiceSeasonOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, onError, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: changeRiceSeason,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['rice-varieties'] });
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Successfully matched rice with season',
      });
      
      // Then call any custom onSuccess callback
      onSuccess?.(...args);
    },
    onError: (error: Error, ...args) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to match rice with season',
      });
      
      // Then call any custom onError callback
      onError?.(error, ...args);
    },
    ...restConfig,
  });
};

