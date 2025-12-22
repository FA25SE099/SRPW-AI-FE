import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface Material {
    materialId: string;
    materialName: string;
    plannedQuantity: number;
    actualQuantity: number;
    unit: string;
}

export interface Task {
    taskId: string;
    taskName: string;
    taskDescription: string;
    taskType: string;
    status: 'Approved' | 'InProgress' | 'Completed' | 'Pending' | 'NotStarted';
    priority: string;
    plannedStartDate: string | null;
    plannedEndDate: string;
    actualStartDate: string | null;
    actualEndDate: string | null;
    orderIndex: number;
    materials: Material[];
}

export interface CultivationStage {
    stageId: string;
    stageName: string;
    sequenceOrder: number;
    description: string | null;
    typicalDurationDays: number;
    tasks: Task[];
}

export interface CurrentCultivationPlan {
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
    riceVarietyDescription: string | null;
    plantingDate: string;
    expectedYield: number;
    actualYield: number | null;
    cultivationArea: number;
    status: string;
    productionPlanId: string;
    productionPlanName: string;
    productionPlanDescription: string | null;
    activeVersionId: string | null;
    activeVersionName: string | null;
    stages: CultivationStage[];
    progress: {
        totalTasks: number;
        completedTasks: number;
        inProgressTasks: number;
        pendingTasks: number;
        completionPercentage: number;
        daysElapsed: number;
        estimatedDaysRemaining: number;
    };
}

export const getCurrentCultivationPlan = async (
    plotId: string
): Promise<CurrentCultivationPlan> => {
    const response = await api.get(`/cultivation-plan/current/${plotId}`);
    return response as unknown as CurrentCultivationPlan;
}; export const useCurrentCultivationPlan = (plotId: string) => {
    return useQuery({
        queryKey: ["current-cultivation-plan", plotId],
        queryFn: () => getCurrentCultivationPlan(plotId),
        enabled: !!plotId,
        retry: 1,
        staleTime: 30000,
    });
};