import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export type TaskPriority = 'Low' | 'Normal' | 'High' | 'Critical';

export const createUavOrderInputSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  uavVendorId: z.string().min(1, 'UAV Vendor is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  selectedPlotIds: z.array(z.string()).min(1, 'At least one plot must be selected'),
  cultivationTaskIds: z.array(z.string()).optional(), // New: Allow specifying specific cultivation tasks
  orderNameOverride: z.string().max(255).optional(),
  priority: z.enum(['Low', 'Normal', 'High', 'Critical']).optional(),
  clusterManagerId: z.string().optional(), // New: Cluster manager who creates the order
});

export type CreateUavOrderInput = z.infer<typeof createUavOrderInputSchema>;

export interface CreateUavOrderResponse {
  succeeded: boolean;
  data: string; // Order ID
  message: string;
  errors: string[];
}

export const createUavOrder = (
  data: CreateUavOrderInput
): Promise<CreateUavOrderResponse> => {
  return api.post('/uav/orders/uav/orders', data);
};

type UseCreateUavOrderOptions = {
  mutationConfig?: MutationConfig<typeof createUavOrder>;
};

export const useCreateUavOrder = ({
  mutationConfig,
}: UseCreateUavOrderOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['uav-ready-plots'],
      });
      queryClient.invalidateQueries({
        queryKey: ['cluster-manager-groups'],
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createUavOrder,
  });
};

