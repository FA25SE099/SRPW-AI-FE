import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Material } from '@/types/api';
import { useNotifications } from '@/components/ui/notifications';

type ImportMaterialsParams = {
  excelFile: File;
  importDate: string;
};

export const importCreateMaterials = async (
  params: ImportMaterialsParams,
): Promise<Material[]> => {
  const formData = new FormData();
  formData.append('excelFile', params.excelFile);
  formData.append('importDate', params.importDate);

  return api.post('/material/import-create-excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

type UseImportCreateMaterialsOptions = {
  mutationConfig?: MutationConfig<typeof importCreateMaterials>;
};

export const useImportCreateMaterials = ({
  mutationConfig,
}: UseImportCreateMaterialsOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, onError, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: importCreateMaterials,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      addNotification({
        type: 'success',
        title: 'Import successful',
        message: `Successfully imported ${data.length} materials`,
      });
      
      // Then call any custom onSuccess callback
      onSuccess?.(data, ...args);
    },
    onError: (error, ...args) => {
      // addNotification({
      //   type: 'error',
      //   title: 'Import failed',
      //   message: 'Failed to import materials',
      // });
      
      // Then call any custom onError callback
      onError?.(error, ...args);
    },
    ...restConfig,
  });
};

