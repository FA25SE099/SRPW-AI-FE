import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export type UpdatePestProtocolDTO = {
  id: string;
  name: string;
  description: string;
  type: string;
  imageLinks: string[];
  isActive: boolean;
  notes: string;
};

export const updatePestProtocol = (data: UpdatePestProtocolDTO): Promise<{
  succeeded: boolean;
  data: string;
  message: string;
  errors: string[];
}> => {
  return api.put('/PestProtocol', data);
};

export const useUpdatePestProtocol = ({
  mutationConfig,
}: {
  mutationConfig?: MutationConfig<typeof updatePestProtocol>;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePestProtocol,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['pest-protocols'] });
      mutationConfig?.onSuccess?.(...args);
    },
    ...mutationConfig,
  });
};