import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export const plotInputSchema = z.object({
  farmerId: z.string().min(1, 'Farmer is required'),
  soThua: z.coerce.number().positive('Sở Thửa must be a positive number'),
  soTo: z.coerce.number().positive('Sở Tờ must be a positive number'),
  area: z.coerce.number().positive('Area must be a positive number'),
  soilType: z.string().min(1, 'Soil type is required'),
  riceVarietyName: z.string().min(1, 'Rice variety is required'),
});

export const bulkCreatePlotsInputSchema = z.object({
  plots: z.array(plotInputSchema).min(1, 'At least one plot is required'),
  clusterManagerId: z.string().optional(),
});

export type PlotInput = z.infer<typeof plotInputSchema>;
export type BulkCreatePlotsInput = z.infer<typeof bulkCreatePlotsInputSchema>;

// This is what the API client returns after unwrapping the Result<T> wrapper
export type BulkCreatePlotsResponse = Array<{
  plotId: string;
  soThua: number;
  soTo: number;
  area: number;
  farmerId: string;
  farmerName: string;
  soilType: string;
  status: string;
  groupId: string | null;
}>;

export const createPlotsBulk = (data: BulkCreatePlotsInput): Promise<BulkCreatePlotsResponse> => {
  return api.post('/plot/bulk', data);
};

type UseCreatePlotsBulkOptions = {
  mutationConfig?: MutationConfig<typeof createPlotsBulk>;
};

export const useCreatePlotsBulk = ({ mutationConfig }: UseCreatePlotsBulkOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['plots'],
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createPlotsBulk,
  });
};

