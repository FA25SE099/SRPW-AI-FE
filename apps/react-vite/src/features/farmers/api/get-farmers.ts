import { queryOptions, QueryOptions, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { QueryConfig } from "@/lib/react-query";

export type Farmer = {
    farmerId: string;
    fullName: string;
    address: string;
    phoneNumber: string;
    isActive: boolean;
    lastActivityAt: string;
    farmCode: string;
    plotCount: number;
};

export type GetFarmersParams = {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    clusterManagerId?: string;
};

export type GetFarmersResponse = {
    succeeded: boolean;
    data: Farmer[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    message: string | null;
    errors: string[];
};

export const getFarmers = ({
    pageNumber = 1,
    pageSize = 10,
    searchTerm,
    clusterManagerId,
}: GetFarmersParams): Promise<GetFarmersResponse> => {
    return api.get('/farmer', {
        params: {
            pageNumber,
            pageSize,
            searchTerm,
            clusterManagerId,
        },
    });
};

export const getFarmersQueryOptions = (params: GetFarmersParams) => {
    return queryOptions({
        queryKey: ['farmer', params],
        queryFn: () => getFarmers(params),
    });
};

type UseFarmersOptions = {
    params?: GetFarmersParams;
    queryConfig?: QueryConfig<typeof getFarmers>;
};

export const useFarmers = ({ params = {}, queryConfig }: UseFarmersOptions = {}) => {
    return useQuery({
        ...queryConfig,
        queryKey: ['farmer', params],
        queryFn: () => getFarmers(params),
    });
};