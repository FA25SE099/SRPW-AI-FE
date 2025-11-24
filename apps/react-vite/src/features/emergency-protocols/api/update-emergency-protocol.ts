import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { z } from 'zod';

export const updateEmergencyProtocolInputSchema = z.object({
  emergencyProtocolId: z.string(),
  categoryId: z.string(),
  planName: z.string().min(1, 'Plan name is required'),
  description: z.string().min(1, 'Description is required'),
  totalDurationDays: z.number().min(1, 'Duration must be at least 1 day'),
  isActive: z.boolean(),
  stages: z.array(
    z.object({
      stageName: z.string().min(1, 'Stage name is required'),
      sequenceOrder: z.number(),
      expectedDurationDays: z.number().min(1),
      isMandatory: z.boolean(),
      notes: z.string().optional(),
      tasks: z.array(
        z.object({
          taskName: z.string().min(1, 'Task name is required'),
          description: z.string(),
          daysAfter: z.number().min(0),
          durationDays: z.number().min(1),
          taskType: z.string(),
          priority: z.string(),
          sequenceOrder: z.number(),
          materials: z.array(
            z.object({
              materialId: z.string(),
              quantityPerHa: z.number().min(0),
            })
          ),
        })
      ),
    })
  ),
  thresholds: z.array(
    z.object({
      pestProtocolId: z.string().optional().nullable(),
      weatherProtocolId: z.string().optional().nullable(),
      pestAffectType: z.string().optional(),
      pestSeverityLevel: z.string().optional(),
      pestAreaThresholdPercent: z.number().optional(),
      pestPopulationThreshold: z.string().optional(),
      pestDamageThresholdPercent: z.number().optional(),
      pestGrowthStage: z.string().optional(),
      pestThresholdNotes: z.string().optional(),
      weatherEventType: z.string().optional(),
      weatherIntensityLevel: z.string().optional(),
      weatherMeasurementThreshold: z.number().optional(),
      weatherMeasurementUnit: z.string().optional(),
      weatherThresholdOperator: z.string().optional(),
      weatherDurationDaysThreshold: z.number().optional(),
      weatherThresholdNotes: z.string().optional(),
      applicableSeason: z.string().optional(),
      riceVarietyId: z.string().optional().nullable(),
      priority: z.number().optional(),
      generalNotes: z.string().optional(),
    })
  ),
});

export type UpdateEmergencyProtocolInput = z.infer<typeof updateEmergencyProtocolInputSchema>;

export const updateEmergencyProtocol = ({
  emergencyProtocolId,
  data,
}: {
  emergencyProtocolId: string;
  data: UpdateEmergencyProtocolInput;
}): Promise<any> => {
  return api.put(`/EmergencyProtocol/${emergencyProtocolId}`, data);
};

type UseUpdateEmergencyProtocolOptions = {
  mutationConfig?: MutationConfig<typeof updateEmergencyProtocol>;
};

export const useUpdateEmergencyProtocol = ({
  mutationConfig,
}: UseUpdateEmergencyProtocolOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['emergency-protocols'],
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateEmergencyProtocol,
  });
};