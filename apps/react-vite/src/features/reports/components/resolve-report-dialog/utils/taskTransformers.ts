import { EditableStage } from '../types';
import { CultivationPlan } from '@/features/reports/types';
import { calculateDaysAfter, calculateDuration } from './taskCalculations';

export const convertCultivationPlanToEditableStages = (cultivationPlan: CultivationPlan): EditableStage[] => {
    return cultivationPlan.stages.map(stage => ({
        stageName: stage.stageName,
        sequenceOrder: stage.sequenceOrder,
        tasks: stage.tasks.map(task => ({
            taskName: task.taskName,
            description: task.description || '',
            taskType: task.taskType,
            daysAfter: calculateDaysAfter(cultivationPlan.basePlantingDate, task.scheduledDate),
            durationDays: calculateDuration(task.scheduledDate, task.scheduledEndDate),
            priority: task.priority,
            sequenceOrder: task.sequenceOrder,
            isFromProtocol: false,
            originalTaskId: task.id,
            originalTaskStatus: task.status || 'Draft', // Preserve original status
            status: task.status || 'Draft', // Current status, can be changed
            materials: task.materials.map(m => ({
                materialId: m.materialId,
                quantityPerHa: m.quantityPerHa,
            })),
        })),
    }));
};

export const convertEditableTasksToPayload = (
    editableStages: EditableStage[],
    cultivationPlan: CultivationPlan,
    resolutionReason: string
) => {
    const baseCultivationTasks: any[] = [];

    editableStages.forEach((stage) => {
        stage.tasks.forEach((task) => {
            const scheduledDate = new Date(cultivationPlan.basePlantingDate);
            scheduledDate.setDate(scheduledDate.getDate() + task.daysAfter);

            const scheduledEndDate = new Date(scheduledDate);
            scheduledEndDate.setDate(scheduledEndDate.getDate() + task.durationDays - 1);

            // Determine if this is a new or protocol task (no originalTaskId)
            const isNewTask = !task.originalTaskId;
            
            // New tasks and protocol tasks get Emergency status
            // Old tasks keep their original status
            let taskStatus = task.status;
            if (isNewTask || task.isFromProtocol) {
                taskStatus = 'Emergency';
            }
            
            baseCultivationTasks.push({
                cultivationPlanTaskId: task.originalTaskId || null,
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

