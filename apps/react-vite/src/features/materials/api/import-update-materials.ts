import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Material } from '@/types/api';
import { useNotifications } from '@/components/ui/notifications';

type ImportUpdateMaterialsParams = {
  excelFile: File;
  importDate: string;
};

export const importUpdateMaterials = async (
  params: ImportUpdateMaterialsParams,
): Promise<Material[]> => {
  const formData = new FormData();
  formData.append('excelFile', params.excelFile);
  formData.append('importDate', params.importDate);

  return api.post('/material/import-update-excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

type UseImportUpdateMaterialsOptions = {
  mutationConfig?: MutationConfig<typeof importUpdateMaterials>;
};

export const useImportUpdateMaterials = ({
  mutationConfig,
}: UseImportUpdateMaterialsOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, onError, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: importUpdateMaterials,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      addNotification({
        type: 'success',
        title: 'Update successful',
        message: `Successfully updated ${data.length} materials`,
      });
      
      // Then call any custom onSuccess callback
      onSuccess?.(data, ...args);
    },
    onError: (error, ...args) => {
      addNotification({
        type: 'error',
        title: 'Update failed',
        message: 'Failed to update materials',
      });
      
      // Then call any custom onError callback
      onError?.(error, ...args);
    },
    ...restConfig,
  });
};

