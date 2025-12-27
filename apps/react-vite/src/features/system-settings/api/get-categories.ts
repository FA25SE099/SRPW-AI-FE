import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { GetCategoriesResponse } from '../types';

export const getSystemSettingCategories = (): Promise<GetCategoriesResponse> => {
  return api.get('/SystemSetting/categories');
};

export const getSystemSettingCategoriesQueryOptions = () => {
  return queryOptions({
    queryKey: ['system-settings', 'categories'],
    queryFn: () => getSystemSettingCategories(),
  });
};

type UseSystemSettingCategoriesOptions = {
  queryConfig?: QueryConfig<typeof getSystemSettingCategoriesQueryOptions>;
};

export const useSystemSettingCategories = ({
  queryConfig,
}: UseSystemSettingCategoriesOptions = {}) => {
  return useQuery({
    ...getSystemSettingCategoriesQueryOptions(),
    ...queryConfig,
  });
};

