import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type EmergencyProtocol = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  totalDuration: number;
  isActive: boolean;
  totalThresholds: number;
  totalTasks: number;
  totalStages: number;
  createdAt: string;
  createdBy: string;
  lastModified: string;
  lastModifiedBy: string;
};

export type GetEmergencyProtocolsParams = {
  currentPage: number;
  pageSize: number;
  categoryId?: string | null;
  searchTerm?: string;
  isActive?: boolean;
};

export type EmergencyProtocolsResponse = {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  succeeded: boolean;
  data: EmergencyProtocol[];
  message: string;
  errors: string[];
};

export const getEmergencyProtocols = (
  params: GetEmergencyProtocolsParams
): Promise<EmergencyProtocolsResponse> => {
  return api.post('/EmergencyProtocol/get-all', params);
};

export const getEmergencyProtocolsQueryOptions = (
  params: GetEmergencyProtocolsParams
) => {
  return queryOptions({
    queryKey: ['emergency-protocols', params],
    queryFn: () => getEmergencyProtocols(params),
  });
};

type UseEmergencyProtocolsOptions = {
  params: GetEmergencyProtocolsParams;
  queryConfig?: QueryConfig<typeof getEmergencyProtocols>;
};

export const useEmergencyProtocols = ({
  params,
  queryConfig,
}: UseEmergencyProtocolsOptions): ReturnType<typeof useQuery<EmergencyProtocolsResponse>> => {
  return useQuery({
    ...getEmergencyProtocolsQueryOptions(params),
    ...queryConfig,
  } as any) as any;
};