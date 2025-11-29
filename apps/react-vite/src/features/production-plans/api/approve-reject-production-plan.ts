import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export type ApproveRejectProductionPlanRequest = {
  planId: string;
  isApproved: boolean;
  comments?: string;
};

export const approveRejectProductionPlan = async (
  data: ApproveRejectProductionPlanRequest
): Promise<string> => {
  return api.post(`/production-plans/${data.planId}/approve-reject`, data);
};

type UseApproveRejectProductionPlanOptions = {
  mutationConfig?: MutationConfig<typeof approveRejectProductionPlan>;
};

export const useApproveRejectProductionPlan = ({
  mutationConfig,
}: UseApproveRejectProductionPlanOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: approveRejectProductionPlan,
    onSuccess: (...args) => {
      // Invalidate queries to refresh
      queryClient.invalidateQueries({ queryKey: ['production-plans'] });
      queryClient.invalidateQueries({ queryKey: ['production-plan'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });

      onSuccess?.(...args);
    },
    ...restConfig,
  });
};

