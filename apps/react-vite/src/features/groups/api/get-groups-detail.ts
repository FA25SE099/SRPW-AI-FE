import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type PlotDetail = {
    id: string;
    area: string;
    soThua: string;
    soTo: string;
    soilType: string;
    status: string;
    farmerName: string;
};

export type ProductionPlan = {
    id: string;
    planName: string;
    basePlantingDate: string;
    status: string;
    totalArea: number;
};

export type UavServiceOrder = {
    id: string;
    orderName: string;
    scheduledDate: string;
    status: string;
    totalArea: number;
    estimatedCost: number;
    vendorName: string;
};

export type Alert = {
    id: string;
    title: string;
    severity: string;
    status: string;
    createdAt: string;
};

export type GroupDetail = {
    id: string;
    clusterName: string;
    seasonId: string;
    plantingDate: string;
    status: string;
    totalArea: number;
    riceVarietyName: string;
    supervisorName: string;
    plots: PlotDetail[];
    productionPlans: ProductionPlan[];
    uavServiceOrders: UavServiceOrder[];
    alerts: Alert[];
};

export type GroupDetailResponse = {
    succeeded: boolean;
    data: GroupDetail;
    message: string;
    errors: string[];
};

export const getGroupDetail = (groupId: string): Promise<GroupDetail> => {
    return api.get(`/Group/${groupId}`); // ← Trả về GroupDetail
};

export const getGroupDetailQueryOptions = (groupId: string) => {
    return queryOptions({
        queryKey: ['group-detail', groupId],
        queryFn: () => getGroupDetail(groupId),
        enabled: !!groupId,
    });
};

type UseGroupDetailOptions = {
    groupId: string;
    queryConfig?: QueryConfig<typeof getGroupDetailQueryOptions>;
};

export const useGroupDetail = ({ groupId, queryConfig }: UseGroupDetailOptions) => {
    return useQuery({
        ...getGroupDetailQueryOptions(groupId),
        ...queryConfig,
    });
};