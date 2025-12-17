import { EditableStage } from '../types';
import { ProductionPlanDetail } from '@/features/production-plans/types';
import { calculateDaysAfter, calculateDuration } from './taskCalculations';

export const convertPlanToEditableStages = (planDetails: ProductionPlanDetail): EditableStage[] => {
    return planDetails.stages.map(stage => ({
        stageName: stage.stageName,
        sequenceOrder: stage.sequenceOrder,
        tasks: stage.tasks.map(task => {
            const daysAfter = calculateDaysAfter(planDetails.basePlantingDate, task.scheduledDate);
            const durationDays = calculateDuration(task.scheduledDate, task.scheduledEndDate);

            return {
                taskName: task.taskName,
                description: task.description || '',
                taskType: task.taskType,
                daysAfter,
                durationDays,
                priority: task.priority,
                sequenceOrder: task.sequenceOrder,
                isFromProtocol: false,
                originalTaskId: task.id,
                status: task.status || 'Draft', // Preserve task status
                materials: task.materials.map(m => ({
                    materialId: m.materialId,
                    quantityPerHa: m.quantityPerHa,
                })),
            };
        }),
    }));
};

export const convertEditableTasksToPayload = (
    editableStages: EditableStage[],
    planDetails: ProductionPlanDetail,
    resolutionReason: string
) => {
    const baseCultivationTasks: any[] = [];

    editableStages.forEach((stage) => {
        stage.tasks.forEach((task) => {
            const scheduledDate = new Date(planDetails.basePlantingDate);
            scheduledDate.setDate(scheduledDate.getDate() + task.daysAfter);

            const scheduledEndDate = new Date(scheduledDate);
            scheduledEndDate.setDate(scheduledEndDate.getDate() + task.durationDays - 1);

            // Determine if this is a new or protocol task
            const isNewTask = !task.originalTaskId;
            
            // New tasks and protocol tasks get Emergency status
            // Old tasks keep their original status
            let taskStatus = task.status;
            if (isNewTask || task.isFromProtocol) {
                taskStatus = 'Emergency';
            }

            baseCultivationTasks.push({
                productionPlanTaskId: task.originalTaskId || null,
                taskName: task.taskName,
                description: task.description,
                taskType: task.taskType,
                scheduledEndDate: scheduledEndDate.toISOString(),
                status: taskStatus,
                executionOrder: task.sequenceOrder,
                isContingency: isNewTask || task.isFromProtocol,
                contingencyReason: (isNewTask || task.isFromProtocol) ? resolutionReason : null,
                defaultAssignedToUserId: null,
                defaultAssignedToVendorId: null,
                materialsPerHectare: task.materials.map(m => ({
                    materialId: m.materialId,
                    quantityPerHa: m.quantityPerHa,
                    notes: null,
                })),
            });
        });
    });

    return baseCultivationTasks;
};

