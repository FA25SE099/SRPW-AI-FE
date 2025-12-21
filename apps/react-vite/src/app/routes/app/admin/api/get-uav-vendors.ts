import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type UavVendor = {
  uavVendorId: string;
  uavVendorFullName: string | null;
  vendorName: string;
  uavVendorPhoneNumber: string;
  email: string;
};

export type GetUavVendorsParams = {
  currentPage?: number;
  pageSize?: number;
  nameEmailSearch?: string;
  groupClusterSearch?: string;
  phoneNumber?: string;
};

export type UavVendorsResponse = {
  succeeded: boolean;
  data: UavVendor[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  message: string;
  errors: string[];
};

export const getUavVendors = async (
  params: GetUavVendorsParams
): Promise<UavVendorsResponse> => {
  return api.post('/UavVendor/get-all', {
    currentPage: params.currentPage || 1,
    pageSize: params.pageSize || 10,
    nameEmailSearch: params.nameEmailSearch || '',
    groupClusterSearch: params.groupClusterSearch || '',
    phoneNumber: params.phoneNumber || '',
  });
};

type UseUavVendorsOptions = {
  params: GetUavVendorsParams;
  queryConfig?: QueryConfig<typeof getUavVendors>;
};

export const useUavVendors = ({ params, queryConfig }: UseUavVendorsOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: [
      'uav-vendors',
      params.currentPage,
      params.pageSize,
      params.nameEmailSearch,
      params.groupClusterSearch,
      params.phoneNumber,
    ],
    queryFn: () => getUavVendors(params),
  });
};
