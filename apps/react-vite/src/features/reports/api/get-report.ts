import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Report } from '../types';

export const getReport = (reportId: string): Promise<Report> => {
    // The interceptor unwraps single results and returns data directly
    return api.get(`/reports/${reportId}`);
};

type UseReportOptions = {
    reportId: string;
    queryConfig?: QueryConfig<typeof getReport>;
};

export const useReport = ({ reportId, queryConfig }: UseReportOptions) => {
    return useQuery({
        ...queryConfig,
        queryKey: ['report', reportId],
        queryFn: () => getReport(reportId),
    });
};

