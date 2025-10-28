import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { useNotifications } from '@/components/ui/notifications';

export const downloadMaterialTemplate = async (): Promise<Blob> => {
  const response = await api.get('/material/download-create-sample-excel', {
    responseType: 'blob',
  });
  return response as unknown as Blob;
};

type UseDownloadMaterialTemplateOptions = {
  mutationConfig?: MutationConfig<typeof downloadMaterialTemplate>;
};

export const useDownloadMaterialTemplate = ({
  mutationConfig,
}: UseDownloadMaterialTemplateOptions = {}) => {
  const { addNotification } = useNotifications();

  return useMutation({
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Material_Sample_Template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addNotification({
        type: 'success',
        title: 'Download successful',
        message: 'Material template downloaded successfully',
      });
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Download failed',
        message: 'Failed to download material template',
      });
    },
    ...mutationConfig,
    mutationFn: downloadMaterialTemplate,
  });
};

