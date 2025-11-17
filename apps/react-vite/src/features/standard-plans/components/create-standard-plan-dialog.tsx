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

const TASK_TYPES = ['Preparation', 'Planting', 'Fertilization', 'Irrigation', 'PestControl', 'Weeding', 'Monitoring', 'Harvesting', 'PostHarvest', 'Other'];
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
  const [totalDurationDays, setTotalDurationDays] = useState<number>(120);
  const [stages, setStages] = useState<CreateStandardPlanStage[]>([
    {
      stageName: 'Land Preparation',
      sequenceOrder: 0,
      expectedDurationDays: 7,
      isMandatory: true,
      notes: '',
      tasks: [],
    },
  ]);

  // Queries
  const categoriesQuery = useCategories();
  // Fetch both fertilizers and pesticides
  const fertilizersQuery = useMaterials({ 
    params: { 
      currentPage: 1, 
      pageSize: 1000,
      type: 0 // Fertilizer
    } 
  });
  const pesticidesQuery = useMaterials({ 
    params: { 
      currentPage: 1, 
      pageSize: 1000,
      type: 1 // Pesticide
    } 
  });

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
        console.error('Create standard plan error:', error);
        console.error('Error response:', error.response?.data);
        
        const errorMessage = error.errors?.join('\n') || error.message || 'Failed to create standard plan';
        addNotification({
          type: 'error',
          title: 'Error',
          message: errorMessage,
        });
      },
    },
  });

  const handleClose = () => {
    setPlanName('');
    setDescription('');
    setCategoryId('');
    setTotalDurationDays(120);
    setStages([
      {
        stageName: 'Land Preparation',
        sequenceOrder: 0,
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
        sequenceOrder: stages.length,
        expectedDurationDays: 7,
        isMandatory: true,
        notes: '',
        tasks: [],
      },
    ]);
  };

  const handleRemoveStage = (index: number) => {
    const newStages = stages.filter((_, i) => i !== index);
    // Reorder sequence (0-based)
    newStages.forEach((stage, i) => {
      stage.sequenceOrder = i;
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
      taskType: 'Preparation',
      priority: 'Normal',
      sequenceOrder: stage.tasks.length,
      materials: [],
    });
    setStages(newStages);
  };

  const handleRemoveTask = (stageIndex: number, taskIndex: number) => {
    const newStages = [...stages];
    const stage = newStages[stageIndex];
    stage.tasks = stage.tasks.filter((_, i) => i !== taskIndex);
    // Reorder sequence (0-based)
    stage.tasks.forEach((task, i) => {
      task.sequenceOrder = i;
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
    if (!planName || !categoryId || !totalDurationDays) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    if (totalDurationDays < 1 || totalDurationDays > 365) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Total duration must be between 1 and 365 days',
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

    // Check if all stages have tasks and validate task data
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      
      if (!stage.stageName || !stage.stageName.trim()) {
        addNotification({
          type: 'error',
          title: 'Validation Error',
          message: `Stage ${i + 1} must have a name`,
        });
        return;
      }

      if (stage.tasks.length === 0) {
        addNotification({
          type: 'error',
          title: 'Validation Error',
          message: `Stage "${stage.stageName}" must have at least one task`,
        });
        return;
      }

      // Validate each task
      for (let j = 0; j < stage.tasks.length; j++) {
        const task = stage.tasks[j];
        if (!task.taskName || !task.taskName.trim()) {
          addNotification({
            type: 'error',
            title: 'Validation Error',
            message: `Task ${j + 1} in stage "${stage.stageName}" must have a name`,
          });
          return;
        }
        if (!task.description || !task.description.trim()) {
          addNotification({
            type: 'error',
            title: 'Validation Error',
            message: `Task "${task.taskName}" must have a description`,
          });
          return;
        }
      }
    }

    // Clean up the data before sending
    const cleanedStages = stages.map(stage => ({
      ...stage,
      notes: stage.notes && stage.notes.trim() ? stage.notes : undefined,
      tasks: stage.tasks.map(task => ({
        ...task,
        materials: task.materials.filter(m => m.materialId && m.quantityPerHa > 0)
      }))
    }));

    const payload = {
      categoryId,
      planName: planName.trim(),
      description: description && description.trim() ? description.trim() : undefined,
      totalDurationDays,
      isActive: true,
      stages: cleanedStages,
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    createMutation.mutate(payload);
  };

  const categories = categoriesQuery.data || [];
  // Combine fertilizers and pesticides
  const fertilizers = fertilizersQuery.data?.data || [];
  const pesticides = pesticidesQuery.data?.data || [];
  const materials = [...fertilizers, ...pesticides];
  const isLoading = createMutation.isPending || fertilizersQuery.isLoading || pesticidesQuery.isLoading;

  return (
    <SimpleDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Standard Plan"
      maxWidth="7xl"
    >
      <div className="max-h-[85vh] space-y-6 overflow-y-auto pr-2">
        {/* Basic Information */}
        <div className="rounded-lg border bg-gray-50 p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
          
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-2 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Plan Name *
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                disabled={isLoading}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="e.g., Winter-Spring Rice 2025 - Long Duration"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Rice Category *
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
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
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

            <div className="space-y-2 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Total Duration (Days) *
              </label>
              <input
                type="number"
                value={totalDurationDays}
                onChange={(e) => setTotalDurationDays(parseInt(e.target.value) || 0)}
                disabled={isLoading}
                min="1"
                max="365"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="e.g., 120, 145"
              />
            </div>
          </div>

          <div className="space-y-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={2}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="e.g., Standard cultivation plan for long-duration rice varieties (140-150 days)"
            />
          </div>
        </div>

        {/* Stages Section */}
        <div className="rounded-lg border bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Cultivation Stages & Tasks</h3>
            <Button
              size="sm"
              onClick={handleAddStage}
              disabled={isLoading}
              icon={<Plus className="h-4 w-4" />}
            >
              Add Stage
            </Button>
          </div>

          <div className="space-y-4">
            {stages.map((stage, stageIndex) => (
              <div
                key={stageIndex}
                className="rounded-lg border-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 p-4 shadow-sm"
              >
                {/* Stage Header */}
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-sm flex-shrink-0 mt-1">
                    {stageIndex + 1}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                      <input
                        type="text"
                        value={stage.stageName}
                        onChange={(e) =>
                          handleUpdateStage(stageIndex, { stageName: e.target.value })
                        }
                        disabled={isLoading}
                        placeholder="e.g., Land Preparation, Planting, Growth & Maintenance"
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-blue-500 lg:col-span-6"
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
                        placeholder="Days"
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 lg:col-span-3"
                      />
                      <div className="flex items-center gap-2 lg:col-span-3">
                        <label className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                          <input
                            type="checkbox"
                            checked={stage.isMandatory}
                            onChange={(e) =>
                              handleUpdateStage(stageIndex, {
                                isMandatory: e.target.checked,
                              })
                            }
                            disabled={isLoading}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-medium">Mandatory</span>
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
                      placeholder="Stage notes (e.g., Prepare soil before planting)"
                      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm italic text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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
                <div className="ml-10 mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-md bg-blue-50 px-3 py-2">
                    <span className="text-sm font-semibold text-blue-900">Tasks</span>
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
                      className="rounded-md border-2 border-blue-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="mb-2 flex items-start gap-2">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                            <input
                              type="text"
                              value={task.taskName}
                              onChange={(e) =>
                                handleUpdateTask(stageIndex, taskIndex, {
                                  taskName: e.target.value,
                                })
                              }
                              disabled={isLoading}
                              placeholder="e.g., Apply Organic Fertilizer, Sowing Seeds"
                              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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
                              placeholder="Task description"
                              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                            <div className="space-y-1">
                              <label className="block text-xs font-medium text-gray-600">Days After Planting</label>
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
                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-medium text-gray-600">Duration (days)</label>
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
                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-medium text-gray-600">Task Type</label>
                              <select
                                value={task.taskType}
                                onChange={(e) =>
                                  handleUpdateTask(stageIndex, taskIndex, {
                                    taskType: e.target.value,
                                  })
                                }
                                disabled={isLoading}
                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                              >
                                {TASK_TYPES.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-medium text-gray-600">Priority</label>
                              <select
                                value={task.priority}
                                onChange={(e) =>
                                  handleUpdateTask(stageIndex, taskIndex, {
                                    priority: e.target.value,
                                  })
                                }
                                disabled={isLoading}
                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                              >
                                {PRIORITIES.map((priority) => (
                                  <option key={priority} value={priority}>
                                    {priority}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Materials */}
                          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-700">
                                Materials (per hectare)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddMaterial(stageIndex, taskIndex)}
                                disabled={isLoading}
                                className="text-xs font-medium text-blue-600 hover:text-blue-700 underline"
                              >
                                + Add Material
                              </button>
                            </div>
                            {task.materials.map((material, materialIndex) => (
                              <div
                                key={materialIndex}
                                className="flex items-center gap-2 rounded-md bg-white p-2 border border-gray-200"
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
                                  disabled={isLoading || fertilizersQuery.isLoading || pesticidesQuery.isLoading}
                                  className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
                                >
                                  <option value="">Select material...</option>
                                  {fertilizersQuery.isLoading || pesticidesQuery.isLoading ? (
                                    <option disabled>Loading materials...</option>
                                  ) : (
                                    <>
                                      {fertilizers.length > 0 && (
                                        <optgroup label="Fertilizers">
                                          {fertilizers.map((mat) => (
                                            <option key={mat.materialId} value={mat.materialId}>
                                              {mat.name} ({mat.unit})
                                            </option>
                                          ))}
                                        </optgroup>
                                      )}
                                      {pesticides.length > 0 && (
                                        <optgroup label="Pesticides">
                                          {pesticides.map((mat) => (
                                            <option key={mat.materialId} value={mat.materialId}>
                                              {mat.name} ({mat.unit})
                                            </option>
                                          ))}
                                        </optgroup>
                                      )}
                                    </>
                                  )}
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
                                  placeholder="Quantity"
                                  className="w-28 rounded-md border border-gray-300 bg-white px-2 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded hover:text-red-700 transition-colors"
                                  title="Remove material"
                                >
                                  <Trash2 className="h-4 w-4" />
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
                    <p className="text-sm text-gray-500 italic text-center py-4">
                      No tasks added yet. Click "Add Task" to create a task for this stage.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 pt-4 pb-2 -mx-2 px-2">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {stages.length} stage{stages.length !== 1 ? 's' : ''} • {stages.reduce((sum, s) => sum + s.tasks.length, 0)} total tasks
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                isLoading={isLoading}
                disabled={isLoading}
                size="lg"
              >
                Create Standard Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SimpleDialog>
  );
};

