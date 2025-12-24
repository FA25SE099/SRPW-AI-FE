import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type FarmerDTO = {
  farmerId: string;
  fullName?: string;
  address?: string;
  phoneNumber?: string;
  isActive: boolean;
  isVerified: boolean;
  lastActivityAt?: string;
  farmCode?: string;
  plotCount: number;
};

export type GetSupervisorFarmersParams = {
  onlyAssigned?: boolean;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
};

export type SupervisorFarmersResponse = {
  succeeded: boolean;
  data: FarmerDTO[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  message: string;
};

export const getSupervisorFarmers = async (
  params: GetSupervisorFarmersParams = {}
): Promise<SupervisorFarmersResponse> => {
  return api.post('/supervisor/farmers', {
    onlyAssigned: params.onlyAssigned || false,
    currentPage: params.currentPage || 1,
    pageSize: params.pageSize || 20,
    searchTerm: params.searchTerm,
  });
};

type UseSupervisorFarmersOptions = {
  params?: GetSupervisorFarmersParams;
  queryConfig?: QueryConfig<typeof getSupervisorFarmers>;
};

export const useSupervisorFarmers = ({
  params = {},
  queryConfig,
}: UseSupervisorFarmersOptions = {}) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['supervisor-farmers', params],
    queryFn: () => getSupervisorFarmers(params),
  });
};
