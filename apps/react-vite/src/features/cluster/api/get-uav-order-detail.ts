import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import type { UavOrderPriority, UavOrderStatus } from './get-cluster-manager-orders';

export interface UavOrderMaterial {
  materialId: string;
  materialName: string;
  materialUnit: string;
  quantityPerHa: number;
  totalQuantityRequired: number;
  totalEstimatedCost: number;
}

export interface UavOrderPlotAssignment {
  plotId: string;
  plotName: string;
  servicedArea: number;
  status: UavOrderStatus;
  actualCost: number | null;
  completionDate: string | null;
  reportNotes: string | null;
  plotBoundaryGeoJson: string | null;
  proofUrls: string[];
}

export interface UavOrderDetail {
  orderId: string;
  orderName: string;
  status: UavOrderStatus;
  priority: UavOrderPriority;
  scheduledDate: string; // DateOnly / ISO date string
  scheduledTime: string | null; // TimeOnly / HH:mm:ss or null
  groupId: string;
  groupName: string;
  totalArea: number;
  totalPlots: number;
  estimatedCost: number;
  actualCost: number | null;
  completionPercentage: number;
  completedAt: string | null;
  startedAt: string | null;
  vendorName: string | null;
  creatorName: string | null;
  optimizedRouteJson: string | null;
  materials: UavOrderMaterial[];
  plotAssignments: UavOrderPlotAssignment[];
}

// Some backends may wrap this in a Result-like structure with `isSuccess`
// and `data`. This helper normalizes to always return the detail object.
export const getUavOrderDetail = async (
  orderId: string,
): Promise<UavOrderDetail> => {
  const response = (await api.get(`/uav/orders/${orderId}`)) as unknown;

  if (
    response &&
    typeof (response as any).isSuccess === 'boolean' &&
    (response as any).data
  ) {
    return (response as any).data as UavOrderDetail;
  }

  return response as UavOrderDetail;
};

export const getUavOrderDetailQueryOptions = (orderId: string) => {
  return queryOptions({
    queryKey: ['uav-order-detail', orderId],
    queryFn: () => getUavOrderDetail(orderId),
    enabled: !!orderId,
  });
};

type UseUavOrderDetailOptions = {
  orderId?: string | null;
  queryConfig?: QueryConfig<typeof getUavOrderDetail>;
};

export const useUavOrderDetail = ({
  orderId,
  queryConfig,
}: UseUavOrderDetailOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['uav-order-detail', orderId],
    queryFn: () => getUavOrderDetail(orderId as string),
    enabled: !!orderId && (queryConfig?.enabled ?? true),
  });
};


