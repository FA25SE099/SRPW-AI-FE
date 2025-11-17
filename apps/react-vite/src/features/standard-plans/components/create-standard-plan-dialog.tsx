import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

import { SimpleDialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';
import { useCreateStandardPlan, CreateStandardPlanStage, CreateStandardPlanStageTask } from '../api/create-standard-plan';
import { useCategories } from '@/features/rice-varieties/api/get-categories';
import { useMaterials } from '@/features/materials/api/get-materials';

type CreateStandardPlanDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TASK_TYPES = ['Cultivation', 'Planting', 'Fertilizing', 'PestControl', 'Irrigation', 'Harvesting', 'PostHarvest', 'Other'];
const PRIORITIES = ['Low', 'Normal', 'High', 'Critical'];

export const CreateStandardPlanDialog = ({
  isOpen,
  onClose,
}: CreateStandardPlanDialogProps) => {
  const { addNotification } = useNotifications();
  
  // Form state
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [estimatedDurationDays, setEstimatedDurationDays] = useState<number>(120);
  const [stages, setStages] = useState<CreateStandardPlanStage[]>([
    {
      stageName: 'Land Preparation',
      sequenceOrder: 1,
      expectedDurationDays: 7,
      isMandatory: true,
      notes: '',
      tasks: [],
    },
  ]);

  // Queries
  const categoriesQuery = useCategories();
  const materialsQuery = useMaterials({ params: { isActive: true } });

  const createMutation = useCreateStandardPlan({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Standard plan created successfully',
        });
        handleClose();
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Error',
          message: error.message || 'Failed to create standard plan',
        });
      },
    },
  });

  const handleClose = () => {
    setPlanName('');
    setDescription('');
    setCategoryId('');
    setEstimatedDurationDays(120);
    setStages([
      {
        stageName: 'Land Preparation',
        sequenceOrder: 1,
        expectedDurationDays: 7,
        isMandatory: true,
        notes: '',
        tasks: [],
      },
    ]);
    onClose();
  };

  const handleAddStage = () => {
    setStages([
      ...stages,
      {
        stageName: '',
        sequenceOrder: stages.length + 1,
        expectedDurationDays: 7,
        isMandatory: true,
        notes: '',
        tasks: [],
      },
    ]);
  };

  const handleRemoveStage = (index: number) => {
    const newStages = stages.filter((_, i) => i !== index);
    // Reorder sequence
    newStages.forEach((stage, i) => {
      stage.sequenceOrder = i + 1;
    });
    setStages(newStages);
  };

  const handleUpdateStage = (index: number, updates: Partial<CreateStandardPlanStage>) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], ...updates };
    setStages(newStages);
  };

  const handleAddTask = (stageIndex: number) => {
    const newStages = [...stages];
    const stage = newStages[stageIndex];
    stage.tasks.push({
      taskName: '',
      description: '',
      daysAfter: 0,
      durationDays: 1,
      taskType: 'Cultivation',
      priority: 'Normal',
      sequenceOrder: stage.tasks.length + 1,
      materials: [],
    });
    setStages(newStages);
  };

  const handleRemoveTask = (stageIndex: number, taskIndex: number) => {
    const newStages = [...stages];
    const stage = newStages[stageIndex];
    stage.tasks = stage.tasks.filter((_, i) => i !== taskIndex);
    // Reorder sequence
    stage.tasks.forEach((task, i) => {
      task.sequenceOrder = i + 1;
    });
    setStages(newStages);
  };

  const handleUpdateTask = (
    stageIndex: number,
    taskIndex: number,
    updates: Partial<CreateStandardPlanStageTask>
  ) => {
    const newStages = [...stages];
    newStages[stageIndex].tasks[taskIndex] = {
      ...newStages[stageIndex].tasks[taskIndex],
      ...updates,
    };
    setStages(newStages);
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

  const handleRemoveMaterial = (stageIndex: number, taskIndex: number, materialIndex: number) => {
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
    value: string | number
  ) => {
    const newStages = [...stages];
    const material = newStages[stageIndex].tasks[taskIndex].materials[materialIndex];
    material[field] = value as any;
    setStages(newStages);
  };

  const handleSubmit = () => {
    // Validation
    if (!planName || !categoryId || !estimatedDurationDays) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    if (stages.length === 0) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please add at least one stage',
      });
      return;
    }

    // Check if all stages have tasks
    for (let i = 0; i < stages.length; i++) {
      if (stages[i].tasks.length === 0) {
        addNotification({
          type: 'error',
          title: 'Validation Error',
          message: `Stage "${stages[i].stageName}" must have at least one task`,
        });
        return;
      }
    }

    createMutation.mutate({
      planName,
      description,
      categoryId,
      estimatedDurationDays,
      stages,
    });
  };

  const categories = categoriesQuery.data || [];
  const materials = materialsQuery.data || [];
  const isLoading = createMutation.isPending;

  return (
    <SimpleDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Standard Plan"
      maxWidth="6xl"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Plan Name *
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                disabled={isLoading}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="e.g., Winter-Spring Rice 2025"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              {categoriesQuery.isLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Spinner size="sm" />
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={isLoading}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="">Select category...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Estimated Duration (Days) *
              </label>
              <input
                type="number"
                value={estimatedDurationDays}
                onChange={(e) => setEstimatedDurationDays(parseInt(e.target.value) || 0)}
                disabled={isLoading}
                min="1"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Plan description..."
            />
          </div>
        </div>

        {/* Stages Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Stages & Tasks</h3>
            <Button
              size="sm"
              onClick={handleAddStage}
              disabled={isLoading}
              icon={<Plus className="h-4 w-4" />}
            >
              Add Stage
            </Button>
          </div>

          <div className="max-h-[500px] space-y-4 overflow-y-auto pr-2">
            {stages.map((stage, stageIndex) => (
              <div
                key={stageIndex}
                className="rounded-lg border border-gray-300 bg-gray-50 p-4"
              >
                {/* Stage Header */}
                <div className="mb-3 flex items-start gap-3">
                  <GripVertical className="mt-2 h-5 w-5 flex-shrink-0 text-gray-400" />
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <input
                        type="text"
                        value={stage.stageName}
                        onChange={(e) =>
                          handleUpdateStage(stageIndex, { stageName: e.target.value })
                        }
                        disabled={isLoading}
                        placeholder="Stage name"
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      />
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
                        placeholder="Duration (days)"
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={stage.isMandatory}
                            onChange={(e) =>
                              handleUpdateStage(stageIndex, {
                                isMandatory: e.target.checked,
                              })
                            }
                            disabled={isLoading}
                            className="rounded"
                          />
                          Mandatory
                        </label>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={stage.notes || ''}
                      onChange={(e) =>
                        handleUpdateStage(stageIndex, { notes: e.target.value })
                      }
                      disabled={isLoading}
                      placeholder="Stage notes (optional)"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  {stages.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveStage(stageIndex)}
                      disabled={isLoading}
                      icon={<Trash2 className="h-4 w-4" />}
                    />
                  )}
                </div>

                {/* Tasks */}
                <div className="ml-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Tasks</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddTask(stageIndex)}
                      disabled={isLoading}
                      icon={<Plus className="h-3 w-3" />}
                    >
                      Add Task
                    </Button>
                  </div>

                  {stage.tasks.map((task, taskIndex) => (
                    <div
                      key={taskIndex}
                      className="rounded-md border border-gray-200 bg-white p-3"
                    >
                      <div className="mb-2 flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
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
                              className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={task.description}
                              onChange={(e) =>
                                handleUpdateTask(stageIndex, taskIndex, {
                                  description: e.target.value,
                                })
                              }
                              disabled={isLoading}
                              placeholder="Description"
                              className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                            <input
                              type="number"
                              value={task.daysAfter}
                              onChange={(e) =>
                                handleUpdateTask(stageIndex, taskIndex, {
                                  daysAfter: parseInt(e.target.value) || 0,
                                })
                              }
                              disabled={isLoading}
                              placeholder="Days after planting"
                              className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            />
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
                              placeholder="Duration"
                              className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            />
                            <select
                              value={task.taskType}
                              onChange={(e) =>
                                handleUpdateTask(stageIndex, taskIndex, {
                                  taskType: e.target.value,
                                })
                              }
                              disabled={isLoading}
                              className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            >
                              {TASK_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                            <select
                              value={task.priority}
                              onChange={(e) =>
                                handleUpdateTask(stageIndex, taskIndex, {
                                  priority: e.target.value,
                                })
                              }
                              disabled={isLoading}
                              className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            >
                              {PRIORITIES.map((priority) => (
                                <option key={priority} value={priority}>
                                  {priority}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Materials */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-600">
                                Materials
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddMaterial(stageIndex, taskIndex)}
                                disabled={isLoading}
                                className="text-xs text-blue-600 hover:text-blue-700"
                              >
                                + Add Material
                              </button>
                            </div>
                            {task.materials.map((material, materialIndex) => (
                              <div
                                key={materialIndex}
                                className="flex items-center gap-2"
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
                                  className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                >
                                  <option value="">Select material...</option>
                                  {materials.map((mat) => (
                                    <option key={mat.id} value={mat.id}>
                                      {mat.name} ({mat.unit})
                                    </option>
                                  ))}
                                </select>
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
                                  className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(stageIndex, taskIndex)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {stage.tasks.length === 0 && (
                    <p className="text-sm text-gray-500">No tasks added yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Create Standard Plan
          </Button>
        </div>
      </div>
    </SimpleDialog>
  );
};

