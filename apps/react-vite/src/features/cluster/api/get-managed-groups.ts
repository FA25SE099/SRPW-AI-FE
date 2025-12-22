import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export interface ClusterManagerGroupResponse {
  groupId: string;
  status: string;
  totalArea: number | null;
  groupName: string;
  plantingDate: string | null;
  riceVarietyName: string;
  supervisorName: string;
  totalPlots: number;
  activePlans: number;
}

export interface PagedManagedGroupsResponse {
  succeeded: boolean;
  data: ClusterManagerGroupResponse[];
  message: string;
  errors: string[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface GetManagedGroupsParams {
  currentPage?: number;
  pageSize?: number;
  statusFilter?: string; 
}

export const getManagedGroups = (
  params: GetManagedGroupsParams = {}
): Promise<PagedManagedGroupsResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params.currentPage) {
    searchParams.append('CurrentPage', params.currentPage.toString());
  }
  if (params.pageSize) {
    searchParams.append('PageSize', params.pageSize.toString());
  }
  if (params.statusFilter) {
    searchParams.append('StatusFilter', params.statusFilter);
  }
  
  const queryString = searchParams.toString();
  const url = queryString 
    ? `/Group/my-groups?${queryString}`
    : '/Group/my-groups';
  
  return api.get(url);
};

export const getManagedGroupsQueryOptions = (params?: GetManagedGroupsParams) => {
  return queryOptions({
    queryKey: ['cluster-manager-groups', params],
    queryFn: () => getManagedGroups(params),
  });
};

type UseManagedGroupsOptions = {
  params?: GetManagedGroupsParams;
  queryConfig?: QueryConfig<typeof getManagedGroups>;
};

export const useManagedGroups = ({ 
  params, 
  queryConfig 
}: UseManagedGroupsOptions = {}) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['cluster-manager-groups', params],
    queryFn: () => getManagedGroups(params),
  });
};

