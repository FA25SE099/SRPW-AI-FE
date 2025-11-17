import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { GroupFormationParams, GroupFormationResponse } from '../types';

export const createGroups = (
  params: GroupFormationParams,
): Promise<GroupFormationResponse> => {
  return api.post('/Group/form', params);
};

type UseCreateGroupsOptions = {
  mutationConfig?: MutationConfig<typeof createGroups>;
};

export const useCreateGroups = ({ mutationConfig }: UseCreateGroupsOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroups,
    onSuccess: (data, variables) => {
      // Invalidate cluster current season to refresh the dashboard
      queryClient.invalidateQueries({
        queryKey: ['cluster-current-season', variables.clusterId],
      });
      // Invalidate groups list
      queryClient.invalidateQueries({
        queryKey: ['groups'],
      });
    },
    ...mutationConfig,
  });
};

