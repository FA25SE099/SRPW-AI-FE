import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type Supervisor = {
  supervisorId: string;
  fullName: string;
  email: string;
  address?: string | null;
  phoneNumber: string;
  currentFarmerCount?: number;
  lastActivityAt?: string | null;
};

export type GetSupervisorsParams = {
  searchNameOrEmail?: string;
  searchPhoneNumber?: string;
  advancedSearch?: string;
  currentPage?: number;
  pageSize?: number;
};

export type SupervisorsResponse = {
  succeeded: boolean;
  data: Supervisor[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  message: string;
  errors: string[];
};

export const getSupervisors = async (
  params: GetSupervisorsParams
): Promise<SupervisorsResponse> => {
  return api.post('/Supervisor/get-all-supervisor-admin', {
    searchNameOrEmail: params.searchNameOrEmail || '',
    searchPhoneNumber: params.searchPhoneNumber || '',
    advancedSearch: params.advancedSearch || '',
    currentPage: params.currentPage || 1,
    pageSize: params.pageSize || 10,
  });
};

type UseSupervisorsOptions = {
  params: GetSupervisorsParams;
  queryConfig?: QueryConfig<typeof getSupervisors>;
};

export const useSupervisors = ({
  params,
  queryConfig,
}: UseSupervisorsOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: [
      'supervisors',
      params.currentPage,
      params.pageSize,
      params.searchNameOrEmail,
      params.searchPhoneNumber,
      params.advancedSearch,
    ],
    queryFn: () => getSupervisors(params),
  });
};
