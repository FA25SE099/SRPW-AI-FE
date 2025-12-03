import { useEffect, useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';

import { useProductionPlan } from '../api/get-production-plan';
import { useUpdateProductionPlan } from '../api/update-production-plan';
import { useMaterials } from '@/features/materials/api/get-materials';

type UpdateProductionPlanDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
};

type EditableTask = {
  taskId?: string;
  taskName: string;
  description: string;
  taskType: string;
  scheduledDate: string;
  scheduledEndDate: string;
  priority: string;
  sequenceOrder: number;
  materials: {
    materialId: string;
    quantityPerHa: number;
  }[];
};

type EditableStage = {
  stageId?: string;
  stageName: string;
  sequenceOrder: number;
  description: string;
  expectedDurationDays: number;
  isMandatory: boolean;
  tasks: EditableTask[];
};

type ValidationErrors = {
  planName?: string;
  basePlantingDate?: string;
  stages?: {
    [stageIndex: number]: {
      stageName?: string;
      expectedDurationDays?: string;
      tasks?: {
        [taskIndex: number]: {
          taskName?: string;
          description?: string;
          scheduledDate?: string;
          scheduledEndDate?: string;
        };
      };
    };
  };
};

const TASK_TYPES = [
  'LandPreparation',
  'Fertilization',
  'PestControl',
  'Harvesting',
  'Sowing',
];
const PRIORITIES = ['Low', 'Normal', 'High', 'Critical'];

export const UpdateProductionPlanDialog = ({
  isOpen,
  onClose,
  planId,
}: UpdateProductionPlanDialogProps) => {
  const { addNotification } = useNotifications();

  // Form state
  const [step, setStep] = useState<'edit' | 'preview'>('edit');
  const [planName, setPlanName] = useState('');
  const [basePlantingDate, setBasePlantingDate] = useState('');
  const [stages, setStages] = useState<EditableStage[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Queries
  const { data: planDetail, isLoading: isLoadingPlan } = useProductionPlan({
    planId,
    queryConfig: {
      enabled: isOpen && !!planId,
    },
  });

  const fertilizersQuery = useMaterials({
    params: {
      currentPage: 1,
      pageSize: 1000,
      type: 0,
    },
  });
  const pesticidesQuery = useMaterials({
    params: {
      currentPage: 1,
      pageSize: 1000,
      type: 1,
    },
  });

  const updateMutation = useUpdateProductionPlan({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Production plan updated successfully',
        });
        handleClose();
      },
      onError: (error: any) => {
        console.error('Update production plan error:', error);
        const errorMessage =
          error.errors?.join('\n') ||
          error.message ||
          'Failed to update production plan';
        addNotification({
          type: 'error',
          title: 'Error',
          message: errorMessage,
        });
      },
    },
  });

  // Load data when plan details are available
  useEffect(() => {
    if (planDetail && isOpen) {
      setPlanName(planDetail.planName);
      const date = new Date(planDetail.basePlantingDate);
      const formattedDate = date.toISOString().slice(0, 16);
      setBasePlantingDate(formattedDate);

      const mappedStages: EditableStage[] = planDetail.stages.map((stage) => ({
        stageId: stage.stageId,
        stageName: stage.stageName,
        sequenceOrder: stage.sequenceOrder,
        description: stage.notes || '',
        expectedDurationDays: stage.expectedDurationDays || 7,
        isMandatory: false,
        tasks: stage.tasks.map((task) => ({
          taskId: task.taskId,
          taskName: task.taskName,
          description: task.description,
          taskType: task.taskType,
          scheduledDate: task.scheduledEndDate
            ? new Date(task.scheduledEndDate).toISOString().slice(0, 16)
            : '',
          scheduledEndDate: task.scheduledEndDate
            ? new Date(task.scheduledEndDate).toISOString().slice(0, 16)
            : '',
          priority: task.priority,
          sequenceOrder: task.sequenceOrder,
          materials: task.materials.map((m) => ({
            materialId: m.materialId,
            quantityPerHa: m.quantityPerHa,
          })),
        })),
      }));
      setStages(mappedStages);
      setStep('edit');
      setErrors({});
    }
  }, [planDetail, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate plan name
    if (!planName || !planName.trim()) {
      newErrors.planName = 'Plan name is required';
    }

    // Validate base planting date
    if (!basePlantingDate) {
      newErrors.basePlantingDate = 'Base planting date is required';
    }

    // Validate stages
    if (stages.length === 0) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please add at least one stage',
      });
      return false;
    }

    newErrors.stages = {};

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const stageErrors: any = {};

      // Validate stage name
      if (!stage.stageName || !stage.stageName.trim()) {
        stageErrors.stageName = 'Stage name is required';
      }

      // Validate typical duration
      if (!stage.expectedDurationDays || stage.expectedDurationDays <= 0) {
        stageErrors.expectedDurationDays = 'Duration must be greater than 0';
      }

      // Validate tasks
      if (stage.tasks.length === 0) {
        addNotification({
          type: 'error',
          title: 'Validation Error',
          message: `Stage "${stage.stageName || `#${i + 1}`}" must have at least one task`,
        });
        return false;
      }

      stageErrors.tasks = {};

      for (let j = 0; j < stage.tasks.length; j++) {
        const task = stage.tasks[j];
        const taskErrors: any = {};

        // Validate task name
        if (!task.taskName || !task.taskName.trim()) {
          taskErrors.taskName = 'Task name is required';
        }

        // Validate description
        if (!task.description || !task.description.trim()) {
          taskErrors.description = 'Description is required';
        }

        // Validate scheduled date
        if (!task.scheduledDate) {
          taskErrors.scheduledDate = 'Start date is required';
        }

        // Only validate end date if BOTH dates are set AND end date is not empty
        if (task.scheduledDate && task.scheduledEndDate && task.scheduledEndDate.trim() !== '') {
          const startDate = new Date(task.scheduledDate);
          const endDate = new Date(task.scheduledEndDate);
          if (endDate <= startDate) {
            taskErrors.scheduledEndDate = 'End date must be after start date';
          }
        }
        // If end date is empty or not set, no validation error

        if (Object.keys(taskErrors).length > 0) {
          stageErrors.tasks[j] = taskErrors;
        }
      }

      if (Object.keys(stageErrors).length > 0) {
        newErrors.stages[i] = stageErrors;
      }
    }

    setErrors(newErrors);

    // Check if there are any errors - need to check if stages object has actual errors
    const hasStageErrors = newErrors.stages && Object.keys(newErrors.stages).some(
      stageIndex => {
        const stageError = newErrors.stages![parseInt(stageIndex)];
        return stageError.stageName ||
          stageError.expectedDurationDays ||
          (stageError.tasks && Object.keys(stageError.tasks).length > 0);
      }
    );

    const hasErrors =
      newErrors.planName ||
      newErrors.basePlantingDate ||
      hasStageErrors;

    if (hasErrors) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix all validation errors before proceeding',
      });
    }

    return !hasErrors;
  };

  const handleClose = () => {
    setPlanName('');
    setBasePlantingDate('');
    setStages([]);
    setStep('edit');
    setErrors({});
    onClose();
  };

  const handleToPreview = () => {
    if (!validateForm()) {
      return;
    }
    setStep('preview');
  };

  const handleSubmit = () => {
    const cleanedStages = stages.map((stage) => ({
      stageId: stage.stageId,
      stageName: stage.stageName.trim(),
      sequenceOrder: stage.sequenceOrder,
      expectedDurationDays: stage.expectedDurationDays,
      isMandatory: stage.isMandatory,
      notes:
        stage.description && stage.description.trim()
          ? stage.description.trim()
          : undefined,
      tasks: stage.tasks.map((task) => ({
        taskId: task.taskId,
        taskName: task.taskName.trim(),
        description: task.description.trim(),
        daysAfter: 0,
        durationDays: 1,
        taskType: task.taskType,
        scheduledDate: task.scheduledDate ? new Date(task.scheduledDate).toISOString() : undefined,
        scheduledEndDate: task.scheduledEndDate
          ? new Date(task.scheduledEndDate).toISOString()
          : undefined,
        priority: task.priority,
        sequenceOrder: task.sequenceOrder,
        materials: task.materials.filter(
          (m) => m.materialId && m.quantityPerHa > 0,
        ),
      })),
    }));

    const payload = {
      planId,
      planName: planName.trim(),
      basePlantingDate: new Date(basePlantingDate).toISOString(),
      stages: cleanedStages,
      expertId:
        planDetail?.approvedBy || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    };

    console.log('Sending update payload:', JSON.stringify(payload, null, 2));
    updateMutation.mutate(payload);
  };

  const handleAddStage = () => {
    setStages([
      ...stages,
      {
        stageName: '',
        sequenceOrder: stages.length,
        description: '',
        expectedDurationDays: 7,
        isMandatory: true,
        tasks: [],
      },
    ]);
  };

  const handleInsertStage = (position: number) => {
    const newStage: EditableStage = {
      stageName: '',
      sequenceOrder: position,
      description: '',
      expectedDurationDays: 7,
      isMandatory: true,
      tasks: [],
    };

    const newStages = [...stages];
    newStages.splice(position, 0, newStage);
    newStages.forEach((stage, idx) => {
      stage.sequenceOrder = idx;
    });

    setStages(newStages);
  };

  const handleRemoveStage = (index: number) => {
    const newStages = stages.filter((_, i) => i !== index);
    newStages.forEach((stage, i) => {
      stage.sequenceOrder = i;
    });
    setStages(newStages);

    // Clear errors for removed stage
    const newErrors = { ...errors };
    if (newErrors.stages && newErrors.stages[index]) {
      delete newErrors.stages[index];
    }
    setErrors(newErrors);
  };

  const handleUpdateStage = (
    index: number,
    updates: Partial<EditableStage>,
  ) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], ...updates };
    setStages(newStages);

    // Clear related errors when field is updated
    const newErrors = { ...errors };
    if (newErrors.stages && newErrors.stages[index]) {
      if (updates.stageName !== undefined) {
        delete newErrors.stages[index].stageName;
      }
      if (updates.expectedDurationDays !== undefined) {
        delete newErrors.stages[index].expectedDurationDays;
      }
    }
    setErrors(newErrors);
  };

  const handleMoveTaskLeft = (stageIndex: number, taskIndex: number) => {
    if (taskIndex === 0) return;

    const newStages = [...stages];
    const stage = newStages[stageIndex];
    const tasks = [...stage.tasks];

    [tasks[taskIndex - 1], tasks[taskIndex]] = [tasks[taskIndex], tasks[taskIndex - 1]];

    tasks.forEach((task, i) => {
      task.sequenceOrder = i;
    });

    stage.tasks = tasks;
    setStages(newStages);
  };

  const handleMoveTaskRight = (stageIndex: number, taskIndex: number) => {
    const newStages = [...stages];
    const stage = newStages[stageIndex];

    if (taskIndex === stage.tasks.length - 1) return;

    const tasks = [...stage.tasks];

    [tasks[taskIndex], tasks[taskIndex + 1]] = [tasks[taskIndex + 1], tasks[taskIndex]];

    tasks.forEach((task, i) => {
      task.sequenceOrder = i;
    });

    stage.tasks = tasks;
    setStages(newStages);
  };

  const handleAddTask = (stageIndex: number) => {
    const newStages = [...stages];
    const stage = newStages[stageIndex];

    // Calculate default scheduled dates
    const baseDate = basePlantingDate ? new Date(basePlantingDate) : new Date();
    const scheduledDate = new Date(baseDate);
    scheduledDate.setDate(baseDate.getDate() + stage.tasks.length * 7);

    stage.tasks.push({
      taskName: '',
      description: '',
      taskType: 'LandPreparation',
      scheduledDate: scheduledDate.toISOString().slice(0, 16),
      scheduledEndDate: '', // Set to empty string (null)
      priority: 'Normal',
      sequenceOrder: stage.tasks.length,
      materials: [],
    });
    setStages(newStages);
  };

  const handleInsertTask = (stageIndex: number, position: number) => {
    const newStages = [...stages];
    const stage = newStages[stageIndex];

    const baseDate = basePlantingDate ? new Date(basePlantingDate) : new Date();
    const scheduledDate = new Date(baseDate);
    scheduledDate.setDate(baseDate.getDate() + position * 7);

    const newTask: EditableTask = {
      taskName: '',
      description: '',
      taskType: 'LandPreparation',
      scheduledDate: scheduledDate.toISOString().slice(0, 16),
      scheduledEndDate: '', // Set to empty string (null)
      priority: 'Normal',
      sequenceOrder: position,
      materials: [],
    };

    stage.tasks.splice(position, 0, newTask);
    stage.tasks.forEach((task, i) => {
      task.sequenceOrder = i;
    });

    setStages(newStages);
  };

  const handleRemoveTask = (stageIndex: number, taskIndex: number) => {
    const newStages = [...stages];
    const stage = newStages[stageIndex];
    stage.tasks = stage.tasks.filter((_, i) => i !== taskIndex);
    stage.tasks.forEach((task, i) => {
      task.sequenceOrder = i;
    });
    setStages(newStages);

    // Clear errors for removed task
    const newErrors = { ...errors };
    if (newErrors.stages?.[stageIndex]?.tasks?.[taskIndex]) {
      const stageErrors = newErrors.stages[stageIndex];
      if (stageErrors?.tasks?.[taskIndex]) {
        delete stageErrors.tasks[taskIndex];
      }
    }
    setErrors(newErrors);
  };

  const handleUpdateTask = (
    stageIndex: number,
    taskIndex: number,
    updates: Partial<EditableTask>,
  ) => {
    const newStages = [...stages];
    newStages[stageIndex].tasks[taskIndex] = {
      ...newStages[stageIndex].tasks[taskIndex],
      ...updates,
    };
    setStages(newStages);

    // Clear related errors when field is updated
    const newErrors = { ...errors };
    const stageErrors = newErrors.stages?.[stageIndex];
    if (stageErrors?.tasks?.[taskIndex]) {
      const taskErrors = stageErrors.tasks[taskIndex];
      if (updates.taskName !== undefined) {
        delete taskErrors.taskName;
      }
      if (updates.description !== undefined) {
        delete taskErrors.description;
      }
      if (updates.scheduledDate !== undefined) {
        delete taskErrors.scheduledDate;
      }
      if (updates.scheduledEndDate !== undefined) {
        delete taskErrors.scheduledEndDate;
      }
    }
    setErrors(newErrors);
  };

  const handleAddMaterial = (stageIndex: number, taskIndex: number) => {
    const newStages = [...stages];
    const task = newStages[stageIndex].tasks[taskIndex];
    task.materials.push({
      materialId: '',
      quantityPerHa: 0,
    });
    setStages(newStages);
  };

  const handleRemoveMaterial = (
    stageIndex: number,
    taskIndex: number,
    materialIndex: number,
  ) => {
    const newStages = [...stages];
    const task = newStages[stageIndex].tasks[taskIndex];
    task.materials = task.materials.filter((_, i) => i !== materialIndex);
    setStages(newStages);
  };

  const handleUpdateMaterial = (
    stageIndex: number,
    taskIndex: number,
    materialIndex: number,
    field: 'materialId' | 'quantityPerHa',
    value: string | number,
  ) => {
    const newStages = [...stages];
    const material =
      newStages[stageIndex].tasks[taskIndex].materials[materialIndex];
    if (field === 'materialId') {
      material.materialId = value as string;
    } else {
      material.quantityPerHa = value as number;
    }
    setStages(newStages);
  };

  const fertilizers = fertilizersQuery.data?.data || [];
  const pesticides = pesticidesQuery.data?.data || [];
  const materials = [...fertilizers, ...pesticides];
  const isLoading =
    updateMutation.isPending ||
    isLoadingPlan ||
    fertilizersQuery.isLoading ||
    pesticidesQuery.isLoading;

  return (
    <div className={isOpen ? 'fixed inset-0 z-50 overflow-y-auto' : 'hidden'}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

        <div className="relative z-10 w-[90vw] max-w-[1600px] rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-lg font-bold text-gray-900">
              Update Production Plan
            </h2>
            <button
              onClick={handleClose}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <span className="text-lg">✕</span>
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[75vh] space-y-5 overflow-y-auto p-5">
            {isLoadingPlan && (
              <div className="flex items-center justify-center p-8">
                <Spinner size="lg" />
              </div>
            )}

            {!isLoadingPlan && (
              <>
                {step === 'edit' && (
                  <>
                    {/* Basic Information */}
                    <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
                      <h3 className="text-sm font-bold text-gray-900">
                        Basic Information
                      </h3>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-gray-700">
                            Plan Name *
                          </label>
                          <input
                            type="text"
                            value={planName}
                            onChange={(e) => {
                              setPlanName(e.target.value);
                              if (errors.planName) {
                                const newErrors = { ...errors };
                                delete newErrors.planName;
                                setErrors(newErrors);
                              }
                            }}
                            disabled={isLoading}
                            className={`block w-full rounded-md border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 disabled:bg-gray-100 ${errors.planName
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                              }`}
                            placeholder="e.g., Winter-Spring Rice 2025"
                          />
                          {errors.planName && (
                            <p className="text-xs text-red-600">{errors.planName}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-gray-700">
                            Base Planting Date *
                          </label>
                          <input
                            type="datetime-local"
                            value={basePlantingDate}
                            onChange={(e) => {
                              setBasePlantingDate(e.target.value);
                              if (errors.basePlantingDate) {
                                const newErrors = { ...errors };
                                delete newErrors.basePlantingDate;
                                setErrors(newErrors);
                              }
                            }}
                            disabled={isLoading}
                            className={`block w-full rounded-md border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 disabled:bg-gray-100 ${errors.basePlantingDate
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                              }`}
                          />
                          {errors.basePlantingDate && (
                            <p className="text-xs text-red-600">{errors.basePlantingDate}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stages Section */}
                    <div className="space-y-3 rounded-lg border bg-white p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900">
                          Cultivation Stages & Tasks
                        </h3>
                        <Button
                          size="sm"
                          onClick={handleAddStage}
                          disabled={isLoading}
                          icon={<Plus className="size-3.5" />}
                        >
                          Add Stage
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {stages.map((stage, stageIndex) => {
                          const stageErrors = errors.stages?.[stageIndex];

                          return (
                            <div key={stageIndex} className="relative">
                              {/* Add stage before button */}
                              {stageIndex === 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleInsertStage(0)}
                                  disabled={isLoading}
                                  className="absolute -top-3 left-1/2 z-10 flex size-6 -translate-x-1/2 items-center justify-center rounded-full bg-green-500 text-white shadow-md transition-colors hover:bg-green-600"
                                  title="Add stage before"
                                >
                                  <Plus className="size-3.5" />
                                </button>
                              )}

                              <div className="rounded-lg border-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 p-3 shadow-sm">
                                {/* Stage Header */}
                                <div className="mb-3 flex items-start gap-2">
                                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                                    {stageIndex + 1}
                                  </div>
                                  <div className="flex-1 space-y-2">
                                    <div className="grid grid-cols-12 gap-2">
                                      <div className="col-span-5 space-y-1">
                                        <input
                                          type="text"
                                          value={stage.stageName}
                                          onChange={(e) =>
                                            handleUpdateStage(stageIndex, {
                                              stageName: e.target.value,
                                            })
                                          }
                                          disabled={isLoading}
                                          placeholder="e.g., Land Preparation, Planting"
                                          className={`block w-full rounded-md border bg-white px-2.5 py-1 text-sm font-medium focus:outline-none focus:ring-1 ${stageErrors?.stageName
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                            }`}
                                        />
                                        {stageErrors?.stageName && (
                                          <p className="text-xs text-red-600">{stageErrors.stageName}</p>
                                        )}
                                      </div>
                                      <div className="col-span-2 space-y-1">
                                        <div className="relative">
                                          <input
                                            type="number"
                                            value={stage.expectedDurationDays}
                                            onChange={(e) =>
                                              handleUpdateStage(stageIndex, {
                                                expectedDurationDays: parseInt(e.target.value) || 0,
                                              })
                                            }
                                            disabled={isLoading}
                                            min="1"
                                            placeholder="0"
                                            className={`block w-full rounded-md border bg-white pl-2.5 pr-12 py-1 text-sm focus:outline-none focus:ring-1 ${stageErrors?.expectedDurationDays
                                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                              }`}
                                          />
                                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span className="text-gray-500 sm:text-sm">
                                              {stage.expectedDurationDays === 1 ? 'day' : 'days'}
                                            </span>
                                          </div>
                                        </div>
                                        {stageErrors?.expectedDurationDays && (
                                          <p className="text-xs text-red-600">{stageErrors.expectedDurationDays}</p>
                                        )}
                                      </div>
                                    </div>
                                    <input
                                      type="text"
                                      value={stage.description || ''}
                                      onChange={(e) =>
                                        handleUpdateStage(stageIndex, {
                                          description: e.target.value,
                                        })
                                      }
                                      disabled={isLoading}
                                      placeholder="Stage notes"
                                      className="block w-full rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs italic text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                    />
                                  </div>
                                  {stages.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveStage(stageIndex)}
                                      disabled={isLoading}
                                      className="p-1 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="size-4" />
                                    </button>
                                  )}
                                </div>

                                {/* Tasks Grid */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between rounded-md bg-blue-50 px-2.5 py-1.5">
                                    <span className="text-xs font-semibold text-blue-900">
                                      Tasks ({stage.tasks.length})
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleAddTask(stageIndex)}
                                      disabled={isLoading}
                                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                                    >
                                      <Plus className="size-3" />
                                      Add Task
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2.5">
                                    {stage.tasks.map((task, taskIndex) => {
                                      const taskErrors = stageErrors?.tasks?.[taskIndex];

                                      return (
                                        <div key={taskIndex} className="relative">
                                          {/* Add task before button */}
                                          {taskIndex === 0 && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleInsertTask(stageIndex, 0)
                                              }
                                              disabled={isLoading}
                                              className="absolute -left-3 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-blue-500 text-white shadow-md transition-colors hover:bg-blue-600"
                                              title="Add task before"
                                            >
                                              <Plus className="size-3" />
                                            </button>
                                          )}

                                          <div className={`flex flex-col rounded-md border-2 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md ${taskErrors ? 'border-red-300' : 'border-blue-200'
                                            }`}>
                                            <div className="mb-2 flex items-start justify-between">
                                              <div className="flex items-center gap-1">
                                                <span className="inline-flex size-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                                                  {taskIndex + 1}
                                                </span>
                                                <div className="flex gap-0.5">
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleMoveTaskLeft(stageIndex, taskIndex)
                                                    }
                                                    disabled={isLoading || taskIndex === 0}
                                                    className="rounded p-0.5 text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Move task left"
                                                  >
                                                    <ChevronLeft className="size-3" />
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleMoveTaskRight(stageIndex, taskIndex)
                                                    }
                                                    disabled={
                                                      isLoading ||
                                                      taskIndex === stage.tasks.length - 1
                                                    }
                                                    className="rounded p-0.5 text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Move task right"
                                                  >
                                                    <ChevronRight className="size-3" />
                                                  </button>
                                                </div>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleRemoveTask(stageIndex, taskIndex)
                                                }
                                                disabled={isLoading}
                                                className="text-red-600 hover:text-red-700"
                                              >
                                                <Trash2 className="size-3.5" />
                                              </button>
                                            </div>

                                            <div className="flex-1 space-y-2">
                                              <div className="space-y-1">
                                                <input
                                                  type="text"
                                                  value={task.taskName}
                                                  onChange={(e) =>
                                                    handleUpdateTask(stageIndex, taskIndex, {
                                                      taskName: e.target.value,
                                                    })
                                                  }
                                                  disabled={isLoading}
                                                  placeholder="Task name"
                                                  className={`block w-full rounded-md border bg-white px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 ${taskErrors?.taskName
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                    }`}
                                                />
                                                {taskErrors?.taskName && (
                                                  <p className="text-[10px] text-red-600">{taskErrors.taskName}</p>
                                                )}
                                              </div>

                                              <div className="space-y-1">
                                                <textarea
                                                  value={task.description}
                                                  onChange={(e) =>
                                                    handleUpdateTask(stageIndex, taskIndex, {
                                                      description: e.target.value,
                                                    })
                                                  }
                                                  disabled={isLoading}
                                                  placeholder="Description"
                                                  rows={2}
                                                  className={`block w-full rounded-md border bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 ${taskErrors?.description
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                    }`}
                                                />
                                                {taskErrors?.description && (
                                                  <p className="text-[10px] text-red-600">{taskErrors.description}</p>
                                                )}
                                              </div>

                                              <div className="grid grid-cols-2 gap-1.5">
                                                <div className="space-y-0.5">
                                                  <label className="block text-[10px] font-medium text-gray-600">
                                                    Start Date *
                                                  </label>
                                                  <div className="space-y-1">
                                                    <input
                                                      type="datetime-local"
                                                      value={task.scheduledDate}
                                                      onChange={(e) =>
                                                        handleUpdateTask(stageIndex, taskIndex, {
                                                          scheduledDate: e.target.value,
                                                        })
                                                      }
                                                      disabled={isLoading}
                                                      className={`block w-full rounded-md border bg-white px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 ${taskErrors?.scheduledDate
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                        }`}
                                                    />
                                                    {taskErrors?.scheduledDate && (
                                                      <p className="text-[10px] text-red-600">{taskErrors.scheduledDate}</p>
                                                    )}
                                                  </div>
                                                </div>
                                                <div className="space-y-0.5">
                                                  <label className="block text-[10px] font-medium text-gray-600">
                                                    End Date
                                                  </label>
                                                  <div className="space-y-1">
                                                    <input
                                                      type="datetime-local"
                                                      value={task.scheduledEndDate}
                                                      onChange={(e) =>
                                                        handleUpdateTask(stageIndex, taskIndex, {
                                                          scheduledEndDate: e.target.value,
                                                        })
                                                      }
                                                      disabled={isLoading}
                                                      className={`block w-full rounded-md border bg-white px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 ${taskErrors?.scheduledEndDate
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                                        }`}
                                                    />
                                                    {taskErrors?.scheduledEndDate && (
                                                      <p className="text-[10px] text-red-600">{taskErrors.scheduledEndDate}</p>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>

                                              <div className="space-y-0.5">
                                                <label className="block text-[10px] font-medium text-gray-600">
                                                  Task Type
                                                </label>
                                                <select
                                                  value={task.taskType}
                                                  onChange={(e) =>
                                                    handleUpdateTask(stageIndex, taskIndex, {
                                                      taskType: e.target.value,
                                                    })
                                                  }
                                                  disabled={isLoading}
                                                  className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                                >
                                                  <option value="LandPreparation">
                                                    Land Preparation
                                                  </option>
                                                  <option value="Fertilization">
                                                    Fertilization
                                                  </option>
                                                  <option value="PestControl">
                                                    Pest Control
                                                  </option>
                                                  <option value="Harvesting">
                                                    Harvesting
                                                  </option>
                                                  <option value="Sowing">Sowing</option>
                                                </select>
                                              </div>

                                              <div className="space-y-0.5">
                                                <label className="block text-[10px] font-medium text-gray-600">
                                                  Priority
                                                </label>
                                                <select
                                                  value={task.priority}
                                                  onChange={(e) =>
                                                    handleUpdateTask(stageIndex, taskIndex, {
                                                      priority: e.target.value,
                                                    })
                                                  }
                                                  disabled={isLoading}
                                                  className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                                >
                                                  {PRIORITIES.map((priority) => (
                                                    <option key={priority} value={priority}>
                                                      {priority}
                                                    </option>
                                                  ))}
                                                </select>
                                              </div>

                                              {/* Materials */}
                                              <div className="space-y-1.5 rounded-md border border-gray-200 bg-gray-50 p-1.5">
                                                <div className="flex items-center justify-between">
                                                  <span className="text-[10px] font-semibold text-gray-700">
                                                    Materials
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleAddMaterial(stageIndex, taskIndex)
                                                    }
                                                    disabled={isLoading}
                                                    className="text-[10px] font-medium text-blue-600 underline hover:text-blue-700"
                                                  >
                                                    + Add
                                                  </button>
                                                </div>
                                                {task.materials.map((material, materialIndex) => (
                                                  <div
                                                    key={materialIndex}
                                                    className="space-y-1 rounded-md border border-gray-200 bg-white p-1.5"
                                                  >
                                                    <select
                                                      value={material.materialId}
                                                      onChange={(e) =>
                                                        handleUpdateMaterial(
                                                          stageIndex,
                                                          taskIndex,
                                                          materialIndex,
                                                          'materialId',
                                                          e.target.value,
                                                        )
                                                      }
                                                      disabled={
                                                        isLoading ||
                                                        fertilizersQuery.isLoading ||
                                                        pesticidesQuery.isLoading
                                                      }
                                                      className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
                                                    >
                                                      <option value="">
                                                        Select material...
                                                      </option>
                                                      {fertilizersQuery.isLoading ||
                                                        pesticidesQuery.isLoading ? (
                                                        <option disabled>Loading...</option>
                                                      ) : (
                                                        <>
                                                          {fertilizers.length > 0 && (
                                                            <optgroup label="Fertilizers">
                                                              {fertilizers.map((mat) => (
                                                                <option
                                                                  key={mat.materialId}
                                                                  value={mat.materialId}
                                                                >
                                                                  {mat.name} ({mat.unit})
                                                                </option>
                                                              ))}
                                                            </optgroup>
                                                          )}
                                                          {pesticides.length > 0 && (
                                                            <optgroup label="Pesticides">
                                                              {pesticides.map((mat) => (
                                                                <option
                                                                  key={mat.materialId}
                                                                  value={mat.materialId}
                                                                >
                                                                  {mat.name} ({mat.unit})
                                                                </option>
                                                              ))}
                                                            </optgroup>
                                                          )}
                                                        </>
                                                      )}
                                                    </select>
                                                    <div className="flex items-center gap-1">
                                                      <input
                                                        type="number"
                                                        value={material.quantityPerHa}
                                                        onChange={(e) =>
                                                          handleUpdateMaterial(
                                                            stageIndex,
                                                            taskIndex,
                                                            materialIndex,
                                                            'quantityPerHa',
                                                            parseFloat(e.target.value) || 0,
                                                          )
                                                        }
                                                        disabled={isLoading}
                                                        min="0"
                                                        step="0.1"
                                                        placeholder="Qty/ha"
                                                        className="flex-1 rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                                      />
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          handleRemoveMaterial(
                                                            stageIndex,
                                                            taskIndex,
                                                            materialIndex,
                                                          )
                                                        }
                                                        disabled={isLoading}
                                                        className="rounded p-0.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                      >
                                                        <Trash2 className="size-3" />
                                                      </button>
                                                    </div>
                                                  </div>
                                                ))}
                                                {task.materials.length === 0 && (
                                                  <p className="py-0.5 text-center text-[10px] italic text-gray-500">
                                                    No materials
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Add task after button */}
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleInsertTask(stageIndex, taskIndex + 1)
                                            }
                                            disabled={isLoading}
                                            className="absolute -right-3 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-blue-500 text-white shadow-md transition-colors hover:bg-blue-600"
                                            title="Add task after"
                                          >
                                            <Plus className="size-3" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {stage.tasks.length === 0 && (
                                    <p className="rounded-md bg-gray-50 py-4 text-center text-xs italic text-gray-500">
                                      No tasks. Click "Add Task" to create one.
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Add stage after button */}
                              <button
                                type="button"
                                onClick={() => handleInsertStage(stageIndex + 1)}
                                disabled={isLoading}
                                className="absolute -bottom-3 left-1/2 z-10 flex size-6 -translate-x-1/2 items-center justify-center rounded-full bg-green-500 text-white shadow-md transition-colors hover:bg-green-600"
                                title="Add stage after"
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {step === 'preview' && (
                  <div className="space-y-5">
                    <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
                      <h3 className="text-sm font-bold text-gray-900">
                        Review Plan Details
                      </h3>

                      <div className="grid grid-cols-2 gap-4 rounded bg-white p-3">
                        <div>
                          <span className="text-xs font-medium text-gray-600">
                            Plan Name:
                          </span>
                          <div className="text-sm">{planName}</div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-600">
                            Base Planting Date:
                          </span>
                          <div className="text-sm">
                            {new Date(basePlantingDate).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 rounded-lg border bg-white p-4">
                      <h3 className="text-sm font-bold text-gray-900">
                        Stages & Tasks
                      </h3>

                      <div className="space-y-3">
                        {stages.map((stage, stageIndex) => (
                          <div
                            key={stageIndex}
                            className="rounded border bg-gray-50 p-3"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <div>
                                <span className="font-medium">
                                  {stageIndex + 1}. {stage.stageName}
                                </span>
                                <span className="ml-2 text-xs text-gray-600">
                                  ({stage.expectedDurationDays} days)
                                </span>
                              </div>
                            </div>

                            {stage.description && (
                              <div className="mb-2 text-xs text-gray-600">
                                Notes: {stage.description}
                              </div>
                            )}

                            <div className="space-y-2">
                              {stage.tasks.map((task, taskIndex) => (
                                <div
                                  key={taskIndex}
                                  className="rounded border bg-white p-2"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">
                                        {taskIndex + 1}. {task.taskName}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        {task.taskType} • {task.priority}
                                      </div>
                                      <div className="mt-1 text-xs text-gray-700">
                                        {task.description}
                                      </div>
                                      <div className="mt-1 text-xs text-gray-600">
                                        Start: {new Date(task.scheduledDate).toLocaleString()}
                                        {task.scheduledEndDate && (
                                          <> • End: {new Date(task.scheduledEndDate).toLocaleString()}</>
                                        )}
                                      </div>

                                      {task.materials.length > 0 && (
                                        <div className="mt-2">
                                          <div className="text-xs font-medium">
                                            Materials:
                                          </div>
                                          <div className="mt-1 space-y-1">
                                            {task.materials.map((material, idx) => {
                                              const mat = materials.find(
                                                (m) => m.materialId === material.materialId,
                                              );
                                              return (
                                                <div
                                                  key={idx}
                                                  className="text-xs text-gray-600 pl-3"
                                                >
                                                  • {mat?.name || 'Unknown'} - {material.quantityPerHa} {mat?.unit || ''}/ha
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t px-5 py-4">
            {step === 'edit' && (
              <>
                <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleToPreview}
                  isLoading={isLoading}
                >
                  Review Plan
                </Button>
              </>
            )}
            {step === 'preview' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setStep('edit')}
                  disabled={isLoading}
                >
                  Back to Edit
                </Button>
                <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  isLoading={updateMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Changes
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
