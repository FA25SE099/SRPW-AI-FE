import { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, DollarSign, GripVertical } from 'lucide-react';

import { SimpleDialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';
import { useCreateStandardPlan, CreateStandardPlanStage, CreateStandardPlanStageTask } from '../api/create-standard-plan';
import { useCategories } from '@/features/rice-varieties/api/get-categories';
import { useMaterials } from '@/features/materials/api/get-materials';
import { useCalculateMaterialsCost, MaterialCostItem } from '@/features/materials/api/calculate-materials-cost';
import { Material } from '@/types/api';

type CreateStandardPlanDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TASK_TYPES = ['LandPreparation', 'Fertilization', 'PestControl', 'Harvesting', 'Sowing'];
const PRIORITIES = ['Low', 'Normal', 'High', 'Critical'];

export const CreateStandardPlanDialog = ({
  isOpen,
  onClose,
}: CreateStandardPlanDialogProps) => {
  const { addNotification } = useNotifications();

  const [step, setStep] = useState<'basic' | 'stages' | 'preview'>('basic');
  const [materialCosts, setMaterialCosts] = useState<MaterialCostItem[]>([]);
  const [totalCostPerHa, setTotalCostPerHa] = useState<number>(0);

  // Form state
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [totalDurationDays, setTotalDurationDays] = useState<number>(120);
  const [stages, setStages] = useState<CreateStandardPlanStage[]>([
    {
      stageName: 'Chuẩn bị đất',
      sequenceOrder: 0,
      expectedDurationDays: 7,
      isMandatory: true,
      notes: '',
      tasks: [],
    },
  ]);
  const [draggedTask, setDraggedTask] = useState<{ stageIndex: number; taskIndex: number } | null>(null);

  // Queries
  const categoriesQuery = useCategories();
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
  const seedsQuery = useMaterials({
    params: {
      currentPage: 1,
      pageSize: 1000,
      type: 2
    }
  });

  const calculateCostMutation = useCalculateMaterialsCost();

  const createMutation = useCreateStandardPlan({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Tạo kế hoạch chuẩn thành công',
        });
        handleClose();
      },
      onError: (error: any) => {
        console.error('Create standard plan error:', error);
        console.error('Error response:', error.response?.data);

        const errorMessage = error.errors?.join('\n') || error.message || 'Không thể tạo kế hoạch chuẩn';
        addNotification({
          type: 'error',
          title: 'Lỗi',
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
        stageName: 'Chuẩn bị đất',
        sequenceOrder: 0,
        expectedDurationDays: 7,
        isMandatory: true,
        notes: '',
        tasks: [],
      },
    ]);
    setStep('basic');
    setMaterialCosts([]);
    setTotalCostPerHa(0);
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
      taskType: 'LandPreparation',
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
    if (field === 'materialId') {
      material.materialId = value as string;
    } else {
      material.quantityPerHa = value as number;
    }
    setStages(newStages);
  };

  const handleSubmit = () => {
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
        title: 'Lỗi xác thực',
        message: 'Tổng thời gian phải từ 1 đến 365 ngày',
      });
      return;
    }

    if (stages.length === 0) {
      addNotification({
        type: 'error',
        title: 'Lỗi xác thực',
        message: 'Vui lòng thêm ít nhất một giai đoạn',
      });
      return;
    }

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];

      if (!stage.stageName || !stage.stageName.trim()) {
        addNotification({
          type: 'error',
          title: 'Lỗi xác thực',
          message: `Giai đoạn ${i + 1} phải có tên`,
        });
        return;
      }

      if (stage.tasks.length === 0) {
        addNotification({
          type: 'error',
          title: 'Lỗi xác thực',
          message: `Giai đoạn "${stage.stageName}" phải có ít nhất một nhiệm vụ`,
        });
        return;
      }

      for (let j = 0; j < stage.tasks.length; j++) {
        const task = stage.tasks[j];
        if (!task.taskName || !task.taskName.trim()) {
          addNotification({
            type: 'error',
            title: 'Lỗi xác thực',
            message: `Nhiệm vụ ${j + 1} trong giai đoạn "${stage.stageName}" phải có tên`,
          });
          return;
        }
        if (!task.description || !task.description.trim()) {
          addNotification({
            type: 'error',
            title: 'Lỗi xác thực',
            message: `Nhiệm vụ "${task.taskName}" phải có mô tả`,
          });
          return;
        }
      }
    }

    const cleanedStages = stages.map(stage => ({
      ...stage,
      notes: stage.notes && stage.notes.trim() ? stage.notes : undefined,
      tasks: stage.tasks.map(task => ({
        taskName: task.taskName.trim(),
        description: task.description.trim(),
        daysAfter: task.daysAfter,
        durationDays: task.durationDays,
        taskType: task.taskType, // Should be: LandPreparation, Fertilization, etc.
        priority: task.priority,
        sequenceOrder: task.sequenceOrder,
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
    console.log('Task types being sent:', payload.stages.flatMap(s => s.tasks.map(t => t.taskType)));

    createMutation.mutate(payload);
  };

  // API client already unwraps the Result<T>, so data is directly the array
  const categories = (categoriesQuery.data as any) || [];

  const fertilizers = fertilizersQuery.data?.data || [];
  const pesticides = pesticidesQuery.data?.data || [];
  const seeds = seedsQuery.data?.data || [];
  const materials = [...fertilizers, ...pesticides, ...seeds];
  const isLoading = createMutation.isPending || fertilizersQuery.isLoading || pesticidesQuery.isLoading || seedsQuery.isLoading;

  const handleInsertStage = (position: number) => {
    const newStage: CreateStandardPlanStage = {
      stageName: '',
      sequenceOrder: position,
      expectedDurationDays: 7,
      isMandatory: true,
      notes: '',
      tasks: [],
    };

    const newStages = [...stages];
    newStages.splice(position, 0, newStage);

    // Update sequence orders for all stages after the inserted one
    newStages.forEach((stage, idx) => {
      stage.sequenceOrder = idx;
    });

    setStages(newStages);
  };

  const handleInsertTask = (stageIndex: number, position: number) => {
    const newStages = [...stages];
    const stage = newStages[stageIndex];
    const newTask: CreateStandardPlanStageTask = {
      taskName: '',
      description: '',
      daysAfter: 0,
      durationDays: 1,
      taskType: 'LandPreparation',
      priority: 'Normal',
      sequenceOrder: position,
      materials: [],
    };

    stage.tasks.splice(position, 0, newTask);

    // Update sequence orders
    stage.tasks.forEach((task, i) => {
      task.sequenceOrder = i;
    });

    setStages(newStages);
  };

  const handleMoveTaskLeft = (stageIndex: number, taskIndex: number) => {
    if (taskIndex === 0) return; // Can't move first task left

    const newStages = [...stages];
    const stage = newStages[stageIndex];
    const tasks = [...stage.tasks];

    // Swap with previous task
    [tasks[taskIndex - 1], tasks[taskIndex]] = [tasks[taskIndex], tasks[taskIndex - 1]];

    // Update sequence orders
    tasks.forEach((task, i) => {
      task.sequenceOrder = i;
    });

    stage.tasks = tasks;
    setStages(newStages);
  };

  const handleMoveTaskRight = (stageIndex: number, taskIndex: number) => {
    const newStages = [...stages];
    const stage = newStages[stageIndex];

    if (taskIndex === stage.tasks.length - 1) return; // Can't move last task right

    const tasks = [...stage.tasks];

    // Swap with next task
    [tasks[taskIndex], tasks[taskIndex + 1]] = [tasks[taskIndex + 1], tasks[taskIndex]];

    // Update sequence orders
    tasks.forEach((task, i) => {
      task.sequenceOrder = i;
    });

    stage.tasks = tasks;
    setStages(newStages);
  };

  const handleDragStart = (e: React.DragEvent, stageIndex: number, taskIndex: number) => {
    setDraggedTask({ stageIndex, taskIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDrop = (e: React.DragEvent, targetStageIndex: number, targetTaskIndex: number) => {
    e.preventDefault();
    if (!draggedTask) return;

    const sourceStageIndex = draggedTask.stageIndex;
    const sourceTaskIndex = draggedTask.taskIndex;

    if (sourceStageIndex === targetStageIndex && sourceTaskIndex === targetTaskIndex) {
      setDraggedTask(null);
      return;
    }

    const newStages = [...stages];
    newStages[sourceStageIndex] = { ...newStages[sourceStageIndex], tasks: [...newStages[sourceStageIndex].tasks] };
    if (sourceStageIndex !== targetStageIndex) {
      newStages[targetStageIndex] = { ...newStages[targetStageIndex], tasks: [...newStages[targetStageIndex].tasks] };
    }

    const sourceStage = newStages[sourceStageIndex];
    const targetStage = newStages[targetStageIndex];

    const [movedTask] = sourceStage.tasks.splice(sourceTaskIndex, 1);
    targetStage.tasks.splice(targetTaskIndex, 0, movedTask);

    newStages.forEach((stage) => {
      stage.tasks.forEach((task, i) => {
        task.sequenceOrder = i;
      });
    });

    setStages(newStages);
    setDraggedTask(null);
  };

  const handleToPreview = () => {
    // Validate before going to preview
    if (!planName || !categoryId) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    setStep('preview');

    // Calculate material costs for all tasks
    const tasksForCostCalculation = stages.flatMap((stage) =>
      stage.tasks
        .filter((task) => task.materials.some((m) => m.materialId && m.quantityPerHa > 0))
        .map((task) => ({
          taskName: task.taskName,
          taskDescription: task.description,
          materials: task.materials.filter((m) => m.materialId && m.quantityPerHa > 0),
        }))
    );

    if (tasksForCostCalculation.length > 0) {
      calculateCostMutation.mutate(
        {
          area: 1, // Calculate per hectare
          tasks: tasksForCostCalculation,
        },
        {
          onSuccess: (response) => {
            if (response?.materialCostItems) {
              setMaterialCosts(response.materialCostItems || []);
              setTotalCostPerHa(response.totalCostPerHa || 0);
            }
          },
          onError: (error: any) => {
            console.error('Failed to calculate costs:', error);
            addNotification({
              type: 'error',
              title: 'Tính toán chi phí thất bại',
              message: error?.message || 'Không thể tính toán chi phí vật liệu',
            });
          },
        }
      );
    } else {
      setMaterialCosts([]);
      setTotalCostPerHa(0);
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
              <h2 className="text-lg font-bold text-gray-900">
                Tạo Kế Hoạch Chuẩn
                {step === 'basic' && ' - Thông Tin Cơ Bản'}
                {step === 'stages' && ' - Giai Đoạn & Nhiệm Vụ'}
                {step === 'preview' && ' - Xem Trước'}
              </h2>
              {categoryId && (
                <p className="text-xs text-gray-600">
                  Danh mục: {categories.find((c: any) => c.id === categoryId)?.categoryName || 'Đang tải...'}
                </p>
              )}
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

            {/* Step 1: Basic Information */}
            {step === 'basic' && (
              <>
                <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900">Thông Tin Cơ Bản</h3>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1.5 col-span-2">
                      <label className="block text-xs font-medium text-gray-700">
                        Tên Kế Hoạch *
                      </label>
                      <input
                        type="text"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        disabled={isLoading}
                        className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder="VD: Lúa Đông Xuân 2025"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-700">
                        Danh Mục Lúa *
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
                          className="block w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">Chọn danh mục...</option>
                          {categories.map((category: any) => (
                            <option key={category.id} value={category.id}>
                              {category.categoryName}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-700">
                        Thời Gian (Ngày) *
                      </label>
                      <input
                        type="number"
                        value={totalDurationDays}
                        onChange={(e) => setTotalDurationDays(parseInt(e.target.value) || 0)}
                        disabled={isLoading}
                        min="1"
                        max="365"
                        className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder="120"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-4">
                      <label className="block text-xs font-medium text-gray-700">
                        Mô Tả (Tùy chọn)
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isLoading}
                        rows={2}
                        className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder="Mô tả kế hoạch canh tác chuẩn"
                      />
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t pt-3 pb-2 -mx-5 px-5">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleClose} disabled={isLoading} size="sm">
                      Hủy
                    </Button>
                    <Button
                      onClick={() => setStep('stages')}
                      disabled={!planName || !categoryId || isLoading}
                      size="sm"
                      icon={<ArrowRight className="h-4 w-4" />}
                    >
                      Tiếp: Giai Đoạn
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Stages Section */}
            {step === 'stages' && (
              <>
                {/* Stages Section */}
                <div className="rounded-lg border bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">Giai Đoạn & Nhiệm Vụ Canh Tác</h3>
                    <Button
                      size="sm"
                      onClick={handleAddStage}
                      disabled={isLoading}
                      icon={<Plus className="h-3.5 w-3.5" />}
                    >
                      Thêm Giai Đoạn
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {stages.map((stage, stageIndex) => (
                      <div key={stageIndex} className="relative">
                        {/* Add stage before button */}
                        {stageIndex === 0 && (
                          <button
                            type="button"
                            onClick={() => handleInsertStage(0)}
                            disabled={isLoading}
                            className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-md transition-colors"
                            title="Thêm giai đoạn trước"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        )}

                        <div className="rounded-lg border-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 p-3 shadow-sm">
                          {/* Stage Header */}
                          <div className="mb-3 flex items-start gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-xs flex-shrink-0">
                              {stageIndex + 1}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="grid grid-cols-12 gap-2">
                                <input
                                  type="text"
                                  value={stage.stageName}
                                  onChange={(e) =>
                                    handleUpdateStage(stageIndex, { stageName: e.target.value })
                                  }
                                  disabled={isLoading}
                                  placeholder="VD: Chuẩn bị đất, Gieo trồng"
                                  className="col-span-6 block w-full rounded-md border border-gray-300 bg-white px-2.5 py-1 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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
                                  placeholder="Ngày"
                                  className="col-span-3 block w-full rounded-md border border-gray-300 bg-white px-2.5 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                />
                                <div className="col-span-3 flex items-center gap-2">
                                  <label className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs w-full justify-center">
                                    <input
                                      type="checkbox"
                                      checked={stage.isMandatory}
                                      onChange={(e) =>
                                        handleUpdateStage(stageIndex, {
                                          isMandatory: e.target.checked,
                                        })
                                      }
                                      disabled={isLoading}
                                      className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="font-medium">Bắt buộc</span>
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
                                placeholder="Ghi chú giai đoạn"
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
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {/* Tasks Grid */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-md bg-blue-50 px-2.5 py-1.5">
                              <span className="text-xs font-semibold text-blue-900">
                                Nhiệm Vụ ({stage.tasks.length})
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddTask(stageIndex)}
                                disabled={isLoading}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                              >
                                <Plus className="h-3 w-3" />
                                Thêm Nhiệm Vụ
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2.5">
                              {stage.tasks.map((task, taskIndex) => (
                                <div
                                  key={taskIndex}
                                  className={`relative ${draggedTask?.stageIndex === stageIndex && draggedTask?.taskIndex === taskIndex ? 'opacity-50' : ''}`}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, stageIndex, taskIndex)}
                                >
                                  {/* Add task before button */}
                                  {taskIndex === 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleInsertTask(stageIndex, 0)}
                                      disabled={isLoading}
                                      className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-md transition-colors"
                                      title="Thêm nhiệm vụ trước"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  )}

                                  <div className="rounded-md border-2 border-blue-200 bg-white p-2.5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-1">
                                        <div
                                          className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
                                          draggable
                                          onDragStart={(e) => handleDragStart(e, stageIndex, taskIndex)}
                                          onDragEnd={handleDragEnd}
                                        >
                                          <GripVertical className="h-4 w-4" />
                                        </div>
                                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold">
                                          {taskIndex + 1}
                                        </span>
                                        <div className="flex gap-0.5">
                                          <button
                                            type="button"
                                            onClick={() => handleMoveTaskLeft(stageIndex, taskIndex)}
                                            disabled={isLoading || taskIndex === 0}
                                            className="rounded p-0.5 text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Di chuyển nhiệm vụ sang trái"
                                          >
                                            <ChevronLeft className="h-3 w-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleMoveTaskRight(stageIndex, taskIndex)}
                                            disabled={isLoading || taskIndex === stage.tasks.length - 1}
                                            className="rounded p-0.5 text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Di chuyển nhiệm vụ sang phải"
                                          >
                                            <ChevronRight className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </div>
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
                                      <input
                                        type="text"
                                        value={task.taskName}
                                        onChange={(e) =>
                                          handleUpdateTask(stageIndex, taskIndex, {
                                            taskName: e.target.value,
                                          })
                                        }
                                        disabled={isLoading}
                                        placeholder="Tên nhiệm vụ"
                                        className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                      />

                                      <textarea
                                        value={task.description}
                                        onChange={(e) =>
                                          handleUpdateTask(stageIndex, taskIndex, {
                                            description: e.target.value,
                                          })
                                        }
                                        disabled={isLoading}
                                        placeholder="Mô tả"
                                        rows={2}
                                        className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                      />

                                      <div className="grid grid-cols-2 gap-1.5">
                                        <div className="space-y-0.5">
                                          <label className="block text-[10px] font-medium text-gray-600">Sau Ngày</label>
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
                                          <label className="block text-[10px] font-medium text-gray-600">Thời Gian</label>
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
                                        <label className="block text-[10px] font-medium text-gray-600">Loại Nhiệm Vụ</label>
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
                                          <option value="LandPreparation">Chuẩn bị đất</option>
                                          <option value="Fertilization">Bón phân</option>
                                          <option value="PestControl">Kiểm soát sâu bệnh</option>
                                          <option value="Harvesting">Thu hoạch</option>
                                          <option value="Sowing">Gieo trồng</option>
                                        </select>
                                      </div>

                                      <div className="space-y-0.5">
                                        <label className="block text-[10px] font-medium text-gray-600">Ưu Tiên</label>
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
                                          {PRIORITIES.map((priority) => {
                                            const priorityLabels: { [key: string]: string } = {
                                              'Low': 'Thấp',
                                              'Normal': 'Bình thường',
                                              'High': 'Cao',
                                              'Critical': 'Khẩn cấp'
                                            };
                                            return (
                                              <option key={priority} value={priority}>
                                                {priorityLabels[priority] || priority}
                                              </option>
                                            );
                                          })}
                                        </select>
                                      </div>

                                      {/* Materials */}
                                      <div className="rounded-md border border-gray-200 bg-gray-50 p-1.5 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-semibold text-gray-700">
                                            Vật Liệu
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleAddMaterial(stageIndex, taskIndex)}
                                            disabled={isLoading}
                                            className="text-[10px] font-medium text-blue-600 hover:text-blue-700 underline"
                                          >
                                            + Thêm
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
                                              disabled={isLoading || fertilizersQuery.isLoading || pesticidesQuery.isLoading}
                                              className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
                                            >
                                              <option value="">Chọn vật liệu...</option>
                                              {fertilizersQuery.isLoading || pesticidesQuery.isLoading ? (
                                                <option disabled>Đang tải...</option>
                                              ) : (
                                                <>
                                                  {fertilizers.length > 0 && (
                                                    <optgroup label="Phân bón">
                                                      {fertilizers.map((mat: Material) => (
                                                        <option key={mat.materialId} value={mat.materialId}>
                                                          {mat.name} ({mat.unit})
                                                        </option>
                                                      ))}
                                                    </optgroup>
                                                  )}
                                                  {pesticides.length > 0 && (
                                                    <optgroup label="Thuốc trừ sâu">
                                                      {pesticides.map((mat: Material) => (
                                                        <option key={mat.materialId} value={mat.materialId}>
                                                          {mat.name} ({mat.unit})
                                                        </option>
                                                      ))}
                                                    </optgroup>
                                                  )}
                                                  {seeds.length > 0 && (
                                                    <optgroup label="Hạt giống">
                                                      {seeds.map((mat: Material) => (
                                                        <option key={mat.materialId} value={mat.materialId}>
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
                                                    parseFloat(e.target.value) || 0
                                                  )
                                                }
                                                disabled={isLoading}
                                                min="0"
                                                step="0.1"
                                                placeholder="Số lượng/ha"
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
                                            Không có vật liệu
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Add task after button */}
                                  <button
                                    type="button"
                                    onClick={() => handleInsertTask(stageIndex, taskIndex + 1)}
                                    disabled={isLoading}
                                    className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-md transition-colors"
                                    title="Thêm nhiệm vụ sau"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {stage.tasks.length === 0 && (
                              <p className="text-xs text-gray-500 italic text-center py-4 bg-gray-50 rounded-md">
                                Chưa có nhiệm vụ. Nhấp "Thêm Nhiệm Vụ" để tạo.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Add stage after button */}
                        <button
                          type="button"
                          onClick={() => handleInsertStage(stageIndex + 1)}
                          disabled={isLoading}
                          className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-md transition-colors"
                          title="Thêm giai đoạn sau"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t pt-3 pb-2 -mx-5 px-5">
                  <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={() => setStep('basic')} disabled={isLoading} size="sm">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Quay lại
                    </Button>
                    <div className="flex gap-2 items-center">
                      <p className="text-xs text-gray-600">
                        {stages.length} giai đoạn • {stages.reduce((sum, s) => sum + s.tasks.length, 0)} nhiệm vụ
                      </p>
                      <Button
                        onClick={handleToPreview}
                        disabled={isLoading || stages.length === 0}
                        size="sm"
                        icon={<ArrowRight className="h-4 w-4" />}
                      >
                        Tiếp: Xem Trước
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Preview */}
            {step === 'preview' && (
              <>
                {/* Summary */}
                <div className="rounded-lg border bg-gray-50 p-4">
                  <h4 className="font-semibold text-gray-900">{planName}</h4>
                  <p className="mt-2 text-sm text-gray-600">{description || 'Không có mô tả'}</p>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Thời gian:</span>{' '}
                      <span className="text-gray-900">{totalDurationDays} ngày</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Danh mục:</span>{' '}
                      <span className="text-gray-900">
                        {categories.find((c: any) => c.id === categoryId)?.categoryName || 'Không xác định'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stages Overview */}
                <div className="max-h-[400px] overflow-y-auto rounded-lg border">
                  <div className="space-y-3 p-4">
                    <h4 className="sticky top-0 z-10 bg-white pb-2 font-semibold text-gray-900">
                      Giai Đoạn & Nhiệm Vụ ({stages.length} giai đoạn, {stages.reduce((sum, s) => sum + s.tasks.length, 0)} nhiệm vụ)
                    </h4>
                    {stages.map((stage, idx) => (
                      <div key={idx} className="rounded-lg border bg-white p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                            {stage.sequenceOrder + 1}
                          </span>
                          <span className="font-medium text-gray-900">{stage.stageName}</span>
                          <span className="text-xs text-gray-500">
                            • {stage.expectedDurationDays} ngày
                            {stage.isMandatory && ' • Bắt buộc'}
                          </span>
                        </div>
                        {stage.notes && (
                          <p className="mb-2 text-xs italic text-gray-600">{stage.notes}</p>
                        )}
                        {stage.tasks.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {stage.tasks.map((task, taskIdx) => (
                              <div key={taskIdx} className="border-l-2 border-gray-200 pl-4 text-sm">
                                <div className="font-medium text-gray-700">{task.taskName}</div>
                                {task.description && (
                                  <div className="text-xs text-gray-500">{task.description}</div>
                                )}
                                <div className="text-xs text-gray-500">
                                  Ngày {task.daysAfter} • Thời gian: {task.durationDays} ngày • {task.taskType} • Ưu tiên: {task.priority}
                                </div>
                                {task.materials.length > 0 && (
                                  <div className="mt-1 space-y-1">
                                    <div className="text-xs text-gray-600">
                                      Vật liệu:{' '}
                                      {task.materials
                                        .map((m) => {
                                          const mat = [...fertilizers, ...pesticides].find(
                                            (mat) => mat.materialId === m.materialId
                                          );
                                          const costItem = materialCosts.find(
                                            (c) => c.materialId === m.materialId
                                          );
                                          return mat
                                            ? `${mat.name} (${m.quantityPerHa} ${mat.unit}/ha${costItem ? ` - ${costItem.costPerHa.toFixed(0)} VND/ha` : ''})`
                                            : '';
                                        })
                                        .filter(Boolean)
                                        .join(', ')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost Summary */}
                {stages.some((s) => s.tasks.some((t) => t.materials.length > 0)) && (
                  <div className="rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        Ước Tính Chi Phí (mỗi hecta)
                      </h4>
                      {calculateCostMutation.isPending && <Spinner size="sm" />}
                    </div>
                    {calculateCostMutation.isPending ? (
                      <div className="py-4 text-center text-gray-500">
                        Đang tính toán chi phí...
                      </div>
                    ) : materialCosts.length === 0 ? (
                      <div className="py-4 text-center text-gray-500">
                        Không thể tải thông tin chi phí
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {materialCosts.map((item) => (
                          <div
                            key={item.materialId}
                            className="flex items-center justify-between rounded-md bg-white p-3 text-sm"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {item.materialName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.quantityPerHa} {item.unit}/ha • Cần {item.packagesNeeded}{' '}
                                gói ({item.amountPerMaterial} {item.unit}/gói)
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-700">
                                {item.costPerHa.toFixed(0)} VND/ha
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.pricePerMaterial} VND/package
                              </p>
                            </div>
                          </div>
                        ))}
                        <div className="mt-3 flex items-center justify-between border-t pt-3">
                          <p className="text-lg font-bold text-gray-900">Tổng Chi Phí</p>
                          <p className="text-2xl font-bold text-green-700">
                            {totalCostPerHa.toFixed(0)} VND/ha
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t pt-3 pb-2 -mx-5 px-5">
                  <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={() => setStep('stages')} disabled={isLoading} size="sm">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Quay lại
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      isLoading={isLoading}
                      disabled={isLoading}
                      size="sm"
                    >
                      Tạo Kế Hoạch
                    </Button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
