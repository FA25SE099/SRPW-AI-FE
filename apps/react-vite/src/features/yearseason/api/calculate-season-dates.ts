import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type CalculateSeasonDatesParams = {
  seasonId: string;
  year: number;
};

export type CalculateSeasonDatesResponse = {
  seasonId: string;
  seasonName: string;
  year: number;
  seasonStartDateFormat: string; // MM/DD format from Season table
  seasonEndDateFormat: string; // MM/DD format from Season table
  startDate: string; // MM/DD/YYYY format (e.g., "12/01/2025")
  endDate: string; // MM/DD/YYYY format (e.g., "04/30/2026")
  crossesYears: boolean;
  durationDays: number;
  suggestedFarmerSelectionWindowStart: string; // MM/DD/YYYY format
  suggestedFarmerSelectionWindowEnd: string; // MM/DD/YYYY format
  suggestedPlanningWindowStart: string; // MM/DD/YYYY format
  suggestedPlanningWindowEnd: string; // MM/DD/YYYY format
};

export const calculateSeasonDates = async (
  params: CalculateSeasonDatesParams
): Promise<CalculateSeasonDatesResponse> => {
  return api.get('/yearseason/calculate-dates', {
    params: {
      seasonId: params.seasonId,
      year: params.year,
    },
  });
};

type UseCalculateSeasonDatesOptions = {
  params: CalculateSeasonDatesParams;
  queryConfig?: QueryConfig<typeof calculateSeasonDates>;
};

export const useCalculateSeasonDates = ({
  params,
  queryConfig,
}: UseCalculateSeasonDatesOptions) => {
  return useQuery({
    ...queryConfig,
    queryKey: ['calculate-season-dates', params],
    queryFn: () => calculateSeasonDates(params),
  });
};

