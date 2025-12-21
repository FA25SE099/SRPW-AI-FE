import { useCallback } from 'react';
import { EditableStage, EditableTask } from '../types';

export const useTaskManagement = (
    editableStages: EditableStage[],
    setEditableStages: (stages: EditableStage[]) => void,
    validationErrors: { [key: string]: boolean },
    setValidationErrors: (errors: { [key: string]: boolean }) => void
) => {
    const handleUpdateTask = useCallback((stageIndex: number, taskIndex: number, updates: Partial<EditableTask>) => {
        const newStages = [...editableStages];
        newStages[stageIndex].tasks[taskIndex] = {
            ...newStages[stageIndex].tasks[taskIndex],
            ...updates,
        };
        setEditableStages(newStages);

        // Clear validation error if task name is updated
        if (updates.taskName) {
            const taskKey = `stage-${stageIndex}-task-${taskIndex}`;
            const newValidationErrors = { ...validationErrors };
            delete newValidationErrors[taskKey];
            setValidationErrors(newValidationErrors);
        }
    }, [editableStages, setEditableStages, validationErrors, setValidationErrors]);

    const handleRemoveTask = useCallback((stageIndex: number, taskIndex: number) => {
        const newStages = [...editableStages];
        newStages[stageIndex].tasks.splice(taskIndex, 1);
        newStages[stageIndex].tasks.forEach((task, idx) => {
            task.sequenceOrder = idx;
        });
        setEditableStages(newStages);
    }, [editableStages, setEditableStages]);

    const handleMoveTask = useCallback((stageIndex: number, taskIndex: number, direction: 'up' | 'down') => {
        const newStages = [...editableStages];
        const tasks = newStages[stageIndex].tasks;
        const newIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;

        if (newIndex < 0 || newIndex >= tasks.length) return;

        [tasks[taskIndex], tasks[newIndex]] = [tasks[newIndex], tasks[taskIndex]];
        tasks.forEach((task, idx) => {
            task.sequenceOrder = idx;
        });

        setEditableStages(newStages);
    }, [editableStages, setEditableStages]);

    const handleUpdateMaterial = useCallback((
        stageIndex: number,
        taskIndex: number,
        materialIndex: number,
        field: 'materialId' | 'quantityPerHa',
        value: string | number
    ) => {
        const newStages = [...editableStages];
        const material = newStages[stageIndex].tasks[taskIndex].materials[materialIndex];
        if (field === 'materialId') {
            material.materialId = value as string;
        } else {
            material.quantityPerHa = value as number;
        }
        setEditableStages(newStages);
    }, [editableStages, setEditableStages]);

    const handleRemoveMaterial = useCallback((stageIndex: number, taskIndex: number, materialIndex: number) => {
        const newStages = [...editableStages];
        newStages[stageIndex].tasks[taskIndex].materials.splice(materialIndex, 1);
        setEditableStages(newStages);
    }, [editableStages, setEditableStages]);

    const handleAddMaterial = useCallback((stageIndex: number, taskIndex: number) => {
        const newStages = [...editableStages];
        newStages[stageIndex].tasks[taskIndex].materials.push({
            materialId: '',
            quantityPerHa: 0,
        });
        setEditableStages(newStages);
    }, [editableStages, setEditableStages]);

    const handleAddNewTask = useCallback((stageIndex: number, position: number) => {
        const newStages = [...editableStages];
        const newTask: EditableTask = {
            taskName: '',
            description: '',
            taskType: 'LandPreparation',
            daysAfter: 0,
            durationDays: 1,
            priority: 'Normal',
            sequenceOrder: 0,
            isFromProtocol: false,
            status: 'Emergency', // New tasks get Emergency status
            materials: [],
        };

        newStages[stageIndex].tasks.splice(position, 0, newTask);
        // Update sequence orders
        newStages[stageIndex].tasks.forEach((task, idx) => {
            task.sequenceOrder = idx;
        });
        setEditableStages(newStages);
    }, [editableStages, setEditableStages]);

    const handleAddTaskFromProtocol = useCallback((
        protocolDetails: any,
        selectedProtocolTasks: Set<string>,
        addingToStageIndex: number,
        addingToTaskPosition: number
    ) => {
        if (!protocolDetails || addingToStageIndex === null || addingToTaskPosition === null) return;

        const selectedTasks: EditableTask[] = [];
        protocolDetails.stages.forEach((stage: any) => {
            stage.tasks.forEach((task: any) => {
                const taskKey = `${stage.sequenceOrder}-${task.sequenceOrder}`;
                if (selectedProtocolTasks.has(taskKey)) {
                    selectedTasks.push({
                        taskName: task.taskName,
                        description: task.description || '',
                        taskType: task.taskType,
                        daysAfter: task.daysAfter,
                        durationDays: task.durationDays,
                        priority: task.priority,
                        sequenceOrder: 0,
                        isFromProtocol: true,
                        status: 'Emergency', // Protocol tasks get Emergency status
                        materials: task.materials.map((m: any) => ({
                            materialId: m.materialId,
                            quantityPerHa: m.quantityPerHa,
                        })),
                    });
                }
            });
        });

        const newStages = [...editableStages];
        newStages[addingToStageIndex].tasks.splice(addingToTaskPosition, 0, ...selectedTasks);
        newStages[addingToStageIndex].tasks.forEach((task, idx) => {
            task.sequenceOrder = idx;
        });
        setEditableStages(newStages);
    }, [editableStages, setEditableStages]);

    const handleAddOldTask = useCallback((
        originalPlanTasks: any[],
        selectedOldTaskIds: Set<string>,
        addingToStageIndex: number,
        addingToTaskPosition: number
    ) => {
        if (addingToStageIndex === null || addingToTaskPosition === null) return;

        const selectedTasks: EditableTask[] = originalPlanTasks
            .filter(task => {
                const taskId = task.taskId || task.id;
                return taskId && selectedOldTaskIds.has(taskId);
            })
            .map(task => ({
                taskName: task.taskName,
                description: task.description || '',
                taskType: task.taskType,
                daysAfter: task.daysAfter,
                durationDays: task.durationDays,
                priority: task.priority,
                sequenceOrder: 0,
                isFromProtocol: false,
                status: 'Emergency', // Re-added old tasks get Emergency status
                originalTaskId: task.taskId || task.id, // Keep reference to original task
                materials: task.materials.map((m: any) => ({
                    materialId: m.materialId,
                    quantityPerHa: m.quantityPerHa,
                })),
            }));

        const newStages = [...editableStages];
        newStages[addingToStageIndex].tasks.splice(addingToTaskPosition, 0, ...selectedTasks);
        newStages[addingToStageIndex].tasks.forEach((task, idx) => {
            task.sequenceOrder = idx;
        });
        setEditableStages(newStages);
    }, [editableStages, setEditableStages]);

    return {
        handleUpdateTask,
        handleRemoveTask,
        handleMoveTask,
        handleUpdateMaterial,
        handleRemoveMaterial,
        handleAddMaterial,
        handleAddNewTask,
        handleAddTaskFromProtocol,
        handleAddOldTask,
    };
};

