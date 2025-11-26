import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export type UpdateWeatherProtocolDTO = {
  id: string;
  name: string;
  description: string;
  source: string;
  sourceLink: string;
  imageLinks: string[];
  isActive: boolean;
  notes: string;
};

export const updateWeatherProtocol = (data: UpdateWeatherProtocolDTO): Promise<{
  succeeded: boolean;
  data: string;
  message: string;
  errors: string[];
}> => {
  return api.put('/WeatherProtocol', data);
};

export const useUpdateWeatherProtocol = ({
  mutationConfig,
}: {
  mutationConfig?: MutationConfig<typeof updateWeatherProtocol>;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWeatherProtocol,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['weather-protocols'] });
      mutationConfig?.onSuccess?.(...args);
    },
    ...mutationConfig,
  });
};