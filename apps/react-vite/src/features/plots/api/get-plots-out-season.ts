import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { PlotsOutSeasonResponse, GetPlotsOutSeasonParams } from './get-all-plots';

export const getPlotsOutSeason = async (
    params: GetPlotsOutSeasonParams = {}
): Promise<PlotsOutSeasonResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.currentDate) searchParams.append('currentDate', params.currentDate);
    if (params.searchTerm) searchParams.append('searchTerm', params.searchTerm);

    const queryString = searchParams.toString();
    const url = queryString ? `/Plot/out-season?${queryString}` : '/Plot/out-season';
    
    return api.get(url);
};

export const getPlotsOutSeasonQueryOptions = (params: GetPlotsOutSeasonParams = {}) => {
    return queryOptions({
        queryKey: ['plots', 'out-season', params],
        queryFn: () => getPlotsOutSeason(params),
        staleTime: 30000, // 30 seconds
    });
};

type UsePlotsOutSeasonOptions = {
    params?: GetPlotsOutSeasonParams;
    queryConfig?: QueryConfig<typeof getPlotsOutSeasonQueryOptions>;
};

export const usePlotsOutSeason = ({
    params = {},
    queryConfig,
}: UsePlotsOutSeasonOptions = {}) => {
    return useQuery({
        ...getPlotsOutSeasonQueryOptions(params),
        ...queryConfig,
    });
};

