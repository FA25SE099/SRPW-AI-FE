import { useQueryClient } from '@tanstack/react-query';
import {
  Package,
  FileText,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Bug,
  Cloud,
  Edit,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/components/ui/notifications';
import { Spinner } from '@/components/ui/spinner';
import { useMaterials } from '@/features/materials/api/get-materials';
import { useCalculateMaterialsCost, MaterialCostItem } from '@/features/materials/api/calculate-materials-cost';
import { useCategories } from '@/features/rice-varieties/api/get-categories';

import {
  useCreateEmergencyProtocol,
  CreateEmergencyProtocolDTO,
} from '../api/create-emergency-protocol';
import { useEmergencyProtocol } from '../api/get-emergency-protocol';
import type { EmergencyProtocol } from '../api/get-emergency-protocols';
import {
  usePestProtocols,
  useCreatePestProtocol,
} from '../api/get-pest-protocols';
import { useRiceVarietiesSimple } from '../api/get-rice-varieties-simple';
import {
  useWeatherProtocols,
  useCreateWeatherProtocol,
} from '../api/get-weather-protocols';
import { useUpdateEmergencyProtocol } from '../api/update-emergency-protocol';

import { PestProtocolDialog } from './pest-protocol-dialog';
import { ThresholdDialog } from './threshold-dialog';
import { WeatherProtocolDialog } from './weather-protocol-dialog';

type CreateEmergencyProtocolDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  protocol?: EmergencyProtocol | null;
};

type FormData = {
  categoryId: string;
  planName: string;
  description: string;
  totalDurationDays: number;
  isActive: boolean;
};

type EditableStage = {
  stageName: string;
  sequenceOrder: number;
  expectedDurationDays: number;
  isMandatory: boolean;
  notes?: string;
  tasks: EditableTask[];
};

type EditableTask = {
  taskName: string;
  description?: string;
  daysAfter: number;
  durationDays: number;
  taskType: string;
  priority: string;
  sequenceOrder: number;
  materials: {
    materialId: string;
    quantityPerHa: number;
  }[];
};

type EditableThreshold = {
  pestProtocolId?: string;
  weatherProtocolId?: string;
  pestAffectType?: string;
  pestSeverityLevel?: string;
  pestAreaThresholdPercent?: number;
  pestPopulationThreshold?: string;
  pestDamageThresholdPercent?: number;
  pestGrowthStage?: string;
  pestThresholdNotes?: string;
  weatherEventType?: string;
  weatherIntensityLevel?: string;
  weatherMeasurementThreshold?: number;
  weatherMeasurementUnit?: string;
  weatherThresholdOperator?: string;
  weatherDurationDaysThreshold?: number;
  weatherThresholdNotes?: string;
  applicableSeason?: string;
  riceVarietyId?: string;
  priority?: number;
  generalNotes?: string;
};

const TASK_TYPES = [
  'LandPreparation',
  'Fertilization',
  'PestControl',
  'Harvesting',
  'Sowing',
];
const PRIORITIES = ['Low', 'Normal', 'High', 'Critical'];
const SEASONS = ['Spring-Summer', 'Autumn-Winter', 'Year-Round', 'All-Season'];
const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
const THRESHOLD_OPERATORS = [
  'Greater Than',
  'Less Than',
  'Equal To',
  'Between',
];
const PRIORITY_LEVELS = [1, 2, 3, 4, 5];

export const CreateEmergencyProtocolDialog = ({
  isOpen,
  onClose,
  protocol,
}: CreateEmergencyProtocolDialogProps) => {
  // Move this FIRST, before any hooks that use it
  const isEditMode = !!protocol;

  console.log('🎬 Dialog Render:', { isOpen, hasProtocol: !!protocol, protocolId: protocol?.id, isEditMode });

  const [step, setStep] = useState<
    'basic' | 'tasks' | 'thresholds' | 'preview'
  >('basic');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [editableStages, setEditableStages] = useState<EditableStage[]>([
    {
      stageName: 'Xử lý',
      sequenceOrder: 0,
      expectedDurationDays: 0,
      isMandatory: true,
      notes: 'Xử lý khẩn cấp',
      tasks: [],
    },
  ]);
  const [editableThresholds, setEditableThresholds] = useState<
    EditableThreshold[]
  >([]);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: boolean;
  }>({});

  const [isPestProtocolDialogOpen, setIsPestProtocolDialogOpen] =
    useState(false);
  const [isWeatherProtocolDialogOpen, setIsWeatherProtocolDialogOpen] =
    useState(false);
  const [isThresholdDialogOpen, setIsThresholdDialogOpen] = useState(false);
  const [editingThresholdIndex, setEditingThresholdIndex] = useState<
    number | null
  >(null);
  const [materialCosts, setMaterialCosts] = useState<MaterialCostItem[]>([]);
  const [totalCostPerHa, setTotalCostPerHa] = useState<number>(0);

  const [newPestProtocol, setNewPestProtocol] = useState({
    name: '',
    description: '',
    type: '',
    imageLinks: [] as string[],
    notes: '',
    isActive: true,
  });

  const [newWeatherProtocol, setNewWeatherProtocol] = useState({
    name: '',
    description: '',
    source: '',
    sourceLink: '',
    imageLinks: [] as string[],
    notes: '',
    isActive: true,
  });

  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      isActive: true,
      totalDurationDays: 30,
    },
  });

  const planName = watch('planName');
  const description = watch('description');
  const categoryId = watch('categoryId');

  const categoriesQuery = useCategories();
  const { data: pestProtocolsData } = usePestProtocols({
    params: { currentPage: 1, pageSize: 100, isActive: true },
  });
  const { data: weatherProtocolsData } = useWeatherProtocols({
    params: { currentPage: 1, pageSize: 100, isActive: true },
  });
  const { data: riceVarietiesResponse } = useRiceVarietiesSimple();
  const fertilizersQuery = useMaterials({
    params: { currentPage: 1, pageSize: 1000, type: 0 },
  });
  const pesticidesQuery = useMaterials({
    params: { currentPage: 1, pageSize: 1000, type: 1 },
  });
  const seedsQuery = useMaterials({
    params: { currentPage: 1, pageSize: 1000, type: 2 },
  });

  const calculateCostMutation = useCalculateMaterialsCost();

  const createProtocolMutation = useCreateEmergencyProtocol({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Thành Công',
          message: 'Đã tạo quy trình khẩn cấp thành công',
        });
        handleClose();
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Lỗi',
          message: error.message || 'Tạo quy trình khẩn cấp thất bại',
        });
      },
    },
  });

  const createPestProtocolMutation = useCreatePestProtocol({
    mutationConfig: {
      onSuccess: (response: any) => {
        addNotification({
          type: 'success',
          title: 'Thành Công',
          message: 'Đã tạo quy trình sâu bệnh thành công',
        });
        setIsPestProtocolDialogOpen(false);
        setNewPestProtocol({
          name: '',
          description: '',
          type: '',
          imageLinks: [],
          notes: '',
          isActive: true,
        });

        // Refetch pest protocols list
        queryClient.invalidateQueries({ queryKey: ['pest-protocols'] });

        // Auto-select the newly created pest protocol in threshold dialog
        if (response?.data?.id && isThresholdDialogOpen) {
          // Wait a bit for the list to refresh, then set the value
          setTimeout(() => {
            const thresholdIndex =
              editingThresholdIndex !== null
                ? editingThresholdIndex
                : editableThresholds.length;
            // The threshold dialog will pick this up automatically after refetch
          }, 500);
        }
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Lỗi',
          message: error.message || 'Tạo quy trình sâu bệnh thất bại',
        });
      },
    },
  });

  const createWeatherProtocolMutation = useCreateWeatherProtocol({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Thành Công',
          message: 'Đã tạo quy trình thời tiết thành công',
        });
        setIsWeatherProtocolDialogOpen(false);
        setNewWeatherProtocol({
          name: '',
          description: '',
          source: '',
          sourceLink: '',
          imageLinks: [],
          notes: '',
          isActive: true,
        });

        // Refetch weather protocols list
        queryClient.invalidateQueries({ queryKey: ['weather-protocols'] });
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Lỗi',
          message: error.message || 'Tạo quy trình thời tiết thất bại',
        });
      },
    },
  });

  // Now the useEmergencyProtocol hook can use isEditMode
  const {
    data: protocolDetailsResponse,
    isLoading: isLoadingDetails,
    error,
  } = useEmergencyProtocol({
    protocolId: protocol?.id || '',
    queryConfig: {
      enabled: isEditMode && isOpen && !!protocol?.id,
    },
  });

  console.log('🔍 Edit Mode Query State:', {
    protocolId: protocol?.id,
    isEditMode,
    isOpen,
    isLoadingDetails,
    hasResponse: !!protocolDetailsResponse,
    responseSucceeded: protocolDetailsResponse?.succeeded,
    hasDirectData: !!(protocolDetailsResponse as any)?.id,
    error,
    fullResponse: protocolDetailsResponse,
  });

  // Handle both wrapped and unwrapped responses
  const protocolDetails = protocolDetailsResponse?.data
    ? protocolDetailsResponse
    : (protocolDetailsResponse as any)?.id
      ? { succeeded: true, data: protocolDetailsResponse as any }
      : protocolDetailsResponse;

  console.log('🔄 Protocol Details Transform:', {
    hasResponse: !!protocolDetailsResponse,
    hasDataProp: !!protocolDetailsResponse?.data,
    hasIdDirectly: !!(protocolDetailsResponse as any)?.id,
    transformed: protocolDetails,
    hasTransformedData: !!protocolDetails?.data,
  });

  const updateProtocolMutation = useUpdateEmergencyProtocol({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Thành Công',
          message: 'Đã cập nhật quy trình khẩn cấp thành công',
        });
        handleClose();
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Lỗi',
          message: error.message || 'Cập nhật quy trình khẩn cấp thất bại',
        });
      },
    },
  });

  // Load existing data when editing
  useEffect(() => {
    console.log('📝 Edit Effect Check:', {
      isEditMode,
      hasProtocolDetails: !!protocolDetails,
      hasData: !!protocolDetails?.data,
      isOpen,
      isLoadingDetails,
      protocolId: protocol?.id,
    });

    if (isEditMode && protocolDetails?.data && isOpen && !isLoadingDetails) {
      console.log('📝 Populating form with protocol data:', protocolDetails);

      // Set basic form data
      const basicData: FormData = {
        categoryId: protocolDetails.data.categoryId,
        planName: protocolDetails.data.planName,
        description: protocolDetails.data.description,
        totalDurationDays: protocolDetails.data.totalDurationDays,
        isActive: protocolDetails.data.isActive,
      };

      setFormData(basicData);

      // IMPORTANT: Set ALL form values to populate the input fields
      setValue('categoryId', basicData.categoryId, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('planName', basicData.planName, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('description', basicData.description, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('totalDurationDays', basicData.totalDurationDays, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('isActive', basicData.isActive, {
        shouldValidate: true,
        shouldDirty: true,
      });

      // Convert stages to editable format
      const convertedStages: EditableStage[] = protocolDetails.data.stages.map(
        (stage: any) => ({
          stageName: stage.stageName,
          sequenceOrder: stage.sequenceOrder,
          expectedDurationDays: stage.expectedDurationDays,
          isMandatory: stage.isMandatory,
          notes: stage.notes || undefined,
          tasks: stage.tasks.map((task: any) => ({
            taskName: task.taskName,
            description: task.description || '',
            daysAfter: task.daysAfter,
            durationDays: task.durationDays,
            taskType: task.taskType,
            priority: task.priority,
            sequenceOrder: task.sequenceOrder,
            materials: task.materials.map((m: any) => ({
              materialId: m.materialId,
              quantityPerHa: m.quantityPerHa,
            })),
          })),
        }),
      );

      setEditableStages(convertedStages);
      console.log('📋 Loaded stages:', convertedStages);

      // Convert thresholds to editable format
      const convertedThresholds: EditableThreshold[] =
        protocolDetails.data.thresholds.map((t: any) => ({
          pestProtocolId: t.pestProtocolId || undefined,
          weatherProtocolId: t.weatherProtocolId || undefined,
          pestAffectType: t.pestAffectType || undefined,
          pestSeverityLevel: t.pestSeverityLevel || undefined,
          pestAreaThresholdPercent: t.pestAreaThresholdPercent,
          pestPopulationThreshold: t.pestPopulationThreshold || undefined,
          pestDamageThresholdPercent: t.pestDamageThresholdPercent,
          pestGrowthStage: t.pestGrowthStage || undefined,
          pestThresholdNotes: t.pestThresholdNotes || undefined,
          weatherEventType: t.weatherEventType || undefined,
          weatherIntensityLevel: t.weatherIntensityLevel || undefined,
          weatherMeasurementThreshold: t.weatherMeasurementThreshold,
          weatherMeasurementUnit: t.weatherMeasurementUnit || undefined,
          weatherThresholdOperator: t.weatherThresholdOperator || undefined,
          weatherDurationDaysThreshold: t.weatherDurationDaysThreshold,
          weatherThresholdNotes: t.weatherThresholdNotes || undefined,
          applicableSeason: t.applicableSeason || undefined,
          riceVarietyId: t.riceVarietyId || undefined,
          priority: t.priority,
          generalNotes: t.generalNotes || undefined,
        }));

      setEditableThresholds(convertedThresholds);
      console.log('🎯 Loaded thresholds:', convertedThresholds);

      console.log('✅ Form populated successfully');
    }
  }, [isEditMode, protocolDetails?.data, isLoadingDetails, isOpen, setValue, protocol?.id]);

  // Debug material costs changes
  useEffect(() => {
    console.log('💰 Material Costs State Changed:', {
      count: materialCosts.length,
      total: totalCostPerHa,
      costs: materialCosts,
    });
  }, [materialCosts, totalCostPerHa]);

  const handleBasicInfo = (data: FormData) => {
    setFormData(data);
    setStep('tasks');
  };

  const handleToThresholds = () => {
    const errors: string[] = [];
    const newValidationErrors: { [key: string]: boolean } = {};

    // Check if there's at least one task
    const stage = editableStages[0];
    if (!stage || stage.tasks.length === 0) {
      errors.push('Cần ít nhất một nhiệm vụ');
    }

    if (stage) {
      stage.tasks.forEach((task, taskIndex) => {
        const taskKey = `task-${taskIndex}`;

        // Check task name
        if (!task.taskName || task.taskName.trim() === '') {
          errors.push(`Nhiệm vụ ${taskIndex + 1} thiếu tên`);
          newValidationErrors[taskKey] = true;
        }
      });
    }

    setValidationErrors(newValidationErrors);

    if (errors.length > 0) {
      addNotification({
        type: 'error',
        title: 'Lỗi Xác Thực',
        message: errors.join(', '),
      });
      return;
    }

    setStep('thresholds');
  };

  const handleToPreview = () => {
    setStep('preview');

    // Calculate material costs for all tasks
    const allMaterials = editableStages.flatMap(stage =>
      stage.tasks.flatMap(task => task.materials)
    ).filter(m => m.materialId && m.quantityPerHa > 0);

    console.log('💰 Preview - Materials to calculate:', allMaterials);

    if (allMaterials.length > 0) {
      calculateCostMutation.mutate(
        {
          area: 1, // Calculate per hectare
          tasks: [
            {
              taskName: 'Emergency Protocol Tasks',
              materials: allMaterials,
            },
          ],
        },
        {
          onSuccess: (response) => {
            console.log('✅ Cost calculation response:', response);
            // API returns data directly, not wrapped in succeeded/data
            if (response?.materialCostItems) {
              setMaterialCosts(response.materialCostItems || []);
              setTotalCostPerHa(response.totalCostPerHa || 0);
              console.log('✅ Cost data set successfully:', {
                itemCount: response.materialCostItems.length,
                total: response.totalCostPerHa,
                items: response.materialCostItems,
              });
            } else {
              console.warn('⚠️ Cost calculation returned unexpected structure:', response);
            }
          },
          onError: (error: any) => {
            console.error('❌ Failed to calculate costs:', error);
            addNotification({
              type: 'error',
              title: 'Tính Toán Chi Phí Thất Bại',
              message: error?.message || 'Không thể tính toán chi phí vật liệu',
            });
          },
        }
      );
    } else {
      console.log('💰 No materials to calculate costs for');
      setMaterialCosts([]);
      setTotalCostPerHa(0);
    }
  };

  const handleCreateOrUpdateProtocol = () => {
    if (!formData || !editableStages.length) return;

    // Calculate total duration from all tasks based on daysAfter + durationDays
    const stage = editableStages[0];
    const totalDuration = stage.tasks.reduce(
      (max, task) => Math.max(max, task.daysAfter + task.durationDays),
      0,
    );

    const createData: CreateEmergencyProtocolDTO = {
      categoryId: formData.categoryId,
      planName: formData.planName,
      description: formData.description,
      totalDurationDays: formData.totalDurationDays,
      isActive: formData.isActive,
      stages: [
        {
          stageName: 'Xử lý',
          sequenceOrder: 1,
          expectedDurationDays: totalDuration,
          isMandatory: true,
          notes: 'Xử lý khẩn cấp',
          tasks: stage.tasks.map((task) => ({
            taskName: task.taskName,
            description: task.description || '',
            daysAfter: task.daysAfter,
            durationDays: task.durationDays,
            taskType: task.taskType,
            priority: task.priority,
            sequenceOrder: task.sequenceOrder,
            materials: task.materials.filter(
              (m) => m.materialId && m.quantityPerHa > 0,
            ),
          })) as any,
        },
      ],
      thresholds: editableThresholds.map((threshold) => ({
        pestProtocolId: threshold.pestProtocolId || undefined,
        weatherProtocolId: threshold.weatherProtocolId || undefined,
        pestAffectType: threshold.pestAffectType,
        pestSeverityLevel: threshold.pestSeverityLevel,
        pestAreaThresholdPercent: threshold.pestAreaThresholdPercent,
        pestPopulationThreshold: threshold.pestPopulationThreshold,
        pestDamageThresholdPercent: threshold.pestDamageThresholdPercent,
        pestGrowthStage: threshold.pestGrowthStage,
        pestThresholdNotes: threshold.pestThresholdNotes,
        weatherEventType: threshold.weatherEventType,
        weatherIntensityLevel: threshold.weatherIntensityLevel,
        weatherMeasurementThreshold: threshold.weatherMeasurementThreshold,
        weatherMeasurementUnit: threshold.weatherMeasurementUnit,
        weatherThresholdOperator: threshold.weatherThresholdOperator,
        weatherDurationDaysThreshold: threshold.weatherDurationDaysThreshold,
        weatherThresholdNotes: threshold.weatherThresholdNotes,
        applicableSeason: threshold.applicableSeason,
        riceVarietyId: threshold.riceVarietyId,
        priority: threshold.priority,
        generalNotes: threshold.generalNotes,
      })),
    };

    if (isEditMode && protocol) {
      updateProtocolMutation.mutate({
        emergencyProtocolId: protocol.id,
        ...createData,
      } as any);
    } else {
      createProtocolMutation.mutate(createData);
    }
  };

  const handleClose = () => {
    // Always reset form state when closing
    reset({
      isActive: true,
      totalDurationDays: 30,
      categoryId: '',
      planName: '',
      description: '',
    });
    setFormData(null);
    setEditableStages([
      {
        stageName: 'Xử lý',
        sequenceOrder: 1,
        expectedDurationDays: 0,
        isMandatory: true,
        notes: 'Xử lý khẩn cấp',
        tasks: [],
      },
    ]);
    setEditableThresholds([]);
    setMaterialCosts([]);
    setTotalCostPerHa(0);
    setStep('basic');
    setValidationErrors({});
    setEditingThresholdIndex(null);
    onClose();
  };

  const handleAddStage = () => {
    setEditableStages([
      ...editableStages,
      {
        stageName: '',
        sequenceOrder: editableStages.length,
        expectedDurationDays: 7,
        isMandatory: true,
        tasks: [],
      },
    ]);
  };

  // Add this function after handleAddStage:
  const handleInsertStage = (position: number) => {
    const newStage: EditableStage = {
      stageName: '',
      sequenceOrder: position,
      expectedDurationDays: 7,
      isMandatory: true,
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

  const handleUpdateStage = (
    index: number,
    updates: Partial<EditableStage>,
  ) => {
    const newStages = [...editableStages];
    newStages[index] = { ...newStages[index], ...updates };
    setEditableStages(newStages);

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
      daysAfter: 0,
      durationDays: 1,
      taskType: 'LandPreparation',
      priority: 'Normal',
      sequenceOrder: stage.tasks.length,
      materials: [],
    });
    setEditableStages(newStages);
  };

  // Add this function after handleAddTask:
  const handleInsertTask = (stageIndex: number, position: number) => {
    const newStages = [...editableStages];
    const stage = newStages[stageIndex];
    const newTask: EditableTask = {
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

    setEditableStages(newStages);
  };

  const handleMoveTaskLeft = (stageIndex: number, taskIndex: number) => {
    if (taskIndex === 0) return; // Can't move first task left

    const newStages = [...editableStages];
    const stage = newStages[stageIndex];
    const tasks = [...stage.tasks];

    // Swap with previous task
    [tasks[taskIndex - 1], tasks[taskIndex]] = [tasks[taskIndex], tasks[taskIndex - 1]];

    // Update sequence orders
    tasks.forEach((task, i) => {
      task.sequenceOrder = i;
    });

    stage.tasks = tasks;
    setEditableStages(newStages);
  };

  const handleMoveTaskRight = (stageIndex: number, taskIndex: number) => {
    const newStages = [...editableStages];
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
    updates: Partial<EditableTask>,
  ) => {
    const newStages = [...editableStages];
    newStages[stageIndex].tasks[taskIndex] = {
      ...newStages[stageIndex].tasks[taskIndex],
      ...updates,
    };
    setEditableStages(newStages);

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

  const handleRemoveMaterial = (
    stageIndex: number,
    taskIndex: number,
    materialIndex: number,
  ) => {
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
    value: string | number,
  ) => {
    const newStages = [...editableStages];
    const material: any =
      newStages[stageIndex].tasks[taskIndex].materials[materialIndex];
    material[field] = value as any;
    setEditableStages(newStages);
  };

  const handleAddThreshold = (threshold: EditableThreshold) => {
    setEditableThresholds([...editableThresholds, threshold]);
    setIsThresholdDialogOpen(false);
  };

  const handleRemoveThreshold = (index: number) => {
    setEditableThresholds(editableThresholds.filter((_, i) => i !== index));
  };

  const categories = (categoriesQuery.data as any) || [];
  const pestProtocols = pestProtocolsData?.data || [];
  const weatherProtocols = weatherProtocolsData?.data || [];
  const riceVarieties = riceVarietiesResponse?.data || [];
  const fertilizers = fertilizersQuery.data?.data || [];
  const pesticides = pesticidesQuery.data?.data || [];
  const seeds = seedsQuery.data?.data || [];
  const isLoading =
    createProtocolMutation.isPending ||
    updateProtocolMutation.isPending ||
    isLoadingDetails ||
    fertilizersQuery.isLoading ||
    pesticidesQuery.isLoading ||
    seedsQuery.isLoading;

  const getTitle = () => {
    const prefix = isEditMode ? 'Chỉnh Sửa' : 'Tạo';
    switch (step) {
      case 'basic':
        return `${prefix} Quy Trình Khẩn Cấp - Thông Tin Cơ Bản`;
      case 'tasks':
        return `${prefix} Quy Trình Khẩn Cấp - Nhiệm Vụ`;
      case 'thresholds':
        return `${prefix} Quy Trình Khẩn Cấp - Ngưỡng`;
      case 'preview':
        return `${prefix} Quy Trình Khẩn Cấp - Xem Xét`;
      default:
        return `${prefix} Quy Trình Khẩn Cấp`;
    }
  };

  // Show loading state while fetching details
  if (isEditMode && isLoadingDetails) {
    return (
      <div className={isOpen ? 'fixed inset-0 z-50 overflow-y-auto' : 'hidden'}>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
            <div className="text-center">
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">Đang tải chi tiết quy trình...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isOpen ? 'fixed inset-0 z-50 overflow-y-auto' : 'hidden'}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

        <div className="relative z-10 w-[90vw] max-w-[1600px] rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{getTitle()}</h2>
              {formData?.categoryId && (
                <p className="text-xs text-gray-600">
                  Danh Mục:{' '}
                  {categories.find((c: any) => c.id === formData.categoryId)
                    ?.categoryName || 'Đang tải...'}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <span className="text-lg">✕</span>
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[75vh] space-y-5 overflow-y-auto p-5">
            {/* Step 1: Basic Information */}
            {step === 'basic' && (
              <form
                onSubmit={handleSubmit(handleBasicInfo)}
                className="space-y-4"
              >
                <div className="rounded-lg border bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 size-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-900">
                        Bước 1: Thông Tin Cơ Bản
                      </h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Cung cấp thông tin cơ bản cho quy trình khẩn cấp của bạn.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tên Kế Hoạch *
                    </label>
                    <input
                      type="text"
                      {...register('planName', {
                        required: 'Tên kế hoạch là bắt buộc',
                      })}
                      value={watch('planName') || ''}
                      onChange={(e) => setValue('planName', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tên kế hoạch"
                    />
                    {errors.planName && (
                      <p className="text-sm text-red-600">
                        {errors.planName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Mô Tả *
                    </label>
                    <textarea
                      {...register('description', {
                        required: 'Mô tả là bắt buộc',
                      })}
                      value={watch('description') || ''}
                      onChange={(e) => setValue('description', e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập mô tả"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tổng Thời Gian (Ngày) *
                    </label>
                    <input
                      type="number"
                      {...register('totalDurationDays', {
                        required: 'Thời gian là bắt buộc',
                        min: {
                          value: 1,
                          message: 'Thời gian phải ít nhất 1 ngày',
                        },
                        valueAsNumber: true,
                      })}
                      value={watch('totalDurationDays') || 30}
                      onChange={(e) =>
                        setValue(
                          'totalDurationDays',
                          parseInt(e.target.value) || 30,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                    />
                    {errors.totalDurationDays && (
                      <p className="text-sm text-red-600">
                        {errors.totalDurationDays.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Danh Mục Lúa *
                    </label>
                    {categoriesQuery.isLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <Spinner size="sm" />
                      </div>
                    ) : (
                      <>
                        <select
                          {...register('categoryId', {
                            required: 'Danh mục là bắt buộc',
                          })}
                          value={watch('categoryId') || ''}
                          onChange={(e) =>
                            setValue('categoryId', e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          disabled={categoriesQuery.isLoading}
                        >
                          <option value="">Chọn danh mục</option>
                          {categories.map((category: any) => (
                            <option key={category.id} value={category.id}>
                              {category.categoryName}
                            </option>
                          ))}
                        </select>
                        {errors.categoryId && (
                          <p className="text-sm text-red-600">
                            {errors.categoryId.message}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        {...register('isActive')}
                        checked={watch('isActive')}
                        onChange={(e) => setValue('isActive', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Đang Hoạt Động (quy trình có thể sử dụng ngay)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={!planName || !description || !categoryId}
                    icon={<ArrowRight className="size-4" />}
                  >
                    Tiếp: Nhiệm Vụ
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: Tasks */}
            {step === 'tasks' && (
              <>
                <div className="rounded-lg border bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Package className="mt-0.5 size-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-900">
                        Bước 2: Định Nghĩa Nhiệm Vụ
                      </h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Thêm nhiệm vụ cho quy trình khẩn cấp.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2">
                    <span className="text-sm font-semibold text-blue-900">
                      Nhiệm Vụ ({editableStages[0]?.tasks.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddTask(0)}
                      disabled={isLoading}
                      className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="size-4" />
                      Thêm Nhiệm Vụ
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {editableStages[0]?.tasks.map((task, taskIndex) => {
                      const taskKey = `task-${taskIndex}`;
                      const hasTaskError = validationErrors[taskKey];

                      return (
                        <div key={taskIndex} className="relative">
                          {taskIndex === 0 && (
                            <button
                              type="button"
                              onClick={() => handleInsertTask(0, 0)}
                              disabled={isLoading}
                              className="absolute -left-3 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-blue-500 text-white shadow-md transition-colors hover:bg-blue-600"
                              title="Thêm nhiệm vụ trước"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          )}

                          <div
                            className={`rounded-md border-2 ${hasTaskError
                              ? 'border-red-300 bg-red-50'
                              : 'border-blue-200 bg-white'
                              } flex flex-col p-2.5 shadow-sm transition-shadow hover:shadow-md`}
                          >
                            <div className="mb-2 flex items-start justify-between">
                              <div className="flex items-center gap-1">
                                <span className="inline-flex size-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                                  {taskIndex + 1}
                                </span>
                                <div className="flex gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveTaskLeft(0, taskIndex)}
                                    disabled={isLoading || taskIndex === 0}
                                    className="rounded p-0.5 text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30"
                                    title="Di chuyển nhiệm vụ sang trái"
                                  >
                                    <ChevronLeft className="size-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveTaskRight(0, taskIndex)}
                                    disabled={isLoading || taskIndex === editableStages[0]?.tasks.length - 1}
                                    className="rounded p-0.5 text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30"
                                    title="Di chuyển nhiệm vụ sang phải"
                                  >
                                    <ChevronRight className="size-3" />
                                  </button>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveTask(0, taskIndex)}
                                disabled={isLoading}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>

                            <div className="flex-1 space-y-2">
                              <div className="space-y-0.5">
                                <label className="block text-[10px] font-medium text-gray-600">
                                  Tên Nhiệm Vụ *
                                </label>
                                <input
                                  type="text"
                                  value={task.taskName}
                                  onChange={(e) =>
                                    handleUpdateTask(0, taskIndex, {
                                      taskName: e.target.value,
                                    })
                                  }
                                  disabled={isLoading}
                                  placeholder="Tên nhiệm vụ"
                                  className={`block w-full rounded-md border ${hasTaskError
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300 bg-white'
                                    } px-2 py-1 text-xs font-medium focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                                />
                                {hasTaskError && (
                                  <p className="mt-0.5 text-[10px] text-red-600">
                                    Tên nhiệm vụ là bắt buộc
                                  </p>
                                )}
                              </div>

                              <div className="space-y-0.5">
                                <label className="block text-[10px] font-medium text-gray-600">
                                  Mô Tả
                                </label>
                                <textarea
                                  value={task.description || ''}
                                  onChange={(e) =>
                                    handleUpdateTask(0, taskIndex, {
                                      description: e.target.value,
                                    })
                                  }
                                  disabled={isLoading}
                                  placeholder="Mô tả"
                                  rows={2}
                                  className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-1.5">
                                <div className="space-y-0.5">
                                  <label className="block text-[10px] font-medium text-gray-600">
                                    Ngày Sau
                                  </label>
                                  <input
                                    type="number"
                                    value={task.daysAfter}
                                    onChange={(e) =>
                                      handleUpdateTask(0, taskIndex, {
                                        daysAfter:
                                          parseInt(e.target.value) || 0,
                                      })
                                    }
                                    disabled={isLoading}
                                    placeholder="0"
                                    className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <label className="block text-[10px] font-medium text-gray-600">
                                    Thời Gian
                                  </label>
                                  <input
                                    type="number"
                                    value={task.durationDays}
                                    onChange={(e) =>
                                      handleUpdateTask(0, taskIndex, {
                                        durationDays:
                                          parseInt(e.target.value) || 1,
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
                                <label className="block text-[10px] font-medium text-gray-600">
                                  Loại Nhiệm Vụ
                                </label>
                                <select
                                  value={task.taskType}
                                  onChange={(e) =>
                                    handleUpdateTask(0, taskIndex, {
                                      taskType: e.target.value,
                                    })
                                  }
                                  disabled={isLoading}
                                  className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                >
                                  {TASK_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                      {type === 'LandPreparation' ? 'Chuẩn Bị Đất' : type === 'Fertilization' ? 'Bón Phân' : type === 'PestControl' ? 'Kiểm Soát Sâu Bệnh' : type === 'Harvesting' ? 'Thu Hoạch' : 'Gieo Trồng'}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-0.5">
                                <label className="block text-[10px] font-medium text-gray-600">
                                  Ưu Tiên
                                </label>
                                <select
                                  value={task.priority}
                                  onChange={(e) =>
                                    handleUpdateTask(0, taskIndex, {
                                      priority: e.target.value,
                                    })
                                  }
                                  disabled={isLoading}
                                  className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                >
                                  {PRIORITIES.map((priority) => (
                                    <option key={priority} value={priority}>
                                      {priority === 'Low' ? 'Thấp' : priority === 'Normal' ? 'Bình Thường' : priority === 'High' ? 'Cao' : 'Nghiêm Trọng'}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Materials */}
                              <div className="space-y-1.5 rounded-md border border-gray-200 bg-gray-50 p-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-semibold text-gray-700">
                                    Vật Liệu
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAddMaterial(0, taskIndex)
                                    }
                                    disabled={isLoading}
                                    className="text-[10px] font-medium text-blue-600 underline hover:text-blue-700"
                                  >
                                    + Thêm
                                  </button>
                                </div>
                                {task.materials.map(
                                  (material, materialIndex) => (
                                    <div
                                      key={materialIndex}
                                      className="space-y-1 rounded-md border border-gray-200 bg-white p-1.5"
                                    >
                                      <select
                                        value={material.materialId}
                                        onChange={(e) =>
                                          handleUpdateMaterial(
                                            0,
                                            taskIndex,
                                            materialIndex,
                                            'materialId',
                                            e.target.value,
                                          )
                                        }
                                        disabled={isLoading}
                                        className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                      >
                                        <option value="">
                                          Chọn vật liệu...
                                        </option>
                                        {fertilizers.length > 0 && (
                                          <optgroup label="Phân Bón">
                                            {fertilizers.map((mat: any) => (
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
                                          <optgroup label="Thuốc Trừ Sâu">
                                            {pesticides.map((mat: any) => (
                                              <option
                                                key={mat.materialId}
                                                value={mat.materialId}
                                              >
                                                {mat.name} ({mat.unit})
                                              </option>
                                            ))}
                                          </optgroup>
                                        )}
                                        {seeds.length > 0 && (
                                          <optgroup label="Hạt Giống">
                                            {seeds.map((mat: any) => (
                                              <option
                                                key={mat.materialId}
                                                value={mat.materialId}
                                              >
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
                                              0,
                                              taskIndex,
                                              materialIndex,
                                              'quantityPerHa',
                                              parseFloat(e.target.value) || 0,
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
                                              0,
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
                                  ),
                                )}
                                {task.materials.length === 0 && (
                                  <p className="py-0.5 text-center text-[10px] italic text-gray-500">
                                    Không có vật liệu
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleInsertTask(0, taskIndex + 1)}
                            disabled={isLoading}
                            className="absolute -right-3 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-blue-500 text-white shadow-md transition-colors hover:bg-blue-600"
                            title="Thêm nhiệm vụ sau"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {(!editableStages[0] ||
                    editableStages[0].tasks.length === 0) && (
                      <div className="rounded-lg border border-yellow-200 bg-yellow-50 py-8 text-center">
                        <p className="mb-1 text-sm font-medium text-yellow-800">
                          ⚠️ Cần ít nhất một nhiệm vụ
                        </p>
                        <p className="mb-3 text-xs italic text-yellow-600">
                          Thêm nhiệm vụ để tiếp tục bước tiếp theo
                        </p>
                        <button
                          type="button"
                          onClick={() => handleAddTask(0)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1 rounded-md bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-yellow-600"
                        >
                          <Plus className="size-3.5" />
                          Thêm Nhiệm Vụ Đầu Tiên
                        </button>
                      </div>
                    )}
                </div>

                <div className="sticky bottom-0 -mx-5 border-t bg-white px-5 pb-2 pt-3">
                  <div className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep('basic')}
                      disabled={isLoading}
                    >
                      <ArrowLeft className="mr-1 size-4" />
                      Quay Lại
                    </Button>
                    <Button
                      onClick={handleToThresholds}
                      disabled={
                        isLoading ||
                        !editableStages[0] ||
                        editableStages[0].tasks.length === 0 ||
                        editableStages[0].tasks.some(
                          (task) => !task.taskName.trim(),
                        )
                      }
                      icon={<ArrowRight className="size-4" />}
                    >
                      Tiếp: Thêm Ngưỡng
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Thresholds */}
            {step === 'thresholds' && (
              <>
                <div className="rounded-lg border bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Bug className="mt-0.5 size-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-900">
                        Bước 3: Định Nghĩa Ngưỡng
                      </h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Thêm ngưỡng kích hoạt quy trình khẩn cấp này.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      Ngưỡng ({editableThresholds.length})
                    </span>
                    <Button
                      onClick={() => setIsThresholdDialogOpen(true)}
                      disabled={isLoading}
                      size="sm"
                      icon={<Plus className="size-4" />}
                    >
                      Thêm Ngưỡng
                    </Button>
                  </div>

                  {editableThresholds.length > 0 ? (
                    <div className="space-y-2">
                      {editableThresholds.map((threshold, index) => (
                        <div
                          key={index}
                          className="rounded-lg border bg-white p-3 shadow-sm"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-1 text-sm">
                              <div className="flex flex-wrap items-center gap-2">
                                {threshold.pestProtocolId && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                                    <Bug className="size-3" />
                                    Sâu Bệnh
                                  </span>
                                )}
                                {threshold.weatherProtocolId && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                    <Cloud className="size-3" />
                                    Thời Tiết
                                  </span>
                                )}
                                <span className="font-medium text-gray-900">
                                  {[
                                    threshold.pestAffectType,
                                    threshold.weatherEventType,
                                  ]
                                    .filter(Boolean)
                                    .join(' + ') || 'Ngưỡng Kết Hợp'}
                                </span>
                              </div>

                              {/* Pest Details */}
                              {threshold.pestProtocolId && (
                                <div className="border-l-2 border-orange-200 pl-2">
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium text-orange-600">
                                      Sâu Bệnh:
                                    </span>{' '}
                                    {threshold.pestSeverityLevel}
                                    {' • '}Diện Tích:{' '}
                                    {threshold.pestAreaThresholdPercent}%{' • '}
                                    Thiệt Hại:{' '}
                                    {threshold.pestDamageThresholdPercent}%
                                    {threshold.pestGrowthStage &&
                                      ` • Giai Đoạn: ${threshold.pestGrowthStage}`}
                                  </p>
                                </div>
                              )}

                              {/* Weather Details */}
                              {threshold.weatherProtocolId && (
                                <div className="border-l-2 border-blue-200 pl-2">
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium text-blue-600">
                                      Thời Tiết:
                                    </span>{' '}
                                    {threshold.weatherIntensityLevel}
                                    {' • '}
                                    {threshold.weatherMeasurementThreshold}{' '}
                                    {threshold.weatherMeasurementUnit}
                                    {threshold.weatherDurationDaysThreshold &&
                                      ` • ${threshold.weatherDurationDaysThreshold} ngày`}
                                  </p>
                                </div>
                              )}

                              <p className="text-xs text-gray-500">
                                Mùa Vụ: {threshold.applicableSeason} • Ưu Tiên:{' '}
                                {threshold.priority}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingThresholdIndex(index);
                                  setIsThresholdDialogOpen(true);
                                }}
                                className="rounded p-1 transition-colors hover:bg-gray-200"
                                title="Chỉnh sửa ngưỡng"
                              >
                                <Edit className="size-4 text-gray-600" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveThreshold(index)}
                                className="rounded p-1 transition-colors hover:bg-red-100"
                              >
                                <Trash2 className="size-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-md bg-gray-50 py-8 text-center text-sm italic text-gray-500">
                      Chưa có ngưỡng nào. Nhấp "Thêm Ngưỡng" để tạo một ngưỡng.
                    </p>
                  )}
                </div>

                <div className="sticky bottom-0 -mx-5 border-t bg-white px-5 pb-2 pt-3">
                  <div className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep('tasks')}
                      disabled={isLoading}
                    >
                      <ArrowLeft className="mr-1 size-4" />
                      Quay Lại
                    </Button>
                    <Button
                      onClick={handleToPreview}
                      disabled={isLoading}
                      icon={<ArrowRight className="size-4" />}
                    >
                      Tiếp: Xem Trước
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Preview */}
            {step === 'preview' && (
              <>
                <div className="rounded-lg border bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 size-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-900">
                        Bước 4: Xem Xét & Tạo
                      </h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Xem xét chi tiết quy trình khẩn cấp. Nhấp "Tạo Quy Trình"
                        để hoàn tất.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-lg border bg-gray-50 p-4">
                  <h4 className="font-semibold text-gray-900">
                    {formData?.planName}
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                    {formData?.description}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Thời Gian:
                      </span>{' '}
                      <span className="text-gray-900">
                        {formData?.totalDurationDays} ngày
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Trạng Thái:</span>{' '}
                      <span
                        className={`${formData?.isActive ? 'text-green-600' : 'text-gray-600'}`}
                      >
                        {formData?.isActive ? 'Đang Hoạt Động' : 'Không Hoạt Động'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stages Overview */}
                <div className="max-h-[400px] overflow-y-auto rounded-lg border">
                  <div className="space-y-3 p-4">
                    <h4 className="sticky top-0 z-10 bg-white pb-2 font-semibold text-gray-900">
                      Nhiệm Vụ (
                      {editableStages.reduce(
                        (sum, s) => sum + s.tasks.length,
                        0,
                      )}{' '}
                      nhiệm vụ)
                    </h4>
                    {editableStages.map((stage, idx) => (
                      <div key={idx} className="rounded-lg border bg-white p-3">
                        {stage.tasks.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {stage.tasks.map((task, taskIdx) => (
                              <div
                                key={taskIdx}
                                className="border-l-2 border-gray-200 pl-4 text-sm"
                              >
                                <div className="font-medium text-gray-700">
                                  {task.taskName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Ngày {task.daysAfter} • Thời Gian:{' '}
                                  {task.durationDays} ngày • {task.taskType} •
                                  Ưu Tiên: {task.priority}
                                </div>
                                {task.materials.length > 0 && (
                                  <div className="mt-1 space-y-1">
                                    <div className="text-xs text-gray-600">
                                      Vật Liệu:{' '}
                                      {task.materials
                                        .map((m) => {
                                          const mat = [
                                            ...fertilizers,
                                            ...pesticides,
                                          ].find(
                                            (mat) =>
                                              mat.materialId === m.materialId,
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
                {editableStages.some(s => s.tasks.some(t => t.materials.length > 0)) && (
                  <div className="rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">Ước Tính Chi Phí (mỗi hecta)</h4>
                      {calculateCostMutation.isPending && <Spinner size="sm" />}
                    </div>
                    {calculateCostMutation.isPending ? (
                      <div className="text-center py-4 text-gray-500">Đang tính toán chi phí...</div>
                    ) : materialCosts.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">Không thể tải thông tin chi phí</div>
                    ) : (
                      <div className="space-y-2">
                        {materialCosts.map((item) => (
                          <div
                            key={item.materialId}
                            className="flex items-center justify-between rounded-md bg-white p-3 text-sm"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.materialName}</p>
                              <p className="text-xs text-gray-500">
                                {item.quantityPerHa} {item.unit}/ha • Cần {item.packagesNeeded} gói
                                ({item.amountPerMaterial} {item.unit}/gói)
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-700">
                                {item.costPerHa.toFixed(0)} VND/ha
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.pricePerMaterial} VND/gói
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

                {/* Thresholds Overview */}
                {editableThresholds.length > 0 && (
                  <div className="rounded-lg border bg-white p-4">
                    <h4 className="mb-3 font-semibold text-gray-900">
                      Ngưỡng ({editableThresholds.length})
                    </h4>
                    <div className="space-y-2">
                      {editableThresholds.map((threshold, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border bg-gray-50 p-3 text-sm"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            {threshold.pestProtocolId && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                                <Bug className="size-3" />
                                Ngưỡng Sâu Bệnh
                              </span>
                            )}
                            {threshold.weatherProtocolId && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                <Cloud className="size-3" />
                                Ngưỡng Thời Tiết
                              </span>
                            )}
                          </div>

                          {/* Pest Details */}
                          {threshold.pestProtocolId && (
                            <div className="mb-2 border-l-2 border-orange-300 pl-3">
                              <p className="mb-1 text-xs font-medium text-orange-900">
                                Điều Kiện Sâu Bệnh:
                              </p>
                              <div className="space-y-0.5 text-xs text-gray-700">
                                {threshold.pestAffectType && (
                                  <p>
                                    • Loại Ảnh Hưởng:{' '}
                                    <span className="font-medium">
                                      {threshold.pestAffectType}
                                    </span>
                                  </p>
                                )}
                                {threshold.pestSeverityLevel && (
                                  <p>
                                    • Mức Độ Nghiêm Trọng:{' '}
                                    <span className="font-medium">
                                      {threshold.pestSeverityLevel}
                                    </span>
                                  </p>
                                )}
                                {threshold.pestAreaThresholdPercent !==
                                  undefined && (
                                    <p>
                                      • Ngưỡng Diện Tích:{' '}
                                      <span className="font-medium">
                                        {threshold.pestAreaThresholdPercent}%
                                      </span>
                                    </p>
                                  )}
                                {threshold.pestDamageThresholdPercent !==
                                  undefined && (
                                    <p>
                                      • Ngưỡng Thiệt Hại:{' '}
                                      <span className="font-medium">
                                        {threshold.pestDamageThresholdPercent}%
                                      </span>
                                    </p>
                                  )}
                                {threshold.pestPopulationThreshold && (
                                  <p>
                                    • Số Lượng:{' '}
                                    <span className="font-medium">
                                      {threshold.pestPopulationThreshold}
                                    </span>
                                  </p>
                                )}
                                {threshold.pestGrowthStage && (
                                  <p>
                                    • Giai Đoạn Sinh Trưởng:{' '}
                                    <span className="font-medium">
                                      {threshold.pestGrowthStage}
                                    </span>
                                  </p>
                                )}
                                {threshold.pestThresholdNotes && (
                                  <p className="italic text-gray-600">
                                    Ghi Chú: {threshold.pestThresholdNotes}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Weather Details */}
                          {threshold.weatherProtocolId && (
                            <div className="mb-2 border-l-2 border-blue-300 pl-3">
                              <p className="mb-1 text-xs font-medium text-blue-900">
                                Điều Kiện Thời Tiết:
                              </p>
                              <div className="space-y-0.5 text-xs text-gray-700">
                                {threshold.weatherEventType && (
                                  <p>
                                    • Loại Sự Kiện:{' '}
                                    <span className="font-medium">
                                      {threshold.weatherEventType}
                                    </span>
                                  </p>
                                )}
                                {threshold.weatherIntensityLevel && (
                                  <p>
                                    • Cường Độ:{' '}
                                    <span className="font-medium">
                                      {threshold.weatherIntensityLevel}
                                    </span>
                                  </p>
                                )}
                                {threshold.weatherMeasurementThreshold !==
                                  undefined &&
                                  threshold.weatherMeasurementUnit && (
                                    <p>
                                      • Ngưỡng:{' '}
                                      <span className="font-medium">
                                        {threshold.weatherMeasurementThreshold}{' '}
                                        {threshold.weatherMeasurementUnit}
                                      </span>
                                    </p>
                                  )}
                                {threshold.weatherThresholdOperator && (
                                  <p>
                                    • Toán Tử:{' '}
                                    <span className="font-medium">
                                      {threshold.weatherThresholdOperator}
                                    </span>
                                  </p>
                                )}
                                {threshold.weatherDurationDaysThreshold && (
                                  <p>
                                    • Thời Gian:{' '}
                                    <span className="font-medium">
                                      {threshold.weatherDurationDaysThreshold}{' '}
                                      ngày
                                    </span>
                                  </p>
                                )}
                                {threshold.weatherThresholdNotes && (
                                  <p className="italic text-gray-600">
                                    Ghi Chú: {threshold.weatherThresholdNotes}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Common Settings */}
                          <div className="mt-2 border-t border-gray-200 pt-2">
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                              {threshold.applicableSeason && (
                                <span>
                                  Mùa Vụ:{' '}
                                  <span className="font-medium text-gray-900">
                                    {threshold.applicableSeason}
                                  </span>
                                </span>
                              )}
                              {threshold.priority && (
                                <span>
                                  Ưu Tiên:{' '}
                                  <span className="font-medium text-gray-900">
                                    {threshold.priority}
                                  </span>
                                </span>
                              )}
                              {threshold.riceVarietyId && (
                                <span>
                                  Giống Lúa:{' '}
                                  <span className="font-medium text-gray-900">
                                    {riceVarieties.find(
                                      (v: any) => v.id === threshold.riceVarietyId,
                                    )?.varietyName || 'Không Xác Định'}
                                  </span>
                                </span>
                              )}
                            </div>
                            {threshold.generalNotes && (
                              <p className="mt-1 text-xs italic text-gray-600">
                                Ghi Chú Chung: {threshold.generalNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="sticky bottom-0 -mx-5 border-t bg-white px-5 pb-2 pt-3">
                  <div className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep('thresholds')}
                      disabled={createProtocolMutation.isPending}
                    >
                      <ArrowLeft className="mr-1 size-4" />
                      Quay Lại
                    </Button>
                    <Button
                      onClick={handleCreateOrUpdateProtocol}
                      disabled={isLoading}
                      icon={
                        isLoading ? (
                          <Spinner size="sm" />
                        ) : (
                          <Cloud className="size-4" />
                        )
                      }
                    >
                      {isLoading
                        ? isEditMode
                          ? 'Đang Cập Nhật...'
                          : 'Đang Tạo...'
                        : isEditMode
                          ? 'Cập Nhật Quy Trình'
                          : 'Tạo Quy Trình'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ThresholdDialog
        isOpen={isThresholdDialogOpen}
        onClose={() => setIsThresholdDialogOpen(false)}
        onAdd={handleAddThreshold}
        pestProtocols={pestProtocols}
        weatherProtocols={weatherProtocols}
        onCreatePestProtocol={() => setIsPestProtocolDialogOpen(true)}
        onCreateWeatherProtocol={() => setIsWeatherProtocolDialogOpen(true)}
        initialData={
          editingThresholdIndex !== null
            ? editableThresholds[editingThresholdIndex]
            : null
        }
        isEditMode={editingThresholdIndex !== null}
        onEditComplete={(updatedThreshold) => {
          const updatedThresholds = [...editableThresholds];
          updatedThresholds[editingThresholdIndex!] = updatedThreshold;
          setEditableThresholds(updatedThresholds);
          setEditingThresholdIndex(null);
        }}
      />

      {isPestProtocolDialogOpen && (
        <PestProtocolDialog
          isOpen={isPestProtocolDialogOpen}
          onClose={() => setIsPestProtocolDialogOpen(false)}
          onSubmit={(data) => {
            const { id, ...createData } = data;
            createPestProtocolMutation.mutate(createData);
          }}
          isLoading={createPestProtocolMutation.isPending}
          protocol={newPestProtocol}
          setProtocol={setNewPestProtocol}
          isEditMode={false}
        />
      )}

      {isWeatherProtocolDialogOpen && (
        <WeatherProtocolDialog
          isOpen={isWeatherProtocolDialogOpen}
          onClose={() => setIsWeatherProtocolDialogOpen(false)}
          onSubmit={(data) => {
            const { id, ...createData } = data;
            createWeatherProtocolMutation.mutate(createData);
          }}
          isLoading={createWeatherProtocolMutation.isPending}
          protocol={newWeatherProtocol}
          setProtocol={setNewWeatherProtocol}
          isEditMode={false}
        />
      )}
    </div>
  );
};
