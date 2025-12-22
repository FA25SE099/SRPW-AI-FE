import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type AgronomyExpert = {
  expertId: string;
  expertName: string;
  expertPhoneNumber: string;
  email: string;
  clusterId: string | null;
  clusterName: string | null;
  assignedDate: string | null;
};

export type GetAgronomyExpertsParams = {
  currentPage?: number;
  pageSize?: number;
  search?: string;
  phoneNumber?: string;
  freeOrAssigned?: boolean | null;
};

export type AgronomyExpertsResponse = {
  succeeded: boolean;
  data: AgronomyExpert[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  message: string;
  errors: string[];
};

export const getAgronomyExperts = async (
  params: GetAgronomyExpertsParams
): Promise<AgronomyExpertsResponse> => {
  return api.post('/AgronomyExpert/get-all', {
    currentPage: params.currentPage || 1,
    pageSize: params.pageSize || 10,
    search: params.search || '',
    phoneNumber: params.phoneNumber || '',
    freeOrAssigned: params.freeOrAssigned,
  });
};

type UseAgronomyExpertsOptions = {
  params: GetAgronomyExpertsParams;
  queryConfig?: QueryConfig<typeof getAgronomyExperts>;
};

export const useAgronomyExperts = ({
  params,
  queryConfig,
}: UseAgronomyExpertsOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: [
      'agronomy-experts',
      params.currentPage,
      params.pageSize,
      params.search,
      params.phoneNumber,
      params.freeOrAssigned,
    ],
    queryFn: () => getAgronomyExperts(params),
  });
};
