import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type RiceVarietySimple = {
  id: string;
  varietyName: string;
  categoryId: string;
  categoryName: string;
  baseGrowthDurationDays: number;
  baseYieldPerHectare: number;
  description: string | null;
  characteristics: string;
  isActive: boolean;
  associatedSeasons: Array<{
    seasonId: string;
    seasonName: string;
    startDate: string;
    endDate: string;
    growthDurationDays: number;
    expectedYieldPerHectare: number;
    optimalPlantingStart: string;
    optimalPlantingEnd: string;
    riskLevel: string;
    isRecommended: boolean;
  }>;
};

export const getRiceVarietiesSimple = async (): Promise<{
  succeeded: boolean;
  data: RiceVarietySimple[];
  message: string;
  errors: string[];
}> => {
  return api.get('/RiceVariety');
};

export const getRiceVarietiesSimpleQueryOptions = () => {
  return queryOptions({
    queryKey: ['rice-varieties-simple'],
    queryFn: () => getRiceVarietiesSimple(),
  });
};

type UseRiceVarietiesSimpleOptions = {
  queryConfig?: QueryConfig<typeof getRiceVarietiesSimple>;
};

export const useRiceVarietiesSimple = ({
  queryConfig,
}: UseRiceVarietiesSimpleOptions = {}): ReturnType<typeof useQuery<{
  succeeded: boolean;
  data: RiceVarietySimple[];
  message: string;
  errors: string[];
}>> => {
  return useQuery({
    ...queryConfig,
    queryKey: ['rice-varieties-simple'],
    queryFn: () => getRiceVarietiesSimple(),
  });
};