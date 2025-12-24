import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export interface Material {
    materialId: string;
    materialName: string;
    plannedQuantity: number;
    actualQuantity?: number | null;
    unit: string;
}

export interface Task {
    taskId: string;
    taskName: string;
    taskDescription: string;
    taskType: string;
    status: 'Completed' | 'InProgress' | 'Pending' | 'OnHold' | 'Cancelled';
    priority: 'Low' | 'Normal' | 'High';
    plannedStartDate?: string | null;
    plannedEndDate?: string | null;
    actualStartDate?: string | null;
    actualEndDate?: string | null;
    orderIndex: number;
    stageName: string;
    materials: Material[];
}

export interface CultivationProgress {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    completionPercentage: number;
    daysElapsed: number;
    estimatedDaysRemaining: number;
}

export interface CultivationPlan {
    plotCultivationId: string;
    plotId: string;
    plotName: string;
    plotArea: number;
    seasonId: string;
    seasonName: string;
    seasonStartDate: string;
    seasonEndDate: string;
    riceVarietyId: string;
    riceVarietyName: string;
    riceVarietyDescription: string;
    plantingDate: string;
    expectedYield: number;
    actualYield?: number | null;
    cultivationArea: number;
    status: 'Planned' | 'InProgress' | 'Completed' | 'OnHold' | 'Cancelled';
    productionPlanId: string;
    productionPlanName: string;
    productionPlanDescription?: string | null;
    activeVersionId: string;
    activeVersionName: string;
    tasks: Task[];
    progress: CultivationProgress;
}

export const getCultivationPlan = (plotId: string): Promise<{ data: CultivationPlan }> => {
    return api.get(`/cultivation-plan/current/${plotId}`);
};

type UseCultivationPlanOptions = {
    plotId: string;
    queryConfig?: QueryConfig<typeof getCultivationPlan>;
};

export const useCultivationPlan = ({ plotId, queryConfig }: UseCultivationPlanOptions) => {
    return useQuery({
        queryKey: ['cultivation-plan', plotId],
        queryFn: () => getCultivationPlan(plotId),
        enabled: !!plotId,
        ...queryConfig,
    } as any);
};
