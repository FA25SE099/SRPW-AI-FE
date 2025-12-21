import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type ReportItemResponse = {
  id: string;
  plotId?: string;
  plotName?: string;
  plotArea?: number;
  cultivationPlanId?: string;
  cultivationPlanName?: string;
  reportType: string;
  severity: string;
  title: string;
  description: string;
  reportedBy: string;
  reportedByRole?: string;
  reportedAt: string;
  status: string;
  images?: string[];
  coordinates?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  farmerName?: string;
  clusterName?: string;
};

export type GetSupervisorReportsParams = {
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: string;
  severity?: string;
  reportType?: string;
};

export type SupervisorReportsResponse = {
  succeeded: boolean;
  data: ReportItemResponse[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  message: string;
};

export const getSupervisorReports = async (
  params: GetSupervisorReportsParams = {}
): Promise<SupervisorReportsResponse> => {
  return api.post('/supervisor/reports', {
    currentPage: params.currentPage || 1,
    pageSize: params.pageSize || 20,
    searchTerm: params.searchTerm,
    status: params.status,
    severity: params.severity,
    reportType: params.reportType,
  });
};

type UseSupervisorReportsOptions = {
  params?: GetSupervisorReportsParams;
  queryConfig?: QueryConfig<typeof getSupervisorReports>;
};

export const useSupervisorReports = ({
  params = {},
  queryConfig,
}: UseSupervisorReportsOptions = {}) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['supervisor-reports', params],
    queryFn: () => getSupervisorReports(params),
  });
};
