import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useNotifications } from '@/components/ui/notifications';
import { MutationConfig } from '@/lib/react-query';

export type CreateLateFarmerRecordDTO = {
  cultivationTaskId: string;
  notes: string;
};

export const createLateFarmerRecord = (data: CreateLateFarmerRecordDTO): Promise<{ succeeded: boolean; data: string; message: string; errors: string[] }> => {
  return api.post('/LateFarmerRecord', data);
};

type UseCreateLateFarmerRecordOptions = {
  mutationConfig?: MutationConfig<typeof createLateFarmerRecord>;
};

export const useCreateLateFarmerRecord = ({ mutationConfig }: UseCreateLateFarmerRecordOptions = {}) => {
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: createLateFarmerRecord,
    onSuccess: (data, ...args) => {
      addNotification({
        type: 'success',
        title: 'Success',
        message: (data as any).message || 'Late farmer record created successfully.',
      });
      onSuccess?.(data, ...args);
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create late farmer record.',
      });
    },
    ...restConfig,
  });
};