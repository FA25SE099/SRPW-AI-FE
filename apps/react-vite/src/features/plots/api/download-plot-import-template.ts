import { api } from '@/lib/api-client';

export const downloadPlotImportTemplate = async (): Promise<Blob> => {
  const response = await api.get('/plot/download-import-template', {
    responseType: 'blob',
  });
  
  return response;
};

export const usePlotImportTemplate = () => {
  return {
    download: async () => {
      const blob = await downloadPlotImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');
      link.download = `Plot_Import_Template_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  };
};

