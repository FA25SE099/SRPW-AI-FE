import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SimpleDialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';
import { useProductionPlanDraft } from '../api/get-production-plan-draft';
import { useCreateProductionPlan, CreateProductionPlanDTO } from '../api/create-production-plan';
import { useStandardPlans, useStandardPlan } from '@/features/standard-plans/api/get-standard-plans';
import { useMaterials } from '@/features/materials/api/get-materials';
import { useCalculateGroupMaterialCost, GroupMaterialCostResponse } from '@/features/materials/api/calculate-group-material-cost';
import {
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Package,
  FileText,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

type CreateProductionPlanDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  totalArea: number; // Add this prop
  seasonId?: string;
};

type FormData = {
  standardPlanId: string;
  basePlantingDate: string;
  planName: string;
};

type EditableStage = {
  stageName: string;
  sequenceOrder: number;
  description?: string;
  typicalDurationDays: number;
  colorCode?: string;
  tasks: EditableTask[];
};

type EditableTask = {
  taskName: string;
  description?: string;
  taskType: string;
  daysAfter: number;
  durationDays: number;
  priority: string;
  sequenceOrder: number;
  materials: {
    materialId: string;
    quantityPerHa: number;
  }[];
};

const TASK_TYPES = ['LandPreparation', 'Fertilization', 'PestControl', 'Harvesting', 'Sowing'];
const PRIORITIES = ['Low', 'Normal', 'High', 'Critical'];

export const CreateProductionPlanDialog = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  totalArea,
}: CreateProductionPlanDialogProps) => {
  const [step, setStep] = useState<'select' | 'edit' | 'preview'>('select');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [editableStages, setEditableStages] = useState<EditableStage[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({}); // Add this
  const [groupCostData, setGroupCostData] = useState<GroupMaterialCostResponse | null>(null);
  const { addNotification } = useNotifications();

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormData>();
  const standardPlanId = watch('standardPlanId');
  const basePlantingDate = watch('basePlantingDate');
  const planName = watch('planName'); // Add this line to watch planName

  // Fetch standard plans list
  const standardPlansQuery = useStandardPlans({
    params: { isActive: true },
  });
  const standardPlansData = standardPlansQuery.data;
  const isLoadingPlans = standardPlansQuery.isLoading;

  // Fetch selected standard plan details
  const standardPlanQuery = useStandardPlan({
    standardPlanId: formData?.standardPlanId || '',
    queryConfig: {
      enabled: step === 'edit' && !!formData?.standardPlanId,
    },
  });
  const standardPlanDetails = standardPlanQuery.data;
  const isLoadingDetails = standardPlanQuery.isLoading;

  // Fetch materials
  const fertilizersQuery = useMaterials({
    params: {
      currentPage: 1,
      pageSize: 1000,
      type: 0
    }
  });
  const pesticidesQuery = useMaterials({
    params: {
      currentPage: 1,
      pageSize: 1000,
      type: 1
    }
  });

  const calculateGroupCostMutation = useCalculateGroupMaterialCost();

  const createPlanMutation = useCreateProductionPlan({
    mutationConfig:
    {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Production plan created successfully',
        });
        handleClose();
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Error',
          message: error.message || 'Failed to create production plan',
        });
      },
    },
  });

  const handleSelectPlan = (data: FormData) => {
    setFormData(data);
    setStep('edit');
  };

  // Convert standard plan to editable format when loaded
  useEffect(() => {
    if (standardPlanDetails && step === 'edit' && editableStages.length === 0) {
      const stages: EditableStage[] = standardPlanDetails.stages.map((stage: any) => ({
        stageName: stage.stageName,
        sequenceOrder: stage.sequenceOrder,
        description: stage.description,
        typicalDurationDays: stage.expectedDurationDays || 0,
        colorCode: '#3B82F6',
        tasks: stage.tasks.map((task: any) => ({
          taskName: task.taskName,
          description: task.description,
          taskType: task.taskType,
          daysAfter: task.daysAfter,
          durationDays: task.durationDays || 1,
          priority: task.priority,
          sequenceOrder: task.sequenceOrder,
          materials: task.materials.map((m: any) => ({
            materialId: m.materialId,
            quantityPerHa: m.quantityPerHa,
          })),
        })),
      }));
      setEditableStages(stages);
    }
  }, [standardPlanDetails, step, editableStages.length]);

  const handleToPreview = () => {
    // Validate that all stages have names and all tasks have names
    const errors: string[] = [];
    const newValidationErrors: { [key: string]: boolean } = {};

    editableStages.forEach((stage, stageIndex) => {
      const stageKey = `stage-${stageIndex}`;
      if (!stage.stageName || stage.stageName.trim() === '') {
        errors.push(`Stage ${stageIndex + 1} is missing a name`);
        newValidationErrors[stageKey] = true;
      }

      stage.tasks.forEach((task, taskIndex) => {
        const taskKey = `stage-${stageIndex}-task-${taskIndex}`;
        if (!task.taskName || task.taskName.trim() === '') {
          errors.push(`Stage ${stageIndex + 1}, Task ${taskIndex + 1} is missing a name`);
          newValidationErrors[taskKey] = true;
        }
      });
    });

    setValidationErrors(newValidationErrors);

    if (errors.length > 0) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: errors.join(', '),
      });
      return;
    }

    // Calculate group material costs
    const allMaterials: { [key: string]: number } = {};
    editableStages.forEach(stage => {
      stage.tasks.forEach(task => {
        task.materials.forEach(material => {
          if (material.materialId && material.quantityPerHa > 0) {
            if (allMaterials[material.materialId]) {
              allMaterials[material.materialId] += material.quantityPerHa;
            } else {
              allMaterials[material.materialId] = material.quantityPerHa;
            }
          }
        });
      });
    });

    const materialsArray = Object.entries(allMaterials).map(([materialId, quantity]) => ({
      materialId,
      quantity,
    }));

    if (materialsArray.length > 0) {
      calculateGroupCostMutation.mutate(
        { groupId, materials: materialsArray },
        {
          onSuccess: (data) => {
            setGroupCostData(data);
            setStep('preview');
          },
          onError: (error: any) => {
            addNotification({
              type: 'error',
              title: 'Cost Calculation Error',
              message: error.message || 'Failed to calculate material costs',
            });
            // Still navigate to preview even if cost calculation fails
            setStep('preview');
          },
        }
      );
    } else {
      setStep('preview');
    }
  };

  const handleCreatePlan = () => {
    if (!formData || !editableStages.length) return;

    // Calculate scheduled dates based on base planting date and daysAfter
    const basePlantingDateObj = new Date(formData.basePlantingDate);

    const createData: CreateProductionPlanDTO = {
      groupId,
      standardPlanId: formData.standardPlanId,
      planName: formData.planName,
      basePlantingDate: formData.basePlantingDate,
      totalArea: totalArea,
      stages: editableStages.map(stage => ({
        stageName: stage.stageName,
        sequenceOrder: stage.sequenceOrder,
        description: stage.description,
        typicalDurationDays: stage.typicalDurationDays,
        colorCode: stage.colorCode,
        tasks: stage.tasks.map(task => {
          const scheduledDate = new Date(basePlantingDateObj);
          scheduledDate.setDate(scheduledDate.getDate() + task.daysAfter);

          const scheduledEndDate = new Date(scheduledDate);
          scheduledEndDate.setDate(scheduledEndDate.getDate() + task.durationDays - 1);

          return {
            taskName: task.taskName,
            description: task.description,
            taskType: task.taskType,
            scheduledDate: scheduledDate.toISOString(),
            scheduledEndDate: scheduledEndDate.toISOString(),
            priority: task.priority,
            sequenceOrder: task.sequenceOrder,
            materials: task.materials.filter(m => m.materialId && m.quantityPerHa > 0),
          };
        }),
      })),
    };

    createPlanMutation.mutate(createData);
  }; // <-- Add this closing brace and semicolon

  const handleClose = () => {
    reset();
    setStep('select');
    setFormData(null);
    setEditableStages([]);
    onClose();
  };

  // Stage/Task editing functions
  const handleAddStage = () => {
    setEditableStages([
      ...editableStages,
      {
        stageName: '',
        sequenceOrder: editableStages.length,
        typicalDurationDays: 7,
        tasks: [],
      },
    ]);
  };

  const handleInsertStage = (position: number) => {
    const newStage: EditableStage = {
      stageName: '',
      sequenceOrder: position,
      typicalDurationDays: 7,
      tasks: [],
    };

    const newStages = [...editableStages];
    newStages.splice(position, 0, newStage);

    // Update sequence orders for all stages after the inserted one
    newStages.forEach((stage, idx) => {
      stage.sequenceOrder = idx;
    });

    setEditableStages(newStages);
  };

  const handleRemoveStage = (index: number) => {
    const newStages = editableStages.filter((_, i) => i !== index);
    newStages.forEach((stage, i) => {
      stage.sequenceOrder = i;
    });
    setEditableStages(newStages);
  };

  const handleUpdateStage = (index: number, updates: Partial<EditableStage>) => {
    const newStages = [...editableStages];
    newStages[index] = { ...newStages[index], ...updates };
    setEditableStages(newStages);

    // Clear validation error if stage name is updated
    if (updates.stageName) {
      const stageKey = `stage-${index}`;
      const newValidationErrors = { ...validationErrors };
      delete newValidationErrors[stageKey];
      setValidationErrors(newValidationErrors);
    }
  };

  const handleAddTask = (stageIndex: number) => {
    const newStages = [...editableStages];
    const stage = newStages[stageIndex];
    stage.tasks.push({
      taskName: '',
      description: '',
      taskType: 'LandPreparation',
      daysAfter: 0,
      durationDays: 1,
      priority: 'Normal',
      sequenceOrder: stage.tasks.length,
      materials: [],
    });
    setEditableStages(newStages);
  };

  const handleInsertTask = (stageIndex: number, position: number) => {
    const newStages = [...editableStages];
    const stage = newStages[stageIndex];

    const newTask: EditableTask = {
      taskName: '',
      description: '',
      taskType: 'LandPreparation',
      daysAfter: 0,
      durationDays: 1,
      priority: 'Normal',
      sequenceOrder: position,
      materials: [],
    };

    // Insert task at the specified position
    stage.tasks.splice(position, 0, newTask);

    // Update sequence orders for all tasks after the inserted one
    stage.tasks.forEach((task, idx) => {
      task.sequenceOrder = idx;
    });

    setEditableStages(newStages);
  };

  const handleRemoveTask = (stageIndex: number, taskIndex: number) => {
    const newStages = [...editableStages];
    const stage = newStages[stageIndex];
    stage.tasks = stage.tasks.filter((_, i) => i !== taskIndex);
    stage.tasks.forEach((task, i) => {
      task.sequenceOrder = i;
    });
    setEditableStages(newStages);
  };

  const handleUpdateTask = (
    stageIndex: number,
    taskIndex: number,
    updates: Partial<EditableTask>
  ) => {
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
  };

  const handleAddMaterial = (stageIndex: number, taskIndex: number) => {
    const newStages = [...editableStages];
    const task = newStages[stageIndex].tasks[taskIndex];
    task.materials.push({
      materialId: '',
      quantityPerHa: 0,
    });
    setEditableStages(newStages);
  };

  const handleRemoveMaterial = (stageIndex: number, taskIndex: number, materialIndex: number) => {
    const newStages = [...editableStages];
    const task = newStages[stageIndex].tasks[taskIndex];
    task.materials = task.materials.filter((_, i) => i !== materialIndex);
    setEditableStages(newStages);
  };

  const handleUpdateMaterial = (
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
  };

  const standardPlans = standardPlansData || [];
  const fertilizers = fertilizersQuery.data?.data || [];
  const pesticides = pesticidesQuery.data?.data || [];
  const isLoading = createPlanMutation.isPending || fertilizersQuery.isLoading || pesticidesQuery.isLoading;

  const getTitle = () => {
    switch (step) {
      case 'select':
        return 'Create Production Plan - Select Template';
      case 'edit':
        return 'Create Production Plan - Adapt Plan';
      case 'preview':
        return 'Create Production Plan - Review';
      default:
        return 'Create Production Plan';
    }
  };

  return (
    <div className={isOpen ? 'fixed inset-0 z-50 overflow-y-auto' : 'hidden'}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

        <div className="relative z-10 w-[90vw] max-w-[1600px] rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{getTitle()}</h2>
              <p className="text-xs text-gray-600">Group: {groupName}</p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-1 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            >
              <span className="text-lg">✕</span>
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[75vh] space-y-5 overflow-y-auto p-5">
            {/* Step 1: Select Template */}
            {step === 'select' && (
              <form onSubmit={handleSubmit(handleSelectPlan)} className="space-y-4">
                <div className="rounded-lg border bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Step 1: Select Standard Plan Template</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Choose a standard plan template and set the base planting date. You'll be able to customize it in the next step.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Standard Plan Template *
                    </label>
                    {isLoadingPlans ? (
                      <div className="flex items-center justify-center p-4">
                        <Spinner size="sm" />
                      </div>
                    ) : (
                      <select
                        {...register('standardPlanId', { required: 'Standard plan is required' })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      >
                        <option value="">Select a standard plan...</option>
                        {standardPlans.map((plan: any) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} - {plan.totalDuration} days ({plan.totalStages || 0} stages)
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.standardPlanId && (
                      <p className="text-sm text-red-600">{errors.standardPlanId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Base Planting Date *
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      {...register('basePlantingDate', {
                        required: 'Planting date is required',
                        validate: (value) => {
                          const selectedDate = new Date(value);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return selectedDate >= today || 'Planting date cannot be in the past';
                        }
                      })}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                    {errors.basePlantingDate && (
                      <p className="text-sm text-red-600">{errors.basePlantingDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      {...register('planName', { required: 'Plan name is required' })}
                      placeholder="Enter production plan name"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                    {errors.planName && (
                      <p className="text-sm text-red-600">{errors.planName.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!standardPlanId || !basePlantingDate || !planName} // Add planName check
                    icon={<ArrowRight className="h-4 w-4" />}
                  >
                    Next: Adapt Plan
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: Edit/Adapt Plan */}
            {step === 'edit' && (
              <>
                {isLoadingDetails ? (
                  <div className="flex h-64 items-center justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg border bg-blue-50 p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900">Step 2: Adapt Plan to Your Needs</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Customize the stages, tasks, and materials. Add or remove items as needed.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Editable Stages */}
                    <div className="rounded-lg border bg-white p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900">Cultivation Stages & Tasks</h3>
                        <Button
                          size="sm"
                          onClick={handleAddStage}
                          disabled={isLoading}
                          icon={<Plus className="h-3.5 w-3.5" />}
                        >
                          Add Stage
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {editableStages.map((stage, stageIndex) => {
                          const stageKey = `stage-${stageIndex}`;
                          const hasStageError = validationErrors[stageKey];

                          return (
                            <div key={stageIndex} className="relative">
                              {/* Add stage before this stage - small icon button at the top */}
                              {stageIndex === 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleInsertStage(0)}
                                  disabled={isLoading}
                                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-md transition-colors"
                                  title="Add stage before"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              )}

                              <div
                                className={`rounded-lg border-2 ${hasStageError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100'
                                  } p-3 shadow-sm`}
                              >
                                {/* Stage Header */}
                                <div className="mb-3 flex items-start gap-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-xs flex-shrink-0">
                                    {stageIndex + 1}
                                  </div>
                                  <div className="flex-1 space-y-2">
                                    <div className="grid grid-cols-12 gap-2">
                                      <div className="col-span-9">
                                        <input
                                          type="text"
                                          value={stage.stageName}
                                          onChange={(e) =>
                                            handleUpdateStage(stageIndex, { stageName: e.target.value })
                                          }
                                          disabled={isLoading}
                                          placeholder="Stage name *"
                                          className={`block w-full rounded-md border ${hasStageError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                            } px-2.5 py-1 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                                        />
                                        {hasStageError && (
                                          <p className="text-xs text-red-600 mt-1">Stage name is required</p>
                                        )}
                                      </div>
                                      <input
                                        type="number"
                                        value={stage.typicalDurationDays}
                                        onChange={(e) =>
                                          handleUpdateStage(stageIndex, {
                                            typicalDurationDays: parseInt(e.target.value) || 0,
                                          })
                                        }
                                        disabled={isLoading}
                                        min="1"
                                        placeholder="Days"
                                        className="col-span-3 block w-full rounded-md border border-gray-300 bg-white px-2.5 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                      />
                                    </div>
                                    <input
                                      type="text"
                                      value={stage.description || ''}
                                      onChange={(e) =>
                                        handleUpdateStage(stageIndex, { description: e.target.value })
                                      }
                                      disabled={isLoading}
                                      placeholder="Stage description"
                                      className="block w-full rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs italic text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                    />
                                  </div>
                                  {editableStages.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveStage(stageIndex)}
                                      disabled={isLoading}
                                      className="p-1 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
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
                                      <Plus className="h-3 w-3" />
                                      Add Task at End
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2.5">
                                    {stage.tasks.map((task, taskIndex) => {
                                      const taskKey = `stage-${stageIndex}-task-${taskIndex}`;
                                      const hasTaskError = validationErrors[taskKey];

                                      return (
                                        <div key={taskIndex} className="relative">
                                          {/* Add task before this task - small icon button */}
                                          {taskIndex === 0 && (
                                            <button
                                              type="button"
                                              onClick={() => handleInsertTask(stageIndex, 0)}
                                              disabled={isLoading}
                                              className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-md transition-colors"
                                              title="Add task before"
                                            >
                                              <Plus className="h-3.5 w-3.5" />
                                            </button>
                                          )}

                                          <div
                                            className={`rounded-md border-2 ${hasTaskError ? 'border-red-300 bg-red-50' : 'border-blue-200 bg-white'
                                              } p-2.5 shadow-sm hover:shadow-md transition-shadow flex flex-col`}
                                          >
                                            <div className="flex items-start justify-between mb-2">
                                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold">
                                                {taskIndex + 1}
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => handleRemoveTask(stageIndex, taskIndex)}
                                                disabled={isLoading}
                                                className="text-red-600 hover:text-red-700"
                                              >
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </button>
                                            </div>

                                            <div className="space-y-2 flex-1">
                                              <div className="space-y-0.5">
                                                <label className="block text-[10px] font-medium text-gray-600">
                                                  Task name *
                                                </label>
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
                                                  className={`block w-full rounded-md border ${hasTaskError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                                    } px-2 py-1 text-xs font-medium focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                                                />
                                                {hasTaskError && (
                                                  <p className="text-[10px] text-red-600 mt-0.5">Task name is required</p>
                                                )}
                                              </div>

                                              <div className="space-y-0.5">
                                                <label className="block text-[10px] font-medium text-gray-600">Description</label>
                                                <textarea
                                                  value={task.description || ''}
                                                  onChange={(e) =>
                                                    handleUpdateTask(stageIndex, taskIndex, {
                                                      description: e.target.value,
                                                    })
                                                  }
                                                  disabled={isLoading}
                                                  placeholder="Description"
                                                  rows={2}
                                                  className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                                />
                                              </div>

                                              <div className="grid grid-cols-2 gap-1.5">
                                                <div className="space-y-0.5">
                                                  <label className="block text-[10px] font-medium text-gray-600">Days After</label>
                                                  <input
                                                    type="number"
                                                    value={task.daysAfter}
                                                    onChange={(e) =>
                                                      handleUpdateTask(stageIndex, taskIndex, {
                                                        daysAfter: parseInt(e.target.value) || 0,
                                                      })
                                                    }
                                                    disabled={isLoading}
                                                    placeholder="0"
                                                    className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                                  />
                                                </div>
                                                <div className="space-y-0.5">
                                                  <label className="block text-[10px] font-medium text-gray-600">Duration</label>
                                                  <input
                                                    type="number"
                                                    value={task.durationDays}
                                                    onChange={(e) =>
                                                      handleUpdateTask(stageIndex, taskIndex, {
                                                        durationDays: parseInt(e.target.value) || 1,
                                                      })
                                                    }
                                                    disabled={isLoading}
                                                    min="1"
                                                    placeholder="1"
                                                    className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                                  />
                                                </div>
                                              </div>

                                              <div className="space-y-0.5">
                                                <label className="block text-[10px] font-medium text-gray-600">Task Type</label>
                                                <select
                                                  value={task.taskType}
                                                  onChange={(e) =>
                                                    handleUpdateTask(stageIndex, taskIndex, {
                                                      taskType: e.target.value,
                                                    })
                                                  }
                                                  disabled={isLoading}
                                                  className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                                >
                                                  <option value="LandPreparation">Land Preparation</option>
                                                  <option value="Fertilization">Fertilization</option>
                                                  <option value="PestControl">Pest Control</option>
                                                  <option value="Harvesting">Harvesting</option>
                                                  <option value="Sowing">Sowing</option>
                                                </select>
                                              </div>

                                              <div className="space-y-0.5">
                                                <label className="block text-[10px] font-medium text-gray-600">Priority</label>
                                                <select
                                                  value={task.priority}
                                                  onChange={(e) =>
                                                    handleUpdateTask(stageIndex, taskIndex, {
                                                      priority: e.target.value,
                                                    })
                                                  }
                                                  disabled={isLoading}
                                                  className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                                >
                                                  {PRIORITIES.map((priority) => (
                                                    <option key={priority} value={priority}>
                                                      {priority}
                                                    </option>
                                                  ))}
                                                </select>
                                              </div>

                                              {/* Materials */}
                                              <div className="rounded-md border border-gray-200 bg-gray-50 p-1.5 space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                  <span className="text-[10px] font-semibold text-gray-700">
                                                    Materials
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleAddMaterial(stageIndex, taskIndex)}
                                                    disabled={isLoading}
                                                    className="text-[10px] font-medium text-blue-600 hover:text-blue-700 underline"
                                                  >
                                                    + Add
                                                  </button>
                                                </div>
                                                {task.materials.map((material, materialIndex) => (
                                                  <div
                                                    key={materialIndex}
                                                    className="space-y-1 rounded-md bg-white p-1.5 border border-gray-200"
                                                  >
                                                    <select
                                                      value={material.materialId}
                                                      onChange={(e) =>
                                                        handleUpdateMaterial(
                                                          stageIndex,
                                                          taskIndex,
                                                          materialIndex,
                                                          'materialId',
                                                          e.target.value
                                                        )
                                                      }
                                                      disabled={isLoading}
                                                      className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                                    >
                                                      <option value="">Select material...</option>
                                                      {fertilizers.length > 0 && (
                                                        <optgroup label="Fertilizers">
                                                          {fertilizers.map((mat: any) => (
                                                            <option key={mat.materialId} value={mat.materialId}>
                                                              {mat.name} ({mat.unit})
                                                            </option>
                                                          ))}
                                                        </optgroup>
                                                      )}
                                                      {pesticides.length > 0 && (
                                                        <optgroup label="Pesticides">
                                                          {pesticides.map((mat: any) => (
                                                            <option key={mat.materialId} value={mat.materialId}>
                                                              {mat.name} ({mat.unit})
                                                            </option>
                                                          ))}
                                                        </optgroup>
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
                                                            parseFloat(e.target.value) || 0
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
                                                            materialIndex
                                                          )
                                                        }
                                                        disabled={isLoading}
                                                        className="p-0.5 text-red-600 hover:bg-red-50 rounded hover:text-red-700"
                                                      >
                                                        <Trash2 className="h-3 w-3" />
                                                      </button>
                                                    </div>
                                                  </div>
                                                ))}
                                                {task.materials.length === 0 && (
                                                  <p className="text-[10px] text-gray-500 italic text-center py-0.5">
                                                    No materials
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Add task after this task - small icon button */}
                                          <button
                                            type="button"
                                            onClick={() => handleInsertTask(stageIndex, taskIndex + 1)}
                                            disabled={isLoading}
                                            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-md transition-colors"
                                            title="Add task after"
                                          >
                                            <Plus className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {stage.tasks.length === 0 && (
                                    <div className="text-center py-8">
                                      <p className="text-xs text-gray-500 italic mb-3">
                                        No tasks yet.
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => handleAddTask(stageIndex)}
                                        disabled={isLoading}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
                                      >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add First Task
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Add stage after this stage - small icon button at the bottom */}
                              <button
                                type="button"
                                onClick={() => handleInsertStage(stageIndex + 1)}
                                disabled={isLoading}
                                className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-md transition-colors"
                                title="Add stage after"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="sticky bottom-0 bg-white border-t pt-3 pb-2 -mx-5 px-5">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-600">
                          {editableStages.length} stage{editableStages.length !== 1 ? 's' : ''} • {editableStages.reduce((sum, s) => sum + s.tasks.length, 0)} tasks
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setStep('select')} disabled={isLoading}>
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back
                          </Button>
                          <Button
                            onClick={handleToPreview}
                            disabled={isLoading || editableStages.length === 0}
                            icon={<ArrowRight className="h-4 w-4" />}
                          >
                            Next: Preview
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Step 3: Preview */}
            {step === 'preview' && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Step 3: Review & Create</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Review the adapted plan. Click "Create Plan" to finalize.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border bg-green-50 p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Total Cost</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-green-900">
                      {groupCostData ? groupCostData.totalGroupCost.toLocaleString('vi-VN') : 'N/A'}
                    </p>
                    <p className="text-xs text-green-700">VND</p>
                  </div>                  <div className="rounded-lg border bg-blue-50 p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Total Area</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-blue-900">
                      {(totalArea || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-700">hectares</p>
                  </div>

                  <div className="rounded-lg border bg-purple-50 p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Stages</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-purple-900">
                      {editableStages.length}
                    </p>
                    <p className="text-xs text-purple-700">
                      {editableStages.reduce((sum, s) => sum + s.tasks.length, 0)} tasks total
                    </p>
                  </div>
                </div>

                {/* Plan Details */}
                <div className="rounded-lg border bg-gray-50 p-4">
                  <h4 className="font-semibold text-gray-900">
                    {formData?.planName || `Production Plan - ${groupName}`}
                  </h4>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    <div>
                      <span className="font-medium text-gray-700">Group:</span>{' '}
                      <span className="text-gray-900">{groupName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Planting Date:</span>{' '}
                      <span className="text-gray-900">
                        {formData && new Date(formData.basePlantingDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Area:</span>{' '}
                      <span className="text-gray-900">{(totalArea || 0).toFixed(2)} ha</span>
                    </div>
                  </div>
                </div>

                {/* Material Cost Details */}
                {groupCostData && groupCostData.materialCostDetails.length > 0 && (
                  <div className="rounded-lg border bg-white">
                    <div className="bg-green-50 px-4 py-3 border-b">
                      <h4 className="font-semibold text-green-900">Material Cost Breakdown</h4>
                      <p className="text-xs text-green-700 mt-1">
                        Total materials required for {groupCostData.totalGroupArea.toFixed(2)} ha
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Material</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Qty/ha</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Total Qty</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Packages</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Price/Package</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Total Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {groupCostData.materialCostDetails.map((material, idx) => {
                            const qtyPerHa = material.requiredQuantity / groupCostData.totalGroupArea;
                            return (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div className="font-medium text-gray-900">{material.materialName}</div>
                                  <div className="text-xs text-gray-500">
                                    Price valid from: {new Date(material.priceValidFrom).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right text-gray-700">
                                  {qtyPerHa.toFixed(2)} {material.unit}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-gray-900">
                                  {material.requiredQuantity.toFixed(2)} {material.unit}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-700">
                                  {material.packagesNeeded}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-700">
                                  {material.effectivePricePerPackage.toLocaleString('vi-VN')} VND
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-green-700">
                                  {material.materialTotalCost.toLocaleString('vi-VN')} VND
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2">
                          <tr>
                            <td colSpan={5} className="px-4 py-3 text-right font-bold text-gray-900">
                              Total Material Cost:
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-green-700 text-lg">
                              {groupCostData.totalGroupCost.toLocaleString('vi-VN')} VND
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Plot Cost Allocation */}
                {groupCostData && groupCostData.plotCostDetails.length > 0 && (
                  <div className="rounded-lg border bg-white">
                    <div className="bg-blue-50 px-4 py-3 border-b">
                      <h4 className="font-semibold text-blue-900">Cost Allocation by Plot</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Material costs distributed across {groupCostData.plotCostDetails.length} plots
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Plot Name</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Area (ha)</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Area Ratio</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Allocated Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {groupCostData.plotCostDetails.map((plot, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{plot.plotName}</td>
                              <td className="px-4 py-3 text-right text-gray-700">
                                {plot.plotArea.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-700">
                                {(plot.areaRatio * 100).toFixed(2)}%
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-blue-700">
                                {plot.allocatedCost.toLocaleString('vi-VN')} VND
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2">
                          <tr>
                            <td className="px-4 py-3 font-bold text-gray-900">Total</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900">
                              {groupCostData.totalGroupArea.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900">100%</td>
                            <td className="px-4 py-3 text-right font-bold text-blue-700 text-lg">
                              {groupCostData.totalGroupCost.toLocaleString('vi-VN')} VND
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Price Warnings */}
                {groupCostData && groupCostData.priceWarnings.length > 0 && (
                  <div className="rounded-lg border border-orange-300 bg-orange-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-orange-900">Price Warnings</h4>
                        <ul className="mt-2 space-y-1 text-sm text-orange-800">
                          {groupCostData.priceWarnings.map((warning, idx) => (
                            <li key={idx}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stages Overview */}
                <div className="max-h-[400px] overflow-y-auto rounded-lg border">
                  <div className="p-4 space-y-3">
                    <h4 className="font-semibold text-gray-900 sticky top-0 bg-white pb-2 z-10">
                      Adapted Stages & Tasks
                    </h4>
                    {editableStages.map((stage, idx) => (
                      <div key={idx} className="rounded-lg border bg-white p-3">
                        <div className="font-medium text-gray-900">
                          {stage.sequenceOrder + 1}. {stage.stageName}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Duration: {stage.typicalDurationDays} days
                          {stage.description && ` • ${stage.description}`}
                        </p>
                        {stage.tasks && stage.tasks.length > 0 ? (
                          <div className="mt-2 space-y-2">
                            {stage.tasks.map((task, taskIdx) => {
                              const scheduledDate = new Date(formData!.basePlantingDate);
                              scheduledDate.setDate(scheduledDate.getDate() + task.daysAfter);

                              return (
                                <div key={taskIdx} className="text-sm pl-4 border-l-2 border-gray-200">
                                  <div className="font-medium text-gray-700">{task.taskName}</div>
                                  <div className="text-gray-500 text-xs">
                                    Scheduled: {scheduledDate.toLocaleDateString()} (Day {task.daysAfter})
                                  </div>
                                  <div className="text-gray-500 text-xs">
                                    Duration: {task.durationDays} day{task.durationDays > 1 ? 's' : ''} • {task.taskType} • Priority: {task.priority}
                                  </div>
                                  {task.description && (
                                    <div className="text-gray-600 text-xs mt-1 italic">
                                      {task.description}
                                    </div>
                                  )}
                                  {task.materials && task.materials.length > 0 && (
                                    <div className="mt-1 text-xs text-gray-600">
                                      <span className="font-medium">Materials:</span>
                                      <ul className="ml-4 mt-1">
                                        {task.materials.filter(m => m.materialId).map((material, matIdx) => {
                                          const materialData = [...fertilizers, ...pesticides].find(
                                            m => m.materialId === material.materialId
                                          );
                                          return (
                                            <li key={matIdx}>
                                              • {materialData?.name || 'Unknown'}: {material.quantityPerHa} {materialData?.unit || ''}/ha
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-gray-500 italic">No tasks defined for this stage</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-white border-t pt-3 pb-2 -mx-5 px-5">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep('edit')}
                      disabled={createPlanMutation.isPending}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to Edit
                    </Button>
                    <Button
                      onClick={handleCreatePlan}
                      disabled={createPlanMutation.isPending}
                      icon={createPlanMutation.isPending ? <Spinner size="sm" /> : <CheckCircle className="h-4 w-4" />}
                    >
                      {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};