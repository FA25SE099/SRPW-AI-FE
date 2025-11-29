import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type EmergencyProtocolDetails = {
  id: string;
  planName: string;
  description: string;
  totalDurationDays: number;
  isActive: boolean;
  categoryId: string;
  categoryName: string;
  createdBy: string;
  creatorName: string;
  createdAt: string;
  lastModified: string;
  thresholds: Array<{
    id: string;
    pestProtocolId?: string;
    pestProtocolName?: string;
    weatherProtocolId?: string;
    weatherProtocolName?: string;
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
    applicableSeason: string;
    riceVarietyId?: string;
    riceVarietyName?: string;
    priority: number;
    generalNotes?: string;
  }>;
  totalThresholds: number;
  stages: Array<{
    id: string;
    stageName: string;
    sequenceOrder: number;
    expectedDurationDays: number;
    isMandatory: boolean;
    notes?: string;
    tasks: Array<{
      id: string;
      taskName: string;
      description?: string;
      daysAfter: number;
      durationDays: number;
      taskType: string;
      priority: string;
      sequenceOrder: number;
      materials: Array<{
        id: string;
        materialId: string;
        materialName: string;
        quantityPerHa: number;
        unit: string;
        pricePerUnit: number;
        estimatedCostPerHa: number;
      }>;
    }>;
  }>;
  totalStages: number;
  totalTasks: number;
  totalMaterialTypes: number;
};

export type EmergencyProtocolDetailsResponse = {
  succeeded: boolean;
  data: EmergencyProtocolDetails;
  message: string;
  errors: string[];
};

export const getEmergencyProtocolDetails = (protocolId: string): Promise<EmergencyProtocolDetailsResponse> => {
  return api.get(`/EmergencyProtocol/${protocolId}`);
};

type UseEmergencyProtocolDetailsOptions = {
  protocolId: string;
  enabled?: boolean;
  queryConfig?: QueryConfig<typeof getEmergencyProtocolDetails>;
};

export const useEmergencyProtocolDetails = ({
  protocolId,
  enabled = true,
  queryConfig,
}: UseEmergencyProtocolDetailsOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['emergency-protocol-details', protocolId],
    queryFn: () => getEmergencyProtocolDetails(protocolId),
    enabled: enabled && !!protocolId,
  });
};