import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { QueryConfig } from "@/lib/react-query";

// Production Plan Types
export type ProductionStage = {
    productionStageId: string;
    stageName: string;
    description: string;
    sequenceOrder: number;
    typicalDurationDays: number;
    isActive: boolean;
    notes: string;
};

export type Material = {
    materialId: string;
    name: string;
    ammountPerMaterial: number;
    unit: string;
    pricePerMaterial: number;
};

export type ProductionPlanTask = {
    productionPlanTaskId: string;
    taskName: string;
    description: string;
    taskType: "Fertilization" | string;
    scheduledDate: string;
    scheduledEndDate: string;
    status: "Draft" | "Active" | "Completed" | string;
    priority: "Low" | "Medium" | "High" | string;
    sequenceOrder: number;
};

export type ProductionPlan = {
    productionPlanId: string;
    groupId: string;
    standardPlanId: string;
    assignedToUserId: string;
    planName: string;
    basePlantingDate: string;
    status: "Draft" | "Active" | "Completed" | string;
    totalArea: number;
    submittedAt: string;
    approvedAt: string;
    approvedBy: string;
    submittedBy: string;
    currentProductionStageId: string;
};

// Plot Types
export type FarmerPlot = {
    plotId: string;
    farmerId: string;
    farmerName: string;
    groupId: string;
    boundaryGeoJson: string;
    coordinateGeoJson: string;
    soThua: number;
    soTo: number;
    area: number;
    soilType: string;
    status: "Active" | "Inactive" | string;
    varietyName: string;
    productionPlans?: ProductionPlan[];
};

// Group Types
export type FarmerGroup = {
    groupId: string;
    clusterId: string;
    supervisorId: string;
    status: "Draft" | "Active" | "Inactive" | string;
    area: string;
    totalArea: number;
    plots?: FarmerPlot[];
};

// Farmer Detail Type
export type FarmerDetail = {
    farmerId: string;
    fullName: string;
    address: string;
    phoneNumber: string;
    isActive: boolean;
    isVerified: boolean;
    lastActivityAt: string;
    farmCode: string;
    plotCount: number;
    groups: FarmerGroup[];
    plots: FarmerPlot[];
};

// API Function
export const getFarmerDetail = (farmerId: string): Promise<FarmerDetail> => {
    return api.get(`/farmer/detail/${farmerId}`);
};

// Query Options - SỬA LẠI TÊN HÀM
export const getFarmerDetailQueryOptions = (farmerId: string) => {
    return queryOptions({
        queryKey: ['farmer', 'detail', farmerId],
        queryFn: () => getFarmerDetail(farmerId),
        enabled: !!farmerId,
    });
};

// Custom Hook Options - SỬA LẠI TYPE
type UseFarmerDetailOptions = {
    farmerId: string;
    queryConfig?: QueryConfig<typeof getFarmerDetailQueryOptions>;
};

// Custom Hook
export const useFarmerDetail = ({ farmerId, queryConfig }: UseFarmerDetailOptions) => {
    return useQuery({
        ...getFarmerDetailQueryOptions(farmerId),
        ...queryConfig,
    });
};