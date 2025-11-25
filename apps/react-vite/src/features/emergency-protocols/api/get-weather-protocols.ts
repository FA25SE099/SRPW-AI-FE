import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type WeatherProtocol = {
  id: string;
  name: string;
  description: string;
  source: string;
  sourceLink: string;
  imageLinks: string[]; // Changed from imageLink to imageLinks
  isActive: boolean;
  notes: string;
  createdAt: string;
  lastModified: string;
};

type GetWeatherProtocolsParams = {
  currentPage?: number;
  pageSize?: number;
  searchName?: string;
  isActive?: boolean;
};

export const getWeatherProtocols = async (
  params?: GetWeatherProtocolsParams
): Promise<{
  data: WeatherProtocol[];
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}> => {
  return api.post('/WeatherProtocol/get-all', {
    currentPage: params?.currentPage || 1,
    pageSize: params?.pageSize || 10,
    searchName: params?.searchName || '',
    isActive: params?.isActive ?? true,
  });
};

export const getWeatherProtocolsQueryOptions = (
  params?: GetWeatherProtocolsParams
) => {
  return queryOptions({
    queryKey: ['weather-protocols', params],
    queryFn: () => getWeatherProtocols(params),
  });
};

type UseWeatherProtocolsOptions = {
  params?: GetWeatherProtocolsParams;
  queryConfig?: QueryConfig<typeof getWeatherProtocolsQueryOptions>;
};

export const useWeatherProtocols = ({
  params,
  queryConfig,
}: UseWeatherProtocolsOptions = {}) => {
  return useQuery({
    ...getWeatherProtocolsQueryOptions(params),
    ...queryConfig,
  });
};

// Create Weather Protocol
export type CreateWeatherProtocolDTO = {
  name: string;
  description: string;
  source: string;
  sourceLink: string;
  imageLinks: string[]; // Changed from imageLink to imageLinks
  isActive: boolean;
  notes: string;
};

export const createWeatherProtocol = (
  data: CreateWeatherProtocolDTO
): Promise<{
  succeeded: boolean;
  data: string;
  message: string;
  errors: string[];
}> => {
  return api.post('/WeatherProtocol', data);
};

export const useCreateWeatherProtocol = ({
  mutationConfig,
}: {
  mutationConfig?: any;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWeatherProtocol,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['weather-protocols'] });
      mutationConfig?.onSuccess?.(...args);
    },
    ...mutationConfig,
  });
};