import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { ResolveReportRequest } from '../types';

export const resolveReport = (data: ResolveReportRequest): Promise<{ succeeded: boolean; data: string; message?: string }> => {
    // The interceptor handles the response wrapper
    return api.post(`/reports/${data.reportId}/resolve`, data);
};

type UseResolveReportOptions = {
    mutationConfig?: MutationConfig<typeof resolveReport>;
};

export const useResolveReport = ({ mutationConfig }: UseResolveReportOptions = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        ...mutationConfig,
        mutationFn: resolveReport,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['cultivation-plan'] });
            mutationConfig?.onSuccess?.(...args);
        },
    });
};

