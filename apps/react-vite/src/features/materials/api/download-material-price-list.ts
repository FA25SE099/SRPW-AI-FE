import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { useNotifications } from '@/components/ui/notifications';

export const downloadMaterialPriceList = async (date: string): Promise<Blob> => {
  const response = await api.post('/material/download-excel', JSON.stringify(date), {
    headers: {
      'Content-Type': 'application/json',
    },
    responseType: 'blob',
  });
  return response as unknown as Blob;
};

type UseDownloadMaterialPriceListOptions = {
  mutationConfig?: MutationConfig<typeof downloadMaterialPriceList>;
};

export const useDownloadMaterialPriceList = ({
  mutationConfig,
}: UseDownloadMaterialPriceListOptions = {}) => {
  const { addNotification } = useNotifications();

  return useMutation({
    onSuccess: (blob, date) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const formattedDate = new Date(date).toISOString().split('T')[0];
      a.download = `Bảng_giá_sản_phẩm_ngày_${formattedDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addNotification({
        type: 'success',
        title: 'Download successful',
        message: 'Material price list downloaded successfully',
      });
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Download failed',
        message: 'Failed to download material price list',
      });
    },
    ...mutationConfig,
    mutationFn: downloadMaterialPriceList,
  });
};

