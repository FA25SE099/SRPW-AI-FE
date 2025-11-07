import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { ApproveRejectPlanInput } from '@/types/api';

import { getPendingApprovalsQueryOptions } from './get-pending-approvals';

export const approveRejectPlanInputSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  approved: z.boolean(),
  notes: z.string().max(1000).optional(),
});

export type ApproveRejectPlanInputType = z.infer<typeof approveRejectPlanInputSchema>;

export const approveRejectPlan = ({
  data,
}: {
  data: ApproveRejectPlanInput;
}): Promise<{ data: string }> => {
  return api.post(`/expert/${data.planId}/approve`, {
    planId: data.planId,
    approved: data.approved,
    notes: data.notes,
  });
};

type UseApproveRejectPlanOptions = {
  mutationConfig?: MutationConfig<typeof approveRejectPlan>;
};

export const useApproveRejectPlan = ({
  mutationConfig,
}: UseApproveRejectPlanOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['pending-approvals'],
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: approveRejectPlan,
  });
};

