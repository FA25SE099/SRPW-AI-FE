import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { ResolveEmergencyDTO } from '../types';

export const resolveEmergency = async (data: ResolveEmergencyDTO): Promise<void> => {
  return api.post('/production-plans/resolve-emergency', data);
};

type UseResolveEmergencyOptions = {
  mutationConfig?: MutationConfig<typeof resolveEmergency>;
};

export const useResolveEmergency = ({ mutationConfig }: UseResolveEmergencyOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: resolveEmergency,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['emergency-plans'] });
      queryClient.invalidateQueries({ queryKey: ['production-plans'] });
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};