import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type PlotAwaitingPolygonStatus = 'PendingPolygon' | 'Active';
export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';

export type PlotAwaitingPolygonDTO = {
  plotId: string;
  soThua: number | null;
  soTo: number | null;
  area: number;
  status: PlotAwaitingPolygonStatus;
  soilType: string | null;
  farmerId: string;
  farmerName: string | null;
  farmerPhone: string | null;
  farmerAddress: string | null;
  createdAt: string;
  daysAwaitingPolygon: number;
  hasActiveTask: boolean;
  taskId: string | null;
  assignedToSupervisorId: string | null;
  assignedToSupervisorName: string | null;
  taskStatus: TaskStatus | null;
  taskAssignedAt: string | null;
  taskPriority: number | null;
};

export type PaginatedPlotsAwaitingPolygonResponse = {
  succeeded: boolean;
  message: string;
  errors: string[] | null;
  data: PlotAwaitingPolygonDTO[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
};

export type GetPlotsAwaitingPolygonParams = {
  pageNumber?: number;
  pageSize?: number;
  clusterManagerId?: string;
  searchTerm?: string;
  hasActiveTask?: boolean;
  supervisorId?: string;
  taskStatus?: TaskStatus;
  sortBy?: 'DaysWaiting' | 'Priority' | 'FarmerName' | 'Area';
  descending?: boolean;
};

export const getPlotsAwaitingPolygon = async (
  params: GetPlotsAwaitingPolygonParams = {}
): Promise<PaginatedPlotsAwaitingPolygonResponse> => {
  const searchParams = new URLSearchParams();

  if (params.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
  if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
  if (params.clusterManagerId) searchParams.append('clusterManagerId', params.clusterManagerId);
  if (params.searchTerm) searchParams.append('searchTerm', params.searchTerm);
  if (params.hasActiveTask !== undefined) searchParams.append('hasActiveTask', params.hasActiveTask.toString());
  if (params.supervisorId) searchParams.append('supervisorId', params.supervisorId);
  if (params.taskStatus) searchParams.append('taskStatus', params.taskStatus);
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.descending !== undefined) searchParams.append('descending', params.descending.toString());

  const queryString = searchParams.toString();
  const url = queryString ? `/plot/awaiting-polygon?${queryString}` : '/plot/awaiting-polygon';

  return api.get(url);
};

export const getPlotsAwaitingPolygonQueryOptions = (params: GetPlotsAwaitingPolygonParams = {}) => {
  return queryOptions({
    queryKey: ['plots-awaiting-polygon', params],
    queryFn: () => getPlotsAwaitingPolygon(params),
    staleTime: 5000,
  });
};

type UsePlotsAwaitingPolygonOptions = {
  params?: GetPlotsAwaitingPolygonParams;
  queryConfig?: QueryConfig<typeof getPlotsAwaitingPolygonQueryOptions>;
};

export const usePlotsAwaitingPolygon = ({
  params = {},
  queryConfig,
}: UsePlotsAwaitingPolygonOptions = {}) => {
  return useQuery({
    ...getPlotsAwaitingPolygonQueryOptions(params),
    ...queryConfig,
  }) as ReturnType<typeof useQuery<PaginatedPlotsAwaitingPolygonResponse, Error>>;
};

