import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type YearSeasonGroupStatus = 'Draft' | 'Active' | 'Completed' | 'Cancelled';

export type YearSeasonGroup = {
  groupId: string;
  groupName: string | null;
  clusterId: string;
  clusterName: string;
  supervisorId: string | null;
  supervisorName: string | null;
  yearSeasonId: string;
  year: number;
  plantingDate: string | null;
  status: YearSeasonGroupStatus;
  isException: boolean;
  exceptionReason: string | null;
  readyForUavDate: string | null;
  area: string | null; // WKT Polygon - can be ignored for now
  totalArea: number;
  plotCount: number;
  farmerCount: number;
  productionPlanCount: number;
  uavServiceOrderCount: number;
  alertCount: number;
};

export type YearSeasonGroupsStatusSummary = {
  draftCount: number;
  activeCount: number;
  completedCount: number;
  cancelledCount: number;
  totalCount: number;
};

export type YearSeasonGroupsResponse = {
  yearSeasonId: string;
  yearSeasonDisplayName: string;
  clusterId: string;
  clusterName: string;
  year: number;
  seasonName: string;
  riceVarietyId: string;
  riceVarietyName: string;
  totalGroupCount: number;
  groups: YearSeasonGroup[];
  statusSummary: YearSeasonGroupsStatusSummary;
};

export const getYearSeasonGroups = (
  yearSeasonId: string
): Promise<YearSeasonGroupsResponse> => {
  return api.get(`/YearSeason/${yearSeasonId}/groups`);
};

export const getYearSeasonGroupsQueryOptions = (yearSeasonId: string) =>
  queryOptions({
    queryKey: ['yearseason', yearSeasonId, 'groups'],
    queryFn: () => getYearSeasonGroups(yearSeasonId),
    // Remove caching - always fetch fresh data
    staleTime: 0,
  });

export const useYearSeasonGroups = ({
  yearSeasonId,
  queryConfig,
}: {
  yearSeasonId: string;
  queryConfig?: QueryConfig<typeof getYearSeasonGroups>;
}) => {
  return useQuery({
    ...getYearSeasonGroupsQueryOptions(yearSeasonId),
    ...queryConfig,
  });
};

