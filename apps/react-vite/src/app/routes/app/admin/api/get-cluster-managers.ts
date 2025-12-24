import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type ClusterManager = {
  clusterManagerId: string;
  clusterManagerName: string;
  clusterManagerPhoneNumber: string;
  email: string;
  clusterId: string | null;
  clusterName: string | null;
  assignedDate: string | null;
};

export type GetClusterManagersParams = {
  currentPage?: number;
  pageSize?: number;
  search?: string;
  phoneNumber?: string;
  freeOrAssigned?: boolean | null;
};

export type ClusterManagersResponse = {
  succeeded: boolean;
  data: ClusterManager[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  message: string;
  errors: string[];
};

export const getClusterManagers = async (
  params: GetClusterManagersParams
): Promise<ClusterManagersResponse> => {
  return api.post('/ClusterManager/get-all', {
    currentPage: params.currentPage || 1,
    pageSize: params.pageSize || 10,
    search: params.search || '',
    phoneNumber: params.phoneNumber || '',
    freeOrAssigned: params.freeOrAssigned,
  });
};

type UseClusterManagersOptions = {
  params: GetClusterManagersParams;
  queryConfig?: QueryConfig<typeof getClusterManagers>;
};

export const useClusterManagers = ({
  params,
  queryConfig,
}: UseClusterManagersOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: [
      'cluster-managers',
      params.currentPage,
      params.pageSize,
      params.search,
      params.phoneNumber,
      params.freeOrAssigned,
    ],
    queryFn: () => getClusterManagers(params),
  });
};
