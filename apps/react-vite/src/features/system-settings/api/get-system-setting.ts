import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { SystemSetting } from '../types';

export const getSystemSetting = (id: string): Promise<{ data: SystemSetting }> => {
  return api.get(`/SystemSetting/${id}`);
};

export const getSystemSettingQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ['system-settings', id],
    queryFn: () => getSystemSetting(id),
    enabled: !!id,
  });
};

type UseSystemSettingOptions = {
  id: string;
  queryConfig?: Omit<ReturnType<typeof getSystemSettingQueryOptions>, 'queryKey' | 'queryFn'>;
};

export const useSystemSetting = ({
  id,
  queryConfig,
}: UseSystemSettingOptions) => {
  return useQuery({
    ...getSystemSettingQueryOptions(id),
    ...queryConfig,
  });
};

