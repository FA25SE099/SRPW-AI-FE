import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type Farmer = {
  farmerId: string;
  fullName?: string;
  email?: string;
  address?: string;
  phoneNumber?: string;
  farmCode?: string;
  isActive: boolean;
  isVerified: boolean;
  farmerStatus: string;
  lastActivityAt?: string;
  clusterId?: string;
  clusterName?: string;
  plotCount: number;
};

export type GetFarmersParams = {
  currentPage?: number;
  pageSize?: number;
  search?: string;
  phoneNumber?: string;
  clusterId?: string;
  farmerStatus?: 'Normal' | 'Warned' | 'NotAllowed' | 'Resigned' | null;
};

export type FarmersResponse = {
  succeeded: boolean;
  data: Farmer[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  message: string;
  errors: string[];
};

export const getFarmers = async (
  params: GetFarmersParams
): Promise<FarmersResponse> => {
  // Build request body - only include non-empty values
  const requestBody: any = {
    currentPage: params.currentPage || 1,
    pageSize: params.pageSize || 20, // Default to 20 as per API docs
  };

  // Only add filters if they have values (per API docs, no filters = all farmers)
  if (params.search) {
    requestBody.search = params.search;
  }
  if (params.phoneNumber) {
    requestBody.phoneNumber = params.phoneNumber;
  }
  if (params.clusterId) {
    requestBody.clusterId = params.clusterId;
  }
  if (params.farmerStatus) {
    requestBody.farmerStatus = params.farmerStatus;
  }

  return api.post('/farmer/get-all', requestBody);
};

type UseFarmersOptions = {
  params: GetFarmersParams;
  queryConfig?: QueryConfig<typeof getFarmers>;
};

export const useFarmers = ({ params, queryConfig }: UseFarmersOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: [
      'farmers-admin',
      params.currentPage,
      params.pageSize,
      params.search,
      params.phoneNumber,
      params.clusterId,
      params.farmerStatus,
    ],
    queryFn: () => getFarmers(params),
  });
};
