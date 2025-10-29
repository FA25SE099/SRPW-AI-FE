import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { DownloadStandardPlansRequest } from '@/types/api';

export const downloadStandardPlans = async (data: DownloadStandardPlansRequest): Promise<Blob> => {
  return api.post('/standardplan/download-excel', data, {
    responseType: 'blob',
  });
};

type UseDownloadStandardPlansOptions = {
  mutationConfig?: MutationConfig<typeof downloadStandardPlans>;
};

export const useDownloadStandardPlans = ({ 
  mutationConfig 
}: UseDownloadStandardPlansOptions = {}) => {
  return useMutation({
    mutationFn: downloadStandardPlans,
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
      a.download = `Ke_hoach_chuan_${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    ...mutationConfig,
  });
};

