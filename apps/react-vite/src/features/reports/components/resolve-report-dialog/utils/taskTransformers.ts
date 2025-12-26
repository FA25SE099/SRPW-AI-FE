import { EditableStage } from '../types';
import { CultivationPlan } from '@/features/reports/types';
import { calculateDaysAfter, calculateDuration } from './taskCalculations';

export const convertCultivationPlanToEditableStages = (cultivationPlan: CultivationPlan): EditableStage[] => {
    return cultivationPlan.stages.map(stage => {
        // Get the first task's ID to use as cultivationPlanTaskId for emergency tasks in this stage
        const cultivationPlanTaskId = stage.tasks.length > 0 ? stage.tasks[0].id : undefined;
        
        return {
            stageName: stage.stageName,
            sequenceOrder: stage.sequenceOrder,
            cultivationPlanTaskId, // Store for emergency tasks to use
            tasks: stage.tasks.map(task => ({
                taskName: task.taskName,
                description: task.description || '',
                taskType: task.taskType,
                daysAfter: calculateDaysAfter(cultivationPlan.basePlantingDate, task.scheduledDate),
                durationDays: calculateDuration(task.scheduledDate, task.scheduledEndDate),
                scheduledDate: task.scheduledDate || null,
                scheduledEndDate: task.scheduledEndDate || null,
                actualStartDate: task.actualStartDate || null,
                actualEndDate: task.actualEndDate || null,
                priority: task.priority,
                sequenceOrder: task.sequenceOrder,
                isFromProtocol: false,
                originalTaskId: task.id,
                originalTaskStatus: task.taskStatus || task.status || 'Draft', // Preserve original status
                status: task.taskStatus || task.status || 'Draft', // Current status from taskStatus field
                materials: task.materials.map(m => ({
                    materialId: m.materialId,
                    quantityPerHa: m.quantityPerHa,
                })),
            })),
        };
    });
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

            // Determine if this is an emergency task (new or from protocol)
            const isEmergencyTask = !task.originalTaskId || task.isFromProtocol;
            
            // Emergency tasks use cultivationPlanTaskId from the stage
            // Original tasks use their own originalTaskId (their cultivationPlanTaskId)
            const cultivationPlanTaskId = isEmergencyTask 
                ? (stage.cultivationPlanTaskId || null)
                : (task.originalTaskId || null);
            
            // Emergency tasks get 'Emergency' status, original tasks keep their original status
            const taskStatus = isEmergencyTask ? 'Emergency' : task.status;
            
            baseCultivationTasks.push({
                cultivationPlanTaskId,
                taskName: task.taskName,
                description: task.description,
                taskType: task.taskType,
                scheduledEndDate: task.scheduledEndDate || scheduledEndDate.toISOString(),
                actualStartDate: task.actualStartDate || null,
                actualEndDate: task.actualEndDate || null,
                status: taskStatus,
                executionOrder: task.sequenceOrder,
                isContingency: isEmergencyTask,
                contingencyReason: isEmergencyTask ? resolutionReason : null,
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

