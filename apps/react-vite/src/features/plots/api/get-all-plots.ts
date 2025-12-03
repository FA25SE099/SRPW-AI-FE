import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type PlotStatus = 'Active' | 'Inactive' | 'Emergency' | 'Locked';

export type SeasonType = 'Winter-Spring' | 'Summer-Autumn' | 'Dry Season' | 'Wet Season';

export type SeasonDTO = {
    seasonId: string;
    seasonName: string;
    startDate: string; // ISO 8601
    endDate: string; // ISO 8601
    seasonType: string;
    isActive: boolean;
};

export type PlotDTO = {
    plotId: string;
    farmerId: string;
    farmerName: string;
    groupId: string;
    boundaryGeoJson: string; // GeoJSON Polygon
    coordinateGeoJson: string; // GeoJSON Point
    soThua: number;
    soTo: number;
    area: number;
    soilType: string;
    status: PlotStatus;
    varietyName: string;
    seasons: SeasonDTO[];
};

export type PaginatedPlotsResponse = {
    succeeded: boolean;
    data: PlotDTO[];
    message: string;
    errors: string[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
};

export type PlotsOutSeasonResponse = {
    succeeded: boolean;
    data: PlotDTO[];
    message: string;
    errors: string[];
};

export type GetPlotsParams = {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    clusterManagerId?: string;
};

export type GetPlotsOutSeasonParams = {
    currentDate?: string; // ISO 8601
    searchTerm?: string;
};

export const getPlots = async (params: GetPlotsParams = {}): Promise<PaginatedPlotsResponse> => {
    const searchParams = new URLSearchParams();

    if (params.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    if (params.clusterManagerId) searchParams.append('clusterManagerId', params.clusterManagerId);

    const queryString = searchParams.toString();
    const url = queryString ? `/Plot?${queryString}` :
        '/Plot';
    return api.get(url);
};

export const getPlotsQueryOptions = (params: GetPlotsParams = {}) => {
    return queryOptions({
        queryKey: ['plots', params],
        queryFn: () => getPlots(params),
        staleTime: 5000,
    });
};

type UsePlotsOptions = {
    params?: GetPlotsParams;
    queryConfig?: QueryConfig<typeof getPlotsQueryOptions>;
};

export const usePlots = ({ params = {}, queryConfig }: UsePlotsOptions = {}) => {
    return useQuery({
        ...getPlotsQueryOptions(params),
        ...queryConfig,
    }) as ReturnType<typeof useQuery<PaginatedPlotsResponse, Error>>;
};