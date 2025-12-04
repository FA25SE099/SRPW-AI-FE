import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

// =============== TYPES ===============

export type PlotStatus = 'Active' | 'Inactive' | 'Emergency' | 'Locked';
export type ProductionPlanStatus =
    | 'Draft'
    | 'Submitted'
    | 'Approved'
    | 'InProgress'
    | 'Completed'
    | 'Cancelled';
export type CultivationStatus =
    | 'Planned'
    | 'InProgress'
    | 'Completed'
    | 'Failed';
export type GroupStatus = 'Draft' | 'Active' | 'Inactive' | 'Completed';
export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';

export type SeasonDTO = {
    seasonId: string;
    seasonName: string;
    startDate: string;
    endDate: string;
    seasonType: string;
    isActive: boolean;
};

export type GroupDTO = {
    groupId: string;
    clusterId: string;
    supervisorId: string;
    status: GroupStatus;
    area: string;
    totalArea: number;
};

// ✅ NEW: ProductionPlanTask from backend
export type ProductionPlanTaskDTO = {
    productionPlanTaskId: string;
    taskName: string;
    description: string;
    taskType: string;
    scheduledDate: string;
    scheduledEndDate: string;
    status: TaskStatus;
    priority: string;
    sequenceOrder: number;
};

// ✅ UPDATED: ProductionStageDTO structure from backend
export type ProductionStageDTO = {
    productionStageId: string;
    stageName: string;
    description: string;
    sequenceOrder: number;
    typicalDurationDays: number;
    isActive: boolean;
    notes?: string;
    productionPlanTasks: ProductionPlanTaskDTO[];
};

export type ProductionPlanDTO = {
    productionPlanId: string;
    groupId: string;
    standardPlanId: string;
    assignedToUserId?: string | null;
    planName: string;
    basePlantingDate: string;
    status: ProductionPlanStatus;
    totalArea: number;
    submittedAt?: string;
    approvedAt?: string;
    approvedBy?: string | null;
    submittedBy?: string;
    currentProductionStageId?: string;
    group: GroupDTO;
    submitter?: any;
    approver?: any;
    currentProductionStages: ProductionStageDTO[];
};

// ✅ NEW: CultivationTask from backend
export type CultivationTaskDTO = {
    cultivationTaskId: string;
    productionPlanTaskId: string;
    assignedToUserId?: string | null;
    assignedToVendorId?: string | null;
    executionOrder?: number | null;
    isContingency: boolean;
    contingencyReason?: string | null;
    actualStartDate: string;
    actualEndDate?: string | null;
    actualMaterialCost: number;
    actualServiceCost: number;
    completionPercentage: number;
    completedAt?: string | null;
    verifiedBy?: string | null;
    verifiedAt?: string | null;
    weatherConditions?: string | null;
    interruptionReason?: string | null;
};

export type PlotCultivationDTO = {
    plotCultivationId: string;
    plotId: string;
    seasonId: string;
    riceVarietyId: string;
    plantingDate: string;
    actualYield: number;
    status: CultivationStatus;
    currentProductionStageId?: string | null;
    currentStageStartDate?: string | null;
    cultivationTasks: CultivationTaskDTO[];
};

export type PlotDetailDTO = {
    plotId: string;
    farmerId: string;
    farmerName: string;
    groupId: string;
    boundaryGeoJson: string;
    coordinateGeoJson?: string | null;
    soThua: number;
    soTo: number;
    area: number;
    soilType?: string | null;
    status: PlotStatus;
    varietyName: string;
    seasons: SeasonDTO[];
    productionPlans: ProductionPlanDTO[];
    plotCultivations: PlotCultivationDTO[];
};

export type GetPlotDetailResponse = {
    succeeded: boolean;
    data: PlotDetailDTO;
    message?: string;
    errors?: string[];
};

// =============== API FUNCTIONS ===============

export const getPlotDetail = (plotId: string): Promise<PlotDetailDTO> => {
    return api.get(`/Plot/detail/${plotId}`);
};

export const getPlotDetailQueryOptions = (plotId: string) => {
    return queryOptions({
        queryKey: ['plots', 'detail', plotId],
        queryFn: () => getPlotDetail(plotId),
        enabled: !!plotId && plotId !== '',
    });
};

type UsePlotDetailOptions = {
    plotId: string;
    queryConfig?: QueryConfig<typeof getPlotDetail>;
};

export const usePlotDetail = ({
    plotId,
    queryConfig,
}: UsePlotDetailOptions) => {
    return useQuery({
        ...queryConfig,
        queryKey: ['plots', 'detail', plotId],
        queryFn: () => getPlotDetail(plotId),
        enabled: !!plotId && plotId !== '',
    });
};
