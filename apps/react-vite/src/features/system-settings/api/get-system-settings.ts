import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { GetSystemSettingsParams, GetSystemSettingsResponse } from '../types';

export const getSystemSettings = (
  params: GetSystemSettingsParams
): Promise<GetSystemSettingsResponse> => {
  return api.post('/SystemSetting/get-all', params);
};

export const getSystemSettingsQueryOptions = (params: GetSystemSettingsParams) => {
  return queryOptions({
    queryKey: ['system-settings', params],
    queryFn: () => getSystemSettings(params),
  });
};

type UseSystemSettingsOptions = {
  params: GetSystemSettingsParams;
  queryConfig?: Omit<ReturnType<typeof getSystemSettingsQueryOptions>, 'queryKey' | 'queryFn'>;
};

export const useSystemSettings = ({
  params,
  queryConfig,
}: UseSystemSettingsOptions) => {
  return useQuery({
    ...getSystemSettingsQueryOptions(params),
    ...queryConfig,
  });
};

