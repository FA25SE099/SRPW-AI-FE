import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type EmergencyProtocolDetail = {
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
    applicableSeason?: string;
    riceVarietyId?: string | null;
    riceVarietyName?: string | null;
    priority?: number;
    generalNotes?: string;
  }>;
  totalThresholds: number;
  stages: Array<{
    id: string;
    stageName: string;
    sequenceOrder: number;
    expectedDurationDays: number;
    isMandatory: boolean;
    notes?: string | null;
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
        materialId: string;
        quantityPerHa: number;
      }>;
    }>;
  }>;
  totalStages: number;
  totalTasks: number;
  totalMaterialTypes: number;
};

export type EmergencyProtocolResponse = {
  succeeded: boolean;
  data: EmergencyProtocolDetail;
  message: string;
  errors: string[];
};

export const getEmergencyProtocol = (id: string): Promise<EmergencyProtocolResponse> => {
  return api.get(`/EmergencyProtocol/${id}`);
};

export const getEmergencyProtocolQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ['emergency-protocol', id],
    queryFn: () => getEmergencyProtocol(id),
    enabled: !!id,
  });
};

type UseEmergencyProtocolOptions = {
  protocolId: string;
  queryConfig?: QueryConfig<typeof getEmergencyProtocol>;
};

export const useEmergencyProtocol = ({
  protocolId,
  queryConfig,
}: UseEmergencyProtocolOptions) => {
  return useQuery({
    ...getEmergencyProtocolQueryOptions(protocolId),
    ...queryConfig,
  });
};