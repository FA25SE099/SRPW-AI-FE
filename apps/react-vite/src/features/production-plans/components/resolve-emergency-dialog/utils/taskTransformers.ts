import { EditableStage } from '../types';
import { ProductionPlanDetail } from '@/features/production-plans/types';
import { calculateDaysAfter, calculateDuration } from './taskCalculations';

export const convertPlanToEditableStages = (planDetails: ProductionPlanDetail): EditableStage[] => {
    return planDetails.stages.map(stage => {
        // Get the first task's ID to use as cultivationPlanTaskId for emergency tasks
        const cultivationPlanTaskId = stage.tasks.length > 0 ? stage.tasks[0].id : undefined;
        
        return {
            stageName: stage.stageName,
            sequenceOrder: stage.sequenceOrder,
            cultivationPlanTaskId, // Store for emergency tasks to use
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
                    status: task.taskStatus || 'Draft', // Preserve task status from taskStatus field
                    materials: task.materials.map(m => ({
                        materialId: m.materialId,
                        quantityPerHa: m.quantityPerHa,
                    })),
                };
            }),
        };
    });
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

            // Determine if this is an emergency task (new or from protocol)
            const isEmergencyTask = !task.originalTaskId || task.isFromProtocol;
            
            // Emergency tasks use cultivationPlanTaskId from the stage
            // Original tasks use their originalTaskId
            const productionPlanTaskId = isEmergencyTask 
                ? (stage.cultivationPlanTaskId || null)
                : (task.originalTaskId || null);
            
            // Emergency tasks get 'Emergency' status, original tasks keep their status
            const taskStatus = isEmergencyTask ? 'Emergency' : task.status;

            baseCultivationTasks.push({
                productionPlanTaskId,
                taskName: task.taskName,
                description: task.description,
                taskType: task.taskType,
                scheduledEndDate: scheduledEndDate.toISOString(),
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

