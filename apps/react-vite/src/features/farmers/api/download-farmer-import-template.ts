import { api } from '@/lib/api-client';

export const downloadFarmerImportTemplate = async (): Promise<Blob> => {
  return api.get('/farmer/download-import-template', {
    responseType: 'blob',
  });
};

export const useFarmerImportTemplate = () => {
  return {
    download: async () => {
      const blob = await downloadFarmerImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Farmer_Import_Template_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  };
};

