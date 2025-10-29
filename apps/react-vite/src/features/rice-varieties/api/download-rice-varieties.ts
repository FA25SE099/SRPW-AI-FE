import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { DownloadRiceVarietiesRequest } from '@/types/api';
import { useNotifications } from '@/components/ui/notifications';

export const downloadRiceVarieties = async (
  params: DownloadRiceVarietiesRequest,
): Promise<Blob> => {
  const response = await api.post('/ricevariety/download-excel', params, {
    headers: {
      'Content-Type': 'application/json',
    },
    responseType: 'blob',
  });
  return response as unknown as Blob;
};

type UseDownloadRiceVarietiesOptions = {
  mutationConfig?: MutationConfig<typeof downloadRiceVarieties>;
};

export const useDownloadRiceVarieties = ({
  mutationConfig,
}: UseDownloadRiceVarietiesOptions = {}) => {
  const { addNotification } = useNotifications();

  return useMutation({
    onSuccess: (blob, params) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const formattedDate = new Date(params.inputDate)
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '');
      a.download = `Danh_sach_giong_lua_${formattedDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addNotification({
        type: 'success',
        title: 'Download successful',
        message: 'Rice varieties list downloaded successfully',
      });
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Download failed',
        message: 'Failed to download rice varieties list',
      });
    },
    ...mutationConfig,
    mutationFn: downloadRiceVarieties,
  });
};

