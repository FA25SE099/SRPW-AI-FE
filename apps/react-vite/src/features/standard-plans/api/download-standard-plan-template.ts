import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export const downloadStandardPlanTemplate = async (): Promise<Blob> => {
  return api.get('/standardplan/download-sample-excel', {
    responseType: 'blob',
  });
};

type UseDownloadStandardPlanTemplateOptions = {
  mutationConfig?: MutationConfig<typeof downloadStandardPlanTemplate>;
};

export const useDownloadStandardPlanTemplate = ({
  mutationConfig,
}: UseDownloadStandardPlanTemplateOptions = {}) => {
  return useMutation({
    mutationFn: downloadStandardPlanTemplate,
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Mau_ke_hoach_chuan.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    ...mutationConfig,
  });
};

