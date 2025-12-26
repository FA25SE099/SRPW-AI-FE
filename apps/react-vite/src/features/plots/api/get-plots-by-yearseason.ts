import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type YearSeasonPlotDTO = {
  plotId: string;
  farmerId: string;
  farmerName: string;
  farmerPhoneNumber: string;
  soThua: number;
  soTo: number;
  area: number;
  yearSeasonId: string;
  seasonName: string;
  year: number;
  allowFarmerSelection: boolean;
  yearSeasonRiceVarietyId: string | null;
  yearSeasonRiceVarietyName: string | null;
  plotCultivationId: string | null;
  selectedRiceVarietyId: string | null;
  selectedRiceVarietyName: string | null;
  selectedPlantingDate: string | null;
  hasMadeSelection: boolean;
  selectionStatusMessage: string;
};

export type YearSeasonPlotsResponse = {
  succeeded: boolean;
  data: YearSeasonPlotDTO[];
  message: string;
  errors: string[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export type GetPlotsByYearSeasonParams = {
  yearSeasonId: string;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  clusterManagerId?: string;
  hasMadeSelection?: boolean;
  isInGroup?: boolean;
  groupId?: string;
};

export const getPlotsByYearSeason = async (
  params: GetPlotsByYearSeasonParams
): Promise<YearSeasonPlotsResponse> => {
  const searchParams = new URLSearchParams();

  searchParams.append('yearSeasonId', params.yearSeasonId);
  
  if (params.pageNumber) 
    searchParams.append('pageNumber', params.pageNumber.toString());
  if (params.pageSize) 
    searchParams.append('pageSize', params.pageSize.toString());
  if (params.searchTerm) 
    searchParams.append('searchTerm', params.searchTerm);
  if (params.clusterManagerId) 
    searchParams.append('clusterManagerId', params.clusterManagerId);
  if (params.hasMadeSelection !== undefined) 
    searchParams.append('hasMadeSelection', params.hasMadeSelection.toString());
  if (params.isInGroup !== undefined) 
    searchParams.append('isInGroup', params.isInGroup.toString());
  if (params.groupId) 
    searchParams.append('groupId', params.groupId);

  const queryString = searchParams.toString();
  const url = `/Plot/by-year-season?${queryString}`;
  
  return api.get(url);
};

export const getPlotsByYearSeasonQueryOptions = (
  params: GetPlotsByYearSeasonParams
) => {
  return queryOptions({
    // Use individual params in query key for better change detection
    queryKey: [
      'plots', 
      'by-year-season', 
      params.yearSeasonId,
      params.pageNumber,
      params.pageSize,
      params.searchTerm,
      params.clusterManagerId,
      params.hasMadeSelection,
      params.isInGroup,
      params.groupId,
    ],
    queryFn: () => getPlotsByYearSeason(params),
    // Remove caching - always fetch fresh data
    staleTime: 0,
  });
};

type UsePlotsByYearSeasonOptions = {
  params: GetPlotsByYearSeasonParams;
  queryConfig?: QueryConfig<typeof getPlotsByYearSeason>;
};

export const usePlotsByYearSeason = ({
  params,
  queryConfig,
}: UsePlotsByYearSeasonOptions) => {
  return useQuery({
    ...getPlotsByYearSeasonQueryOptions(params),
    ...(queryConfig as any),
  });
};

