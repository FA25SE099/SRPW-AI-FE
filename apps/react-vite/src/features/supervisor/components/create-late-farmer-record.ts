import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useNotifications } from '@/components/ui/notifications';

export type CreateLateFarmerRecordDTO = {
  cultivationTaskId: string;
  notes: string;
};

export const createLateFarmerRecord = (data: CreateLateFarmerRecordDTO): Promise<{ succeeded: boolean; data: string; message: string; errors: string[] }> => {
  return api.post('/LateFarmerRecord', data);
};

type UseCreateLateFarmerRecordOptions = {
  mutationConfig?: any;
};

export const useCreateLateFarmerRecord = ({ mutationConfig }: UseCreateLateFarmerRecordOptions = {}) => {
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  return useMutation({
    ...mutationConfig,
    mutationFn: createLateFarmerRecord,
    onSuccess: (data) => {
      addNotification({
        type: 'success',
        title: 'Success',
        message: data.message || 'Late farmer record created successfully.',
      });
      // You might want to invalidate queries that show task status or logs
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create late farmer record.',
      });
    },
  });
};