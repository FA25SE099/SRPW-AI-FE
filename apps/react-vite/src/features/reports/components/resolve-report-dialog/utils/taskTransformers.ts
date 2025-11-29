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

            // Only mark NEW tasks as contingency (when cultivationPlanTaskId is null)
            const isNewTask = !task.originalTaskId;
            
            baseCultivationTasks.push({
                cultivationPlanTaskId: task.originalTaskId || null,
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

