import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export type CreateEmergencyProtocolDTO = {
  categoryId: string;
  planName: string;
  description: string;
  totalDurationDays: number;
  isActive: boolean;
  stages: Array<{
    stageName: string;
    sequenceOrder: number;
    expectedDurationDays: number;
    isMandatory: boolean;
    notes?: string;
    tasks: Array<{
      taskName: string;
      description?: string;
      daysAfter: number;
      durationDays: number;
      taskType: string;
      priority: string;
      sequenceOrder: number;
      materials: Array<{
        materialId: string;
        quantityPerHa: number;
      }>;
    }>;
  }>;
  thresholds: Array<{
    pestProtocolId?: string;
    weatherProtocolId?: string;
    pestAffectType?: string;
    pestSeverityLevel?: string;
    pestAreaThresholdPercent?: number;
    pestPopulationThreshold?: string;
    pestDamageThresholdPercent?: number;
    pestGrowthStage?: string;
    pestThresholdNotes?: string;
    weatherEventType?: string;
    weatherIntensityLevel?: string;
    weatherMeasurementThreshold?: number;
    weatherMeasurementUnit?: string;
    weatherThresholdOperator?: string;
    weatherDurationDaysThreshold?: number;
    weatherThresholdNotes?: string;
    applicableSeason?: string;
    riceVarietyId?: string;
    priority?: number;
    generalNotes?: string;
  }>;
};

export const createEmergencyProtocol = (
  data: CreateEmergencyProtocolDTO
): Promise<{
  succeeded: boolean;
  data: string;
  message: string;
  errors: string[];
}> => {
  return api.post('/EmergencyProtocol', data);
};

type UseCreateEmergencyProtocolOptions = {
  mutationConfig?: MutationConfig<typeof createEmergencyProtocol>;
};

export const useCreateEmergencyProtocol = ({
  mutationConfig,
}: UseCreateEmergencyProtocolOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['emergency-protocols'] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createEmergencyProtocol,
  });
};