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
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/components/ui/notifications';
import { Spinner } from '@/components/ui/spinner';
import { useMaterials } from '@/features/materials/api/get-materials';
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

  const createProtocolMutation = useCreateEmergencyProtocol({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Emergency protocol created successfully',
        });
        handleClose();
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Error',
          message: error.message || 'Failed to create emergency protocol',
        });
      },
    },
  });

  const createPestProtocolMutation = useCreatePestProtocol({
    mutationConfig: {
      onSuccess: (response) => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Pest protocol created successfully',
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
          title: 'Error',
          message: error.message || 'Failed to create pest protocol',
        });
      },
    },
  });

  const createWeatherProtocolMutation = useCreateWeatherProtocol({
    mutationConfig: {
      onSuccess: (response) => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Weather protocol created successfully',
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
          title: 'Error',
          message: error.message || 'Failed to create weather protocol',
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

  console.log('Query state:', {
    protocolId: protocol?.id,
    isEditMode,
    isOpen,
    isLoadingDetails,
    hasResponse: !!protocolDetailsResponse,
    error,
  });

  const protocolDetails = protocolDetailsResponse;

  console.log('📦 Protocol Details:', {
    raw: protocolDetailsResponse,
    extracted: protocolDetails,
    planName: protocolDetails?.planName,
  });

  const updateProtocolMutation = useUpdateEmergencyProtocol({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Emergency protocol updated successfully',
        });
        handleClose();
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Error',
          message: error.message || 'Failed to update emergency protocol',
        });
      },
    },
  });

  // Load existing data when editing
  useEffect(() => {
    if (isEditMode && protocolDetails && isOpen && !isLoadingDetails) {
      console.log('📝 Populating form with protocol data:', protocolDetails);

      // Set basic form data
      const basicData: FormData = {
        categoryId: protocolDetails.categoryId,
        planName: protocolDetails.planName,
        description: protocolDetails.description,
        totalDurationDays: protocolDetails.totalDurationDays,
        isActive: protocolDetails.isActive,
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
      const convertedStages: EditableStage[] = protocolDetails.stages.map(
        (stage) => ({
          stageName: stage.stageName,
          sequenceOrder: stage.sequenceOrder,
          expectedDurationDays: stage.expectedDurationDays,
          isMandatory: stage.isMandatory,
          notes: stage.notes || undefined,
          tasks: stage.tasks.map((task) => ({
            taskName: task.taskName,
            description: task.description || '',
            daysAfter: task.daysAfter,
            durationDays: task.durationDays,
            taskType: task.taskType,
            priority: task.priority,
            sequenceOrder: task.sequenceOrder,
            materials: task.materials.map((m) => ({
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
        protocolDetails.thresholds.map((t) => ({
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

      // Force re-render by triggering form validation
      setTimeout(() => {
        console.log('✅ Form populated. Current values:', {
          planName: watch('planName'),
          categoryId: watch('categoryId'),
          description: watch('description'),
        });
      }, 100);
    }
  }, [isEditMode, protocolDetails, isLoadingDetails, isOpen, setValue, watch]);

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
      errors.push('At least one task is required');
    }

    if (stage) {
      stage.tasks.forEach((task, taskIndex) => {
        const taskKey = `task-${taskIndex}`;

        // Check task name
        if (!task.taskName || task.taskName.trim() === '') {
          errors.push(`Task ${taskIndex + 1} is missing a name`);
          newValidationErrors[taskKey] = true;
        }
      });
    }

    setValidationErrors(newValidationErrors);

    if (errors.length > 0) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: errors.join(', '),
      });
      return;
    }

    setStep('thresholds');
  };

  const handleToPreview = () => {
    setStep('preview');
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
            description: task.description,
            daysAfter: task.daysAfter,
            durationDays: task.durationDays,
            taskType: task.taskType,
            priority: task.priority,
            sequenceOrder: task.sequenceOrder,
            materials: task.materials.filter(
              (m) => m.materialId && m.quantityPerHa > 0,
            ),
          })),
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
      });
    } else {
      createProtocolMutation.mutate(createData);
    }
  };

  const handleClose = () => {
    if (!isEditMode) {
      reset({
        isActive: true,
        totalDurationDays: 30,
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
    }
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
    const material =
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

  const categories = categoriesQuery.data || [];
  const pestProtocols = pestProtocolsData?.data || [];
  const weatherProtocols = weatherProtocolsData?.data || [];
  const riceVarieties = riceVarietiesResponse?.data || [];
  const fertilizers = fertilizersQuery.data?.data || [];
  const pesticides = pesticidesQuery.data?.data || [];
  const isLoading =
    createProtocolMutation.isPending ||
    updateProtocolMutation.isPending ||
    isLoadingDetails ||
    fertilizersQuery.isLoading ||
    pesticidesQuery.isLoading;

  const getTitle = () => {
    const prefix = isEditMode ? 'Edit' : 'Create';
    switch (step) {
      case 'basic':
        return `${prefix} Emergency Protocol - Basic Info`;
      case 'tasks':
        return `${prefix} Emergency Protocol - Tasks`;
      case 'thresholds':
        return `${prefix} Emergency Protocol - Thresholds`;
      case 'preview':
        return `${prefix} Emergency Protocol - Review`;
      default:
        return `${prefix} Emergency Protocol`;
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
              <p className="text-gray-600">Loading protocol details...</p>
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
                  Category:{' '}
                  {categories.find((c) => c.id === formData.categoryId)
                    ?.categoryName || 'Loading...'}
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
                        Step 1: Basic Information
                      </h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Provide the basic details for your emergency protocol.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      {...register('planName', {
                        required: 'Plan name is required',
                      })}
                      value={watch('planName') || ''}
                      onChange={(e) => setValue('planName', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter plan name"
                    />
                    {errors.planName && (
                      <p className="text-sm text-red-600">
                        {errors.planName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      {...register('description', {
                        required: 'Description is required',
                      })}
                      value={watch('description') || ''}
                      onChange={(e) => setValue('description', e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter description"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Total Duration (Days) *
                    </label>
                    <input
                      type="number"
                      {...register('totalDurationDays', {
                        required: 'Duration is required',
                        min: {
                          value: 1,
                          message: 'Duration must be at least 1 day',
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
                      Rice Category *
                    </label>
                    {categoriesQuery.isLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <Spinner size="sm" />
                      </div>
                    ) : (
                      <>
                        <select
                          {...register('categoryId', {
                            required: 'Category is required',
                          })}
                          value={watch('categoryId') || ''}
                          onChange={(e) =>
                            setValue('categoryId', e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          disabled={categoriesQuery.isLoading}
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
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
                        Active (protocol can be used immediately)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!planName || !description || !categoryId}
                    icon={<ArrowRight className="size-4" />}
                  >
                    Next: Tasks
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
                        Step 2: Define Tasks
                      </h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Add tasks for the emergency protocol.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2">
                    <span className="text-sm font-semibold text-blue-900">
                      Tasks ({editableStages[0]?.tasks.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddTask(0)}
                      disabled={isLoading}
                      className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="size-4" />
                      Add Task
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
                              title="Add task before"
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
                                    title="Move task left"
                                  >
                                    <ChevronLeft className="size-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveTaskRight(0, taskIndex)}
                                    disabled={isLoading || taskIndex === editableStages[0]?.tasks.length - 1}
                                    className="rounded p-0.5 text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30"
                                    title="Move task right"
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
                                  Task name *
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
                                  placeholder="Task name"
                                  className={`block w-full rounded-md border ${hasTaskError
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300 bg-white'
                                    } px-2 py-1 text-xs font-medium focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                                />
                                {hasTaskError && (
                                  <p className="mt-0.5 text-[10px] text-red-600">
                                    Task name is required
                                  </p>
                                )}
                              </div>

                              <div className="space-y-0.5">
                                <label className="block text-[10px] font-medium text-gray-600">
                                  Description
                                </label>
                                <textarea
                                  value={task.description || ''}
                                  onChange={(e) =>
                                    handleUpdateTask(0, taskIndex, {
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
                                  <label className="block text-[10px] font-medium text-gray-600">
                                    Days After
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
                                    Duration
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
                                  Task Type
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
                                      {type}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-0.5">
                                <label className="block text-[10px] font-medium text-gray-600">
                                  Priority
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
                                      handleAddMaterial(0, taskIndex)
                                    }
                                    disabled={isLoading}
                                    className="text-[10px] font-medium text-blue-600 underline hover:text-blue-700"
                                  >
                                    + Add
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
                                          Select material...
                                        </option>
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
                                          placeholder="Qty/ha"
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
                                    No materials
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
                            title="Add task after"
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
                          ⚠️ At least one task is required
                        </p>
                        <p className="mb-3 text-xs italic text-yellow-600">
                          Add a task to proceed to the next step
                        </p>
                        <button
                          type="button"
                          onClick={() => handleAddTask(0)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1 rounded-md bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-yellow-600"
                        >
                          <Plus className="size-3.5" />
                          Add First Task
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
                      Back
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
                      Next: Add Thresholds
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
                        Step 3: Define Thresholds
                      </h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Add thresholds that trigger this emergency protocol.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      Thresholds ({editableThresholds.length})
                    </span>
                    <Button
                      onClick={() => setIsThresholdDialogOpen(true)}
                      disabled={isLoading}
                      size="sm"
                      icon={<Plus className="size-4" />}
                    >
                      Add Threshold
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
                                    Pest
                                  </span>
                                )}
                                {threshold.weatherProtocolId && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                    <Cloud className="size-3" />
                                    Weather
                                  </span>
                                )}
                                <span className="font-medium text-gray-900">
                                  {[
                                    threshold.pestAffectType,
                                    threshold.weatherEventType,
                                  ]
                                    .filter(Boolean)
                                    .join(' + ') || 'Combined Threshold'}
                                </span>
                              </div>

                              {/* Pest Details */}
                              {threshold.pestProtocolId && (
                                <div className="border-l-2 border-orange-200 pl-2">
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium text-orange-600">
                                      Pest:
                                    </span>{' '}
                                    {threshold.pestSeverityLevel}
                                    {' • '}Area:{' '}
                                    {threshold.pestAreaThresholdPercent}%{' • '}
                                    Damage:{' '}
                                    {threshold.pestDamageThresholdPercent}%
                                    {threshold.pestGrowthStage &&
                                      ` • Stage: ${threshold.pestGrowthStage}`}
                                  </p>
                                </div>
                              )}

                              {/* Weather Details */}
                              {threshold.weatherProtocolId && (
                                <div className="border-l-2 border-blue-200 pl-2">
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium text-blue-600">
                                      Weather:
                                    </span>{' '}
                                    {threshold.weatherIntensityLevel}
                                    {' • '}
                                    {threshold.weatherMeasurementThreshold}{' '}
                                    {threshold.weatherMeasurementUnit}
                                    {threshold.weatherDurationDaysThreshold &&
                                      ` • ${threshold.weatherDurationDaysThreshold} days`}
                                  </p>
                                </div>
                              )}

                              <p className="text-xs text-gray-500">
                                Season: {threshold.applicableSeason} • Priority:{' '}
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
                                title="Edit threshold"
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
                      No thresholds yet. Click "Add Threshold" to create one.
                    </p>
                  )}
                </div>

                <div className="sticky bottom-0 -mx-5 border-t bg-white px-5 pb-2 pt-3">
                  <div className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep('stages')}
                      disabled={isLoading}
                    >
                      <ArrowLeft className="mr-1 size-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleToPreview}
                      disabled={isLoading}
                      icon={<ArrowRight className="size-4" />}
                    >
                      Next: Preview
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
                        Step 4: Review & Create
                      </h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Review the emergency protocol details. Click "Create
                        Protocol" to finalize.
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
                        Duration:
                      </span>{' '}
                      <span className="text-gray-900">
                        {formData?.totalDurationDays} days
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>{' '}
                      <span
                        className={`${formData?.isActive ? 'text-green-600' : 'text-gray-600'}`}
                      >
                        {formData?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stages Overview */}
                <div className="max-h-[400px] overflow-y-auto rounded-lg border">
                  <div className="space-y-3 p-4">
                    <h4 className="sticky top-0 z-10 bg-white pb-2 font-semibold text-gray-900">
                      Tasks (
                      {editableStages.reduce(
                        (sum, s) => sum + s.tasks.length,
                        0,
                      )}{' '}
                      tasks)
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
                                  Day {task.daysAfter} • Duration:{' '}
                                  {task.durationDays} day(s) • {task.taskType} •
                                  Priority: {task.priority}
                                </div>
                                {task.materials.length > 0 && (
                                  <div className="mt-1 text-xs text-gray-600">
                                    Materials:{' '}
                                    {task.materials
                                      .map((m) => {
                                        const mat = [
                                          ...fertilizers,
                                          ...pesticides,
                                        ].find(
                                          (mat) =>
                                            mat.materialId === m.materialId,
                                        );
                                        return mat
                                          ? `${mat.name} (${m.quantityPerHa} ${mat.unit}/ha)`
                                          : '';
                                      })
                                      .filter(Boolean)
                                      .join(', ')}
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

                {/* Thresholds Overview */}
                {editableThresholds.length > 0 && (
                  <div className="rounded-lg border bg-white p-4">
                    <h4 className="mb-3 font-semibold text-gray-900">
                      Thresholds ({editableThresholds.length})
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
                                Pest Threshold
                              </span>
                            )}
                            {threshold.weatherProtocolId && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                <Cloud className="size-3" />
                                Weather Threshold
                              </span>
                            )}
                          </div>

                          {/* Pest Details */}
                          {threshold.pestProtocolId && (
                            <div className="mb-2 border-l-2 border-orange-300 pl-3">
                              <p className="mb-1 text-xs font-medium text-orange-900">
                                Pest Conditions:
                              </p>
                              <div className="space-y-0.5 text-xs text-gray-700">
                                {threshold.pestAffectType && (
                                  <p>
                                    • Affect Type:{' '}
                                    <span className="font-medium">
                                      {threshold.pestAffectType}
                                    </span>
                                  </p>
                                )}
                                {threshold.pestSeverityLevel && (
                                  <p>
                                    • Severity:{' '}
                                    <span className="font-medium">
                                      {threshold.pestSeverityLevel}
                                    </span>
                                  </p>
                                )}
                                {threshold.pestAreaThresholdPercent !==
                                  undefined && (
                                    <p>
                                      • Area Threshold:{' '}
                                      <span className="font-medium">
                                        {threshold.pestAreaThresholdPercent}%
                                      </span>
                                    </p>
                                  )}
                                {threshold.pestDamageThresholdPercent !==
                                  undefined && (
                                    <p>
                                      • Damage Threshold:{' '}
                                      <span className="font-medium">
                                        {threshold.pestDamageThresholdPercent}%
                                      </span>
                                    </p>
                                  )}
                                {threshold.pestPopulationThreshold && (
                                  <p>
                                    • Population:{' '}
                                    <span className="font-medium">
                                      {threshold.pestPopulationThreshold}
                                    </span>
                                  </p>
                                )}
                                {threshold.pestGrowthStage && (
                                  <p>
                                    • Growth Stage:{' '}
                                    <span className="font-medium">
                                      {threshold.pestGrowthStage}
                                    </span>
                                  </p>
                                )}
                                {threshold.pestThresholdNotes && (
                                  <p className="italic text-gray-600">
                                    Note: {threshold.pestThresholdNotes}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Weather Details */}
                          {threshold.weatherProtocolId && (
                            <div className="mb-2 border-l-2 border-blue-300 pl-3">
                              <p className="mb-1 text-xs font-medium text-blue-900">
                                Weather Conditions:
                              </p>
                              <div className="space-y-0.5 text-xs text-gray-700">
                                {threshold.weatherEventType && (
                                  <p>
                                    • Event Type:{' '}
                                    <span className="font-medium">
                                      {threshold.weatherEventType}
                                    </span>
                                  </p>
                                )}
                                {threshold.weatherIntensityLevel && (
                                  <p>
                                    • Intensity:{' '}
                                    <span className="font-medium">
                                      {threshold.weatherIntensityLevel}
                                    </span>
                                  </p>
                                )}
                                {threshold.weatherMeasurementThreshold !==
                                  undefined &&
                                  threshold.weatherMeasurementUnit && (
                                    <p>
                                      • Threshold:{' '}
                                      <span className="font-medium">
                                        {threshold.weatherMeasurementThreshold}{' '}
                                        {threshold.weatherMeasurementUnit}
                                      </span>
                                    </p>
                                  )}
                                {threshold.weatherThresholdOperator && (
                                  <p>
                                    • Operator:{' '}
                                    <span className="font-medium">
                                      {threshold.weatherThresholdOperator}
                                    </span>
                                  </p>
                                )}
                                {threshold.weatherDurationDaysThreshold && (
                                  <p>
                                    • Duration:{' '}
                                    <span className="font-medium">
                                      {threshold.weatherDurationDaysThreshold}{' '}
                                      days
                                    </span>
                                  </p>
                                )}
                                {threshold.weatherThresholdNotes && (
                                  <p className="italic text-gray-600">
                                    Note: {threshold.weatherThresholdNotes}
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
                                  Season:{' '}
                                  <span className="font-medium text-gray-900">
                                    {threshold.applicableSeason}
                                  </span>
                                </span>
                              )}
                              {threshold.priority && (
                                <span>
                                  Priority:{' '}
                                  <span className="font-medium text-gray-900">
                                    {threshold.priority}
                                  </span>
                                </span>
                              )}
                              {threshold.riceVarietyId && (
                                <span>
                                  Rice Variety:{' '}
                                  <span className="font-medium text-gray-900">
                                    {riceVarieties.find(
                                      (v) => v.id === threshold.riceVarietyId,
                                    )?.varietyName || 'Unknown'}
                                  </span>
                                </span>
                              )}
                            </div>
                            {threshold.generalNotes && (
                              <p className="mt-1 text-xs italic text-gray-600">
                                General Note: {threshold.generalNotes}
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
                      Back
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
                          ? 'Updating...'
                          : 'Creating...'
                        : isEditMode
                          ? 'Update Protocol'
                          : 'Create Protocol'}
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
        riceVarieties={riceVarieties}
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
          onCreate={createPestProtocolMutation.mutate}
          isLoading={createPestProtocolMutation.isPending}
          newPestProtocol={newPestProtocol}
          setNewPestProtocol={setNewPestProtocol}
        />
      )}

      {isWeatherProtocolDialogOpen && (
        <WeatherProtocolDialog
          isOpen={isWeatherProtocolDialogOpen}
          onClose={() => setIsWeatherProtocolDialogOpen(false)}
          onCreate={createWeatherProtocolMutation.mutate}
          isLoading={createWeatherProtocolMutation.isPending}
          newWeatherProtocol={newWeatherProtocol}
          setNewWeatherProtocol={setNewWeatherProtocol}
        />
      )}
    </div>
  );
};
