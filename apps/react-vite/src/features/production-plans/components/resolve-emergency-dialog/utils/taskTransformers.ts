import { EditableStage } from '../types';
import { ProductionPlan } from '@/features/production-plans/types';
import { calculateDaysAfter, calculateDuration } from './taskCalculations';

export const convertPlanToEditableStages = (planDetails: ProductionPlan): EditableStage[] => {
    return planDetails.stages.map(stage => ({
        stageName: stage.stageName,
        sequenceOrder: stage.sequenceOrder,
        tasks: stage.tasks.map(task => ({
            taskName: task.taskName,
            description: task.description || '',
            taskType: task.taskType,
            daysAfter: calculateDaysAfter(planDetails.basePlantingDate, task.scheduledDate),
            durationDays: calculateDuration(task.scheduledDate, task.scheduledEndDate),
            priority: task.priority,
            sequenceOrder: task.sequenceOrder,
            isFromProtocol: false,
            originalTaskId: task.id,
            materials: task.materials.map(m => ({
                materialId: m.materialId,
                quantityPerHa: m.quantityPerHa,
            })),
        })),
    }));
};

export const convertEditableTasksToPayload = (
    editableStages: EditableStage[],
    planDetails: ProductionPlan,
    resolutionReason: string
) => {
    const baseCultivationTasks: any[] = [];

    editableStages.forEach((stage) => {
        stage.tasks.forEach((task) => {
            const scheduledDate = new Date(planDetails.basePlantingDate);
            scheduledDate.setDate(scheduledDate.getDate() + task.daysAfter);

            const scheduledEndDate = new Date(scheduledDate);
            scheduledEndDate.setDate(scheduledEndDate.getDate() + task.durationDays - 1);

            // Only mark NEW tasks as contingency (when productionPlanTaskId is null)
            const isNewTask = !task.originalTaskId;
            
            baseCultivationTasks.push({
                productionPlanTaskId: task.originalTaskId || null,
                taskName: task.taskName,
                description: task.description,
                taskType: task.taskType,
                scheduledEndDate: scheduledEndDate.toISOString(),
                status: 'Draft',
                executionOrder: task.sequenceOrder,
                isContingency: isNewTask,
                contingencyReason: isNewTask ? resolutionReason : null,
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

