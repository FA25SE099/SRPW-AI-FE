import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Material } from '@/types/api';
import { useNotifications } from '@/components/ui/notifications';

type ImportUpsertMaterialsParams = {
  excelFile: File;
  importDate: string;
};

type MaterialUpsertResult = {
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: string[];
  materials: Material[];
};

export const importUpsertMaterials = async (
  params: ImportUpsertMaterialsParams,
): Promise<MaterialUpsertResult> => {
  const formData = new FormData();
  formData.append('ExcelFile', params.excelFile);
  formData.append('ImportDate', params.importDate);

  return api.post('/material/import-upsert-excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

type UseImportUpsertMaterialsOptions = {
  mutationConfig?: MutationConfig<typeof importUpsertMaterials>;
};

export const useImportUpsertMaterials = ({
  mutationConfig,
}: UseImportUpsertMaterialsOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, onError, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: importUpsertMaterials,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      addNotification({
        type: 'success',
        title: 'Import successful',
        message: `Successfully processed ${data.createdCount + data.updatedCount} materials: ${data.createdCount} created, ${data.updatedCount} updated`,
      });
      
      // Then call any custom onSuccess callback
      onSuccess?.(data, ...args);
    },
    onError: (error, ...args) => {
    //   addNotification({
    //     type: 'error',
    //     title: 'Import failed',
    //     message: 'Failed to import materials',
    //   });
      
      // Then call any custom onError callback
      onError?.(error, ...args);
    },
    ...restConfig,
  });
};