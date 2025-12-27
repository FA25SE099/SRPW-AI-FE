import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { UpdateSystemSettingRequest, UpdateSystemSettingResponse } from '../types';

export const updateSystemSetting = ({
  id,
  data,
}: {
  id: string;
  data: UpdateSystemSettingRequest;
}): Promise<UpdateSystemSettingResponse> => {
  return api.put(`/SystemSetting/${id}`, data);
};

type UseUpdateSystemSettingOptions = {
  mutationConfig?: MutationConfig<typeof updateSystemSetting>;
};

export const useUpdateSystemSetting = ({
  mutationConfig,
}: UseUpdateSystemSettingOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: updateSystemSetting,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['system-settings'],
      });
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};

