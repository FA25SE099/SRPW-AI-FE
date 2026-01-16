import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { PagedResult, User } from '@/types/api';

export type GetAdminUsersParams = {
  currentPage?: number;
  pageSize?: number;
  searchEmailAndName?: string;
  searchPhoneNumber?: string;
  role?: string;
  isActive?: boolean;
  sortBy?: string;
};

export const getAdminUsers = (
  data: GetAdminUsersParams,
): Promise<PagedResult<User[]>> => {
  return api.post('/Admin/users', data);
};

type UseAdminUsersOptions = {
  params: GetAdminUsersParams;
  queryConfig?: QueryConfig<typeof getAdminUsers>;
};

export const useAdminUsers = ({ params, queryConfig }: UseAdminUsersOptions) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => getAdminUsers(params),
    ...queryConfig,
  });
};
