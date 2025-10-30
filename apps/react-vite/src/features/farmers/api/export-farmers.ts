import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { json } from 'stream/consumers';
import { data } from 'react-router';
import { useNotifications } from '@/components/ui/notifications';

export const exportFarmers = (date: string): Promise<Blob> => {
    return api.post('/farmer/export-farmer-basicdata', JSON.stringify(date), {
        headers: {
            'Content-Type': 'application/json',
        },
        responseType: 'blob',
    });
};

type UseExportFarmersOptions = {
    mutationConfig?: MutationConfig<typeof exportFarmers>;
};

export const useExportFarmers = ({ mutationConfig }: UseExportFarmersOptions = {}) => {
    return useMutation({
        mutationFn: exportFarmers,
        ...mutationConfig,
    });
};

