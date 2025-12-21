import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type UavOrderStatus = 
  | 'PendingApproval'
  | 'Approved'
  | 'Rejected'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled';

export type UavOrderPriority = 'Low' | 'Normal' | 'High' | 'Critical';

export interface UavServiceOrderResponse {
  orderId: string;
  orderName: string;
  status: UavOrderStatus;
  priority: UavOrderPriority;
  scheduledDate: string; // ISO date string
  scheduledTime: string | null; // TimeSpan format (HH:mm:ss) or null
  groupId: string;
  groupName: string;
  totalArea: number;
  totalPlots: number;
  estimatedCost: number | null;
  actualCost: number | null;
  completionPercentage: number;
  creatorName: string | null;
}

export interface PagedUavOrdersResponse {
  succeeded: boolean;
  data: UavServiceOrderResponse[];
  message: string;
  errors: string[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface GetClusterManagerOrdersParams {
  currentPage?: number;
  pageSize?: number;
}

export const getClusterManagerOrders = (
  params?: GetClusterManagerOrdersParams
): Promise<PagedUavOrdersResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params?.currentPage !== undefined) {
    searchParams.append('CurrentPage', params.currentPage.toString());
  }
  
  if (params?.pageSize !== undefined) {
    searchParams.append('PageSize', params.pageSize.toString());
  }
  
  const queryString = searchParams.toString();
  const url = queryString
    ? `/uav/orders/cluster-managers?${queryString}`
    : '/uav/orders/cluster-managers';
  
  return api.get(url);
};

export const getClusterManagerOrdersQueryOptions = (
  params?: GetClusterManagerOrdersParams
) => {
  return queryOptions({
    queryKey: ['cluster-manager-orders', params],
    queryFn: () => getClusterManagerOrders(params),
  });
};

type UseClusterManagerOrdersOptions = {
  params?: GetClusterManagerOrdersParams;
  queryConfig?: QueryConfig<typeof getClusterManagerOrders>;
};

export const useClusterManagerOrders = ({
  params,
  queryConfig,
}: UseClusterManagerOrdersOptions = {}) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['cluster-manager-orders', params],
    queryFn: () => getClusterManagerOrders(params),
  });
};

