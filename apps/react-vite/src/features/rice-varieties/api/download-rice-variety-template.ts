import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { useNotifications } from '@/components/ui/notifications';

export const downloadRiceVarietyTemplate = async (): Promise<Blob> => {
  const response = await api.get('/ricevariety/download-sample-excel', {
    responseType: 'blob',
  });
  return response as unknown as Blob;
};

type UseDownloadRiceVarietyTemplateOptions = {
  mutationConfig?: MutationConfig<typeof downloadRiceVarietyTemplate>;
};

export const useDownloadRiceVarietyTemplate = ({
  mutationConfig,
}: UseDownloadRiceVarietyTemplateOptions = {}) => {
  const { addNotification } = useNotifications();

  return useMutation({
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Mau_nhap_lieu_giong_lua.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addNotification({
        type: 'success',
        title: 'Download successful',
        message: 'Rice variety template downloaded successfully',
      });
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Download failed',
        message: 'Failed to download rice variety template',
      });
    },
    ...mutationConfig,
    mutationFn: downloadRiceVarietyTemplate,
  });
};

