import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { QueryConfig } from "@/lib/react-query";

export type PlotStatus = "Active" | "PendingPolygon" | string;

export type PlotListResponse = {
    plotId: string;
    area: number;
    soThua?: number;
    soTo?: number;
    status: PlotStatus;
    groupId?: string;
    boundary?: string;
    coordinate?: string;
    groupName?: string;
    activeCultivations: number;
    activeAlerts: number;
};

export type GetFarmerPlotsParams = {
    farmerId: string;
    currentPage?: number;
    pageSize?: number;
    status?: PlotStatus;
    isUnassigned?: boolean | null;
};

export type GetFarmerPlotsResponse = {
    succeeded: boolean;
    data: PlotListResponse[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    message: string;
};

export const getFarmerPlots = (params: GetFarmerPlotsParams): Promise<GetFarmerPlotsResponse> => {
    const requestBody: any = {
        currentPage: params.currentPage || 1,
        pageSize: params.pageSize || 20,
    };

    if (params.status) {
        requestBody.status = params.status;
    }
    if (params.isUnassigned !== undefined && params.isUnassigned !== null) {
        requestBody.isUnassigned = params.isUnassigned;
    }

    return api.post(`/farmer/${params.farmerId}/plots`, requestBody);
};

export const getFarmerPlotsQueryOptions = (params: GetFarmerPlotsParams) => {
    return queryOptions({
        queryKey: ['farmer-plots', params.farmerId, params],
        queryFn: () => getFarmerPlots(params),
        enabled: !!params.farmerId,
    });
};

type UseFarmerPlotsOptions = {
    params: GetFarmerPlotsParams;
    queryConfig?: QueryConfig<typeof getFarmerPlots>;
};

export const useFarmerPlots = ({ params, queryConfig }: UseFarmerPlotsOptions) => {
    return useQuery({
        ...queryConfig,
        queryKey: ['farmer-plots', params.farmerId, params],
        queryFn: () => getFarmerPlots(params),
        enabled: !!params.farmerId,
    });
};