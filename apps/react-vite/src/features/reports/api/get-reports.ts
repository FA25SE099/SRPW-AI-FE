import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { ReportsResponse } from '../types';

export const getReports = (params: {
    currentPage: number;
    pageSize: number;
    searchTerm?: string;
    status?: string;
    severity?: string;
    reportType?: string;
}): Promise<ReportsResponse> => {
    // The interceptor already returns the full response object for paginated results
    return api.get('/reports', { params });
};

type UseReportsOptions = {
    params: {
        currentPage: number;
        pageSize: number;
        searchTerm?: string;
        status?: string;
        severity?: string;
        reportType?: string;
    };
    queryConfig?: QueryConfig<typeof getReports>;
};

export const useReports = ({ params, queryConfig }: UseReportsOptions) => {
    return useQuery({
        ...queryConfig,
        queryKey: ['reports', params],
        queryFn: () => getReports(params),
    });
};

