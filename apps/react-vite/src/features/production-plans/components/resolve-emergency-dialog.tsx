import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Search, ChevronRight, ChevronLeft, Plus, Trash2, FileText, AlertTriangle, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useEmergencyProtocols } from '@/features/emergency-protocols/api/get-emergency-protocols';
import { useEmergencyProtocol } from '@/features/emergency-protocols/api/get-emergency-protocol';
import { useResolveEmergency } from '../api/resolve-emergency';
import { EmergencyProtocol } from '@/features/emergency-protocols/types';
import { useNotifications } from '@/components/ui/notifications';
import { useUser } from '@/lib/auth';
import { useProductionPlan } from '../api/get-production-plan';
import { ProductionPlan } from '../types';

type ResolveEmergencyDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    planId: string;
    planName: string;
};

type EditableStage = {
    stageName: string;
    sequenceOrder: number;
    tasks: EditableTask[];
};

type EditableTask = {
    taskName: string;
    description: string;
    taskType: string;
    daysAfter: number;
    durationDays: number;
    priority: string;
    sequenceOrder: number;
    isFromProtocol: boolean;
    originalTaskId?: string; // This is ProductionPlanTask.Id
    originalProtocolTaskId?: string;
    materials: {
        materialId: string;
        quantityPerHa: number;
    }[];
};

type FormData = {
    resolutionReason: string;
    versionName: string;
};

export const ResolveEmergencyDialog = ({
    isOpen,
    onClose,
    planId,
    planName,
}: ResolveEmergencyDialogProps) => {
    const [step, setStep] = useState<'protocol' | 'plots' | 'edit' | 'name' | 'preview'>('protocol');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);
    const [editableStages, setEditableStages] = useState<EditableStage[]>([]);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [addingToStageIndex, setAddingToStageIndex] = useState<number | null>(null);
    const [addingToTaskPosition, setAddingToTaskPosition] = useState<number | null>(null);
    const [addTaskMode, setAddTaskMode] = useState<'new' | 'protocol' | null>(null);
    const [selectedProtocolTasks, setSelectedProtocolTasks] = useState<Set<string>>(new Set());
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});
    const [selectedPlotIds, setSelectedPlotIds] = useState<Set<string>>(new Set());
    const [productionStageId, setProductionStageId] = useState<string>('');

    const { data: user } = useUser();
    const { addNotification } = useNotifications();
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>();

    const { data: protocolsResponse, isLoading: isLoadingProtocols } = useEmergencyProtocols({
        params: {
            currentPage: 1,
            pageSize: 100,
            searchTerm: searchQuery,
        },
    });

    const { data: protocolDetailsResponse, isLoading: isLoadingDetails } = useEmergencyProtocol({
        protocolId: selectedProtocolId || '',
        queryConfig: {
            enabled: !!selectedProtocolId,
            // Add these to ensure fresh data
            staleTime: 0,
            cacheTime: 0,
        },
    });

    const { data: planDetailsResponse, isLoading: isLoadingPlan } = useProductionPlan({
        planId,
        queryConfig: {
            enabled: isOpen,
        },
    });

    const resolveMutation = useResolveEmergency({
        mutationConfig: {
            onSuccess: () => {
                addNotification({
                    type: 'success',
                    title: 'Emergency Resolved',
                    message: 'Emergency plan has been successfully resolved.',
                });
                handleClose();
            },
        },
    });

    const protocols = protocolsResponse?.data || [];
    const protocolDetails = protocolDetailsResponse?.data || protocolDetailsResponse;
    const planDetails = planDetailsResponse;

    useEffect(() => {
        if (planDetails && editableStages.length === 0) {
            const stages: EditableStage[] = planDetails.stages.map(stage => ({
                stageName: stage.stageName,
                sequenceOrder: stage.sequenceOrder,
                tasks: stage.tasks.map(task => ({
                    taskName: task.taskName,
                    description: task.description || '',
                    taskType: task.taskType,
                    daysAfter: calculateDaysAfter(planDetails.basePlantingDate, task.scheduledDate),
                    durationDays: calculateDuration(task.scheduledDate, task.scheduledEndDate),
                    priority: task.priority,
                    sequenceOrder: task.sequenceOrder,
                    isFromProtocol: false,
                    originalTaskId: task.id, // Store ProductionPlanTask.Id
                    materials: task.materials.map(m => ({
                        materialId: m.materialId,
                        quantityPerHa: m.quantityPerHa,
                    })),
                })),
            }));
            setEditableStages(stages);
        }
    }, [planDetails, editableStages.length]);

    useEffect(() => {
        console.log('protocolDetails changed:', protocolDetails);
        console.log('selectedProtocolId:', selectedProtocolId);
        console.log('isLoadingDetails:', isLoadingDetails);
    }, [protocolDetails, selectedProtocolId, isLoadingDetails]);

    const handleClose = () => {
        setStep('protocol');
        setSearchQuery('');
        setSelectedProtocolId(null);
        setEditableStages([]);
        setSelectedPlotIds(new Set());
        setProductionStageId('');
        setIsAddingTask(false);
        setAddingToStageIndex(null);
        setAddingToTaskPosition(null);
        setAddTaskMode(null);
        setSelectedProtocolTasks(new Set());
        reset();
        onClose();
    };

    const handleSelectProtocol = (protocolId: string) => {
        setSelectedProtocolId(protocolId);
        // DON'T clear stages - they come from the plan, not protocol
    };

    const handleAddTaskFromProtocol = () => {
        if (!protocolDetails || addingToStageIndex === null || addingToTaskPosition === null) return;

        const selectedTasks: EditableTask[] = [];
        protocolDetails.stages.forEach(stage => {
            stage.tasks.forEach(task => {
                const taskKey = `${stage.sequenceOrder}-${task.sequenceOrder}`;
                if (selectedProtocolTasks.has(taskKey)) {
                    selectedTasks.push({
                        taskName: task.taskName,
                        description: task.description || '',
                        taskType: task.taskType,
                        daysAfter: task.daysAfter,
                        durationDays: task.durationDays,
                        priority: task.priority,
                        sequenceOrder: 0, // Will be updated below
                        isFromProtocol: true,
                        materials: task.materials.map(m => ({
                            materialId: m.materialId,
                            quantityPerHa: m.quantityPerHa,
                        })),
                    });
                }
            });
        });

        const newStages = [...editableStages];
        // Insert tasks at the specified position
        newStages[addingToStageIndex].tasks.splice(addingToTaskPosition, 0, ...selectedTasks);
        // Update sequence orders
        newStages[addingToStageIndex].tasks.forEach((task, idx) => {
            task.sequenceOrder = idx;
        });
        setEditableStages(newStages);
        setIsAddingTask(false);
        setAddingToStageIndex(null);
        setAddingToTaskPosition(null);
        setAddTaskMode(null);
        setSelectedProtocolTasks(new Set());
    };

    const handleAddNewTask = (stageIndex: number, position: number) => {
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
            materials: [],
        };

        newStages[stageIndex].tasks.splice(position, 0, newTask);
        // Update sequence orders
        newStages[stageIndex].tasks.forEach((task, idx) => {
            task.sequenceOrder = idx;
        });
        setEditableStages(newStages);
        setAddingToStageIndex(null);
        setAddingToTaskPosition(null);
        setAddTaskMode(null);
    };

    const handleOpenAddTaskMenu = (stageIndex: number, position: number) => {
        setAddingToStageIndex(stageIndex);
        setAddingToTaskPosition(position);
        setAddTaskMode(null);
        setIsAddingTask(true);
    };

    const handleRemoveTask = (stageIndex: number, taskIndex: number) => {
        const newStages = [...editableStages];
        newStages[stageIndex].tasks.splice(taskIndex, 1);
        newStages[stageIndex].tasks.forEach((task, idx) => {
            task.sequenceOrder = idx;
        });
        setEditableStages(newStages);
    };

    const handleMoveTask = (stageIndex: number, taskIndex: number, direction: 'up' | 'down') => {
        const newStages = [...editableStages];
        const tasks = newStages[stageIndex].tasks;
        const newIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;

        if (newIndex < 0 || newIndex >= tasks.length) return;

        [tasks[taskIndex], tasks[newIndex]] = [tasks[newIndex], tasks[taskIndex]];
        tasks.forEach((task, idx) => {
            task.sequenceOrder = idx;
        });

        setEditableStages(newStages);
    };

    const handleUpdateTask = (stageIndex: number, taskIndex: number, updates: Partial<EditableTask>) => {
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

    // Update the handleResolve function to properly map the tasks:
    const handleResolve = (formData: FormData) => {
        if (!user?.id || !planDetails || selectedPlotIds.size === 0) return;

        // Get the ProductionStageId from the first stage (or let user select)
        const firstStageId = planDetails.stages[0]?.id;
        if (!firstStageId) {
            addNotification({
                type: 'error',
                title: 'No Stage Found',
                message: 'No production stage found in the plan.',
            });
            return;
        }

        // Convert editable tasks to BaseCultivationTaskRequest format
        const baseCultivationTasks: any[] = [];

        editableStages.forEach((stage) => {
            stage.tasks.forEach((task) => {
                const scheduledDate = new Date(planDetails.basePlantingDate);
                scheduledDate.setDate(scheduledDate.getDate() + task.daysAfter);

                const scheduledEndDate = new Date(scheduledDate);
                scheduledEndDate.setDate(scheduledEndDate.getDate() + task.durationDays - 1);

                baseCultivationTasks.push({
                    // Use originalTaskId if exists (for existing ProductionPlanTask)
                    // Leave null for new tasks (backend will create "EmergencySolution" task)
                    productionPlanTaskId: task.originalTaskId || null,
                    taskName: task.taskName,
                    description: task.description,
                    taskType: task.taskType,
                    scheduledEndDate: scheduledEndDate.toISOString(),
                    status: 'Draft',
                    executionOrder: task.sequenceOrder,
                    isContingency: true,
                    contingencyReason: formData.resolutionReason,
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

        resolveMutation.mutate({
            planId,
            newVersionName: formData.versionName,
            resolutionReason: formData.resolutionReason,
            expertId: user.id,
            productionStageId: firstStageId, // Use first stage or selected stage
            plotIds: Array.from(selectedPlotIds),
            baseCultivationTasks,
        });
    };

    const calculateDaysAfter = (basePlantingDate: string, scheduledDate: string): number => {
        const base = new Date(basePlantingDate);
        const scheduled = new Date(scheduledDate);
        const diffTime = scheduled.getTime() - base.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const calculateDuration = (scheduledDate: string, scheduledEndDate: string | null): number => {
        if (!scheduledEndDate) return 1;
        const start = new Date(scheduledDate);
        const end = new Date(scheduledEndDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(1, diffDays + 1);
    };

    const isLoading = resolveMutation.isPending || isLoadingPlan;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

                <div className="relative z-10 w-full max-w-7xl rounded-lg bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Resolve Emergency</h2>
                            <p className="text-sm text-gray-600 mt-1">{planName}</p>
                        </div>
                        <button onClick={handleClose} className="rounded-full p-2 hover:bg-gray-100">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Steps Indicator */}
                    <div className="border-b px-6 py-3 bg-gray-50">
                        <div className="flex items-center gap-2 text-sm">
                            <span className={`px-3 py-1 rounded-full ${step === 'protocol' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-200 text-gray-600'}`}>
                                1. Protocol & Report
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <span className={`px-3 py-1 rounded-full ${step === 'plots' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-200 text-gray-600'}`}>
                                2. Select Plots
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <span className={`px-3 py-1 rounded-full ${step === 'edit' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-200 text-gray-600'}`}>
                                3. Edit Tasks
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <span className={`px-3 py-1 rounded-full ${step === 'name' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-200 text-gray-600'}`}>
                                4. Version Name
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <span className={`px-3 py-1 rounded-full ${step === 'preview' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-200 text-gray-600'}`}>
                                5. Preview
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Step 1: Protocol Selection */}
                        {step === 'protocol' && (
                            <div className="grid grid-cols-3 gap-4 h-[600px]">
                                {/* Left: Current Plan Info + Resolution Reason */}
                                <div className="col-span-1 border-r pr-4 space-y-4">
                                    {/* Current Plan Summary */}
                                    {isLoadingPlan ? (
                                        <div className="flex justify-center py-4">
                                            <Spinner size="md" />
                                        </div>
                                    ) : planDetails && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4" />
                                                Current Emergency Plan
                                            </h3>
                                            <dl className="space-y-2 text-sm">
                                                <div>
                                                    <dt className="text-yellow-700 font-medium">Plan Name:</dt>
                                                    <dd className="text-gray-900">{planDetails.planName}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-yellow-700 font-medium">Total Area:</dt>
                                                    <dd className="text-gray-900">{planDetails.totalArea} ha</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-yellow-700 font-medium">Cluster:</dt>
                                                    <dd className="text-gray-900">{planDetails.groupDetails.clusterName}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-yellow-700 font-medium">Estimated Cost:</dt>
                                                    <dd className="text-gray-900">
                                                        {new Intl.NumberFormat('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND',
                                                        }).format(planDetails.estimatedTotalPlanCost)}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-yellow-700 font-medium">Current Stages:</dt>
                                                    <dd className="text-gray-900">{planDetails.stages.length} stages</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-yellow-700 font-medium">Total Tasks:</dt>
                                                    <dd className="text-gray-900">
                                                        {planDetails.stages.reduce((sum, stage) => sum + stage.tasks.length, 0)} tasks
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-yellow-700 font-medium">Plots:</dt>
                                                    <dd className="text-gray-900">{planDetails.groupDetails.plots.length} plots</dd>
                                                </div>
                                            </dl>
                                        </div>
                                    )}

                                    {/* Resolution Reason */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Resolution Report *</h3>
                                        <textarea
                                            {...register('resolutionReason', { required: 'Resolution reason is required' })}
                                            rows={8}
                                            placeholder="Describe the emergency situation and resolution approach..."
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.resolutionReason && (
                                            <p className="text-xs text-red-600 mt-1">{errors.resolutionReason.message}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2">This will be saved with the resolution</p>
                                    </div>
                                </div>

                                {/* Right: Protocol Search and Selection */}
                                <div className="col-span-2 space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Search Emergency Protocol</h3>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search protocols..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {isLoadingProtocols ? (
                                        <div className="flex justify-center py-8">
                                            <Spinner size="lg" />
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                            {protocols.map((protocol) => (
                                                <button
                                                    key={protocol.id}
                                                    onClick={() => handleSelectProtocol(protocol.id)}
                                                    className={`w-full text-left rounded-lg border-2 p-3 transition-colors ${selectedProtocolId === protocol.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="font-medium text-gray-900">{protocol.planName}</div>
                                                    <div className="text-sm text-gray-600 mt-1">{protocol.description}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Selected Protocol Details */}
                                    {selectedProtocolId && protocolDetails && (
                                        <div className="border-t pt-4 mt-4">
                                            <h4 className="font-semibold text-gray-900 mb-3">Protocol Preview</h4>
                                            {isLoadingDetails ? (
                                                <div className="flex justify-center py-4">
                                                    <Spinner size="md" />
                                                </div>
                                            ) : (
                                                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                                    {/* Protocol Summary */}
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                        <h5 className="font-medium text-blue-900 mb-2">{protocolDetails.planName}</h5>
                                                        <p className="text-sm text-gray-700 mb-2">{protocolDetails.description}</p>
                                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                                            <div>
                                                                <span className="text-gray-600">Duration:</span>
                                                                <span className="font-medium ml-1">{protocolDetails.totalDurationDays} days</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600">Stages:</span>
                                                                <span className="font-medium ml-1">{protocolDetails.totalStages}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600">Tasks:</span>
                                                                <span className="font-medium ml-1">{protocolDetails.totalTasks}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Thresholds */}
                                                    {protocolDetails.thresholds && protocolDetails.thresholds.length > 0 && (
                                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                                            <h6 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                                                                <AlertTriangle className="h-4 w-4" />
                                                                Thresholds ({protocolDetails.thresholds.length})
                                                            </h6>
                                                            <div className="space-y-2">
                                                                {protocolDetails.thresholds.map((threshold, idx) => (
                                                                    <div key={idx} className="text-xs bg-white rounded p-2 border">
                                                                        {threshold.pestProtocolName && (
                                                                            <div className="text-red-700 font-medium">
                                                                                🐛 Pest: {threshold.pestProtocolName}
                                                                                {threshold.pestSeverityLevel && ` (${threshold.pestSeverityLevel})`}
                                                                            </div>
                                                                        )}
                                                                        {threshold.weatherProtocolName && (
                                                                            <div className="text-blue-700 font-medium">
                                                                                ☁️ Weather: {threshold.weatherProtocolName}
                                                                                {threshold.weatherIntensityLevel && ` (${threshold.weatherIntensityLevel})`}
                                                                            </div>
                                                                        )}
                                                                        {threshold.applicableSeason && (
                                                                            <div className="text-gray-600 mt-1">Season: {threshold.applicableSeason}</div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Stages and Tasks */}
                                                    {protocolDetails.stages.map((stage, stageIdx) => (
                                                        <div key={stageIdx} className="border rounded-lg p-3 bg-white">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                                                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">
                                                                        {stageIdx + 1}
                                                                    </span>
                                                                    {stage.stageName}
                                                                </div>
                                                                <span className="text-xs text-gray-600">
                                                                    {stage.expectedDurationDays} days • {stage.tasks.length} tasks
                                                                </span>
                                                            </div>
                                                            {stage.notes && (
                                                                <p className="text-xs text-gray-600 italic mb-2">{stage.notes}</p>
                                                            )}
                                                            <div className="space-y-1.5 pl-8">
                                                                {stage.tasks.map((task, taskIdx) => (
                                                                    <div key={taskIdx} className="text-sm text-gray-700 flex items-start gap-2">
                                                                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex-shrink-0 mt-0.5">
                                                                            {taskIdx + 1}
                                                                        </span>
                                                                        <div className="flex-1">
                                                                            <div className="font-medium">{task.taskName}</div>
                                                                            {task.description && (
                                                                                <div className="text-xs text-gray-600">{task.description}</div>
                                                                            )}
                                                                            <div className="flex gap-2 mt-1 text-xs">
                                                                                <span className="px-2 py-0.5 bg-gray-100 rounded">{task.taskType}</span>
                                                                                <span className="px-2 py-0.5 bg-gray-100 rounded">Day {task.daysAfter}</span>
                                                                                <span className="px-2 py-0.5 bg-gray-100 rounded">{task.durationDays}d</span>
                                                                                {task.priority !== 'Normal' && (
                                                                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                                                                                        {task.priority}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Plot Selection */}
                        {step === 'plots' && planDetails && (
                            <div className="space-y-4">
                                <div className="rounded-lg border bg-blue-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-blue-900">Select Plots for Emergency Resolution</h4>
                                            <p className="text-sm text-blue-700 mt-1">
                                                Choose which plots will receive the emergency cultivation tasks. Tasks will be scaled by each plot's area.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
                                    {planDetails.groupDetails.plots.map((plot) => {
                                        const isSelected = selectedPlotIds.has(plot.id);
                                        return (
                                            <label
                                                key={plot.id}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            const newSelected = new Set(selectedPlotIds);
                                                            if (e.target.checked) {
                                                                newSelected.add(plot.id);
                                                            } else {
                                                                newSelected.delete(plot.id);
                                                            }
                                                            setSelectedPlotIds(newSelected);
                                                        }}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">{plot.plotName}</div>
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            Area: {plot.area} ha
                                                        </div>
                                                        {plot.coordinates && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Location: {plot.coordinates}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-green-900 font-medium">
                                            {selectedPlotIds.size} plot{selectedPlotIds.size !== 1 ? 's' : ''} selected
                                        </span>
                                        {selectedPlotIds.size > 0 && (
                                            <button
                                                onClick={() => setSelectedPlotIds(new Set())}
                                                className="text-xs text-green-700 hover:text-green-800 underline"
                                            >
                                                Clear selection
                                            </button>
                                        )}
                                    </div>
                                    {selectedPlotIds.size === 0 && (
                                        <p className="text-xs text-green-700 mt-1">Please select at least one plot to continue</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Edit Tasks */}
                        {step === 'edit' && (
                            <>
                                {isLoadingPlan ? (
                                    <div className="flex h-64 items-center justify-center">
                                        <Spinner size="lg" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="rounded-lg border bg-blue-50 p-4">
                                            <div className="flex items-start gap-3">
                                                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                                                <div>
                                                    <h4 className="font-semibold text-blue-900">Step 3: Edit Emergency Resolution Tasks</h4>
                                                    <p className="text-sm text-blue-700 mt-1">
                                                        Modify existing tasks, add tasks from the selected protocol, or create new custom tasks.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Editable Stages */}
                                        <div className="rounded-lg border bg-white p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-gray-900">Cultivation Stages & Tasks</h3>
                                            </div>

                                            <div className="space-y-4">
                                                {editableStages.map((stage, stageIndex) => {
                                                    return (
                                                        <div key={stageIndex} className="relative">
                                                            <div className="rounded-lg border-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 p-3 shadow-sm">
                                                                {/* Stage Header - DISABLED */}
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
                                                                                    disabled={true}
                                                                                    className="block w-full rounded-md border border-gray-300 bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-600 cursor-not-allowed"
                                                                                />
                                                                            </div>
                                                                            <input
                                                                                type="number"
                                                                                value={stage.sequenceOrder}
                                                                                disabled
                                                                                className="col-span-3 block w-full rounded-md border border-gray-300 bg-gray-100 px-2.5 py-1 text-sm"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Tasks Grid */}
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between rounded-md bg-blue-50 px-2.5 py-1.5">
                                                                        <span className="text-xs font-semibold text-blue-900">
                                                                            Tasks ({stage.tasks.length})
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleOpenAddTaskMenu(stageIndex, stage.tasks.length)}
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
                                                                                            onClick={() => handleOpenAddTaskMenu(stageIndex, 0)}
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
                                                                                            <div className="flex items-center gap-1">
                                                                                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold">
                                                                                                    {taskIndex + 1}
                                                                                                </span>
                                                                                                {task.isFromProtocol && (
                                                                                                    <span className="inline-block text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                                                                                        Protocol
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleRemoveTask(stageIndex, taskIndex)}
                                                                                                disabled={isLoading}
                                                                                                className="p-0.5 text-red-600 hover:bg-red-50 rounded hover:text-red-700"
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
                                                                                                    onChange={(e) => handleUpdateTask(stageIndex, taskIndex, { taskName: e.target.value })}
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
                                                                                                    onChange={(e) => handleUpdateTask(stageIndex, taskIndex, { description: e.target.value })}
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
                                                                                                        onChange={(e) => handleUpdateTask(stageIndex, taskIndex, { daysAfter: parseInt(e.target.value) || 0 })}
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
                                                                                                        onChange={(e) => handleUpdateTask(stageIndex, taskIndex, { durationDays: parseInt(e.target.value) || 1 })}
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
                                                                                                    onChange={(e) => handleUpdateTask(stageIndex, taskIndex, { taskType: e.target.value })}
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
                                                                                                    onChange={(e) => handleUpdateTask(stageIndex, taskIndex, { priority: e.target.value })}
                                                                                                    disabled={isLoading}
                                                                                                    className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                                                                                >
                                                                                                    <option value="Low">Low</option>
                                                                                                    <option value="Normal">Normal</option>
                                                                                                    <option value="High">High</option>
                                                                                                    <option value="Critical">Critical</option>
                                                                                                </select>
                                                                                            </div>

                                                                                            {/* Materials - if needed */}
                                                                                            {task.materials && task.materials.length > 0 && (
                                                                                                <div className="rounded-md border border-gray-200 bg-gray-50 p-1.5">
                                                                                                    <span className="text-[10px] font-semibold text-gray-700">
                                                                                                        Materials ({task.materials.length})
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Add task after this task - small icon button */}
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleOpenAddTaskMenu(stageIndex, taskIndex + 1)}
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
                                                                                onClick={() => handleOpenAddTaskMenu(stageIndex, 0)}
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
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* Add Task Mode Selection Modal */}
                        {isAddingTask && addTaskMode === null && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                                <div
                                    className="fixed inset-0 bg-black/50"
                                    onClick={() => {
                                        setIsAddingTask(false);
                                        setAddingToStageIndex(null);
                                        setAddingToTaskPosition(null);
                                    }}
                                />
                                <div className="relative z-[70] w-full max-w-md bg-white rounded-lg shadow-xl p-6">
                                    <h3 className="font-semibold text-lg mb-4">Add Task</h3>
                                    <p className="text-sm text-gray-600 mb-4">Choose how to add a task:</p>
                                    <div className="space-y-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('Create New Task clicked');
                                                if (addingToStageIndex !== null && addingToTaskPosition !== null) {
                                                    handleAddNewTask(addingToStageIndex, addingToTaskPosition);
                                                }
                                            }}
                                            className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                                        >
                                            <div className="font-medium text-blue-900">Create New Task</div>
                                            <div className="text-sm text-blue-700 mt-1">Create a custom task from scratch</div>
                                        </button>
                                        {selectedProtocolId && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Add from Protocol button clicked');
                                                    console.log('protocolDetails:', protocolDetails);
                                                    console.log('isLoadingDetails:', isLoadingDetails);
                                                    console.log('selectedProtocolId:', selectedProtocolId);

                                                    if (!protocolDetails) {
                                                        console.log('protocolDetails is null/undefined - showing error');
                                                        addNotification({
                                                            type: 'error',
                                                            title: 'Protocol Not Loaded',
                                                            message: 'Please wait for the protocol details to load.',
                                                        });
                                                        return;
                                                    }

                                                    console.log('Setting addTaskMode to protocol');
                                                    setAddTaskMode('protocol');
                                                }}
                                                disabled={isLoadingDetails}
                                                className="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div className="font-medium text-green-900">
                                                    {isLoadingDetails ? 'Loading Protocol...' : 'Add from Protocol'}
                                                </div>
                                                <div className="text-sm text-green-700 mt-1">
                                                    {isLoadingDetails
                                                        ? 'Please wait...'
                                                        : 'Select tasks from the emergency protocol'}
                                                </div>
                                            </button>
                                        )}
                                        {!selectedProtocolId && (
                                            <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                                                <div className="font-medium text-gray-500">Add from Protocol</div>
                                                <div className="text-sm text-gray-400 mt-1">
                                                    No protocol selected in Step 1
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <Button variant="outline" onClick={() => {
                                            setIsAddingTask(false);
                                            setAddingToStageIndex(null);
                                            setAddingToTaskPosition(null);
                                        }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Task Selection from Protocol Modal */}
                        {isAddingTask && addTaskMode === 'protocol' && (
                            protocolDetails ? (
                                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                                    <div className="fixed inset-0 bg-black/50" onClick={() => {
                                        setIsAddingTask(false);
                                        setAddingToStageIndex(null);
                                        setAddingToTaskPosition(null);
                                        setAddTaskMode(null);
                                        setSelectedProtocolTasks(new Set());
                                    }} />
                                    <div className="relative z-[90] w-full max-w-3xl bg-white rounded-lg shadow-xl p-6 max-h-[80vh] overflow-y-auto">
                                        <h3 className="font-semibold text-lg mb-4">Select Tasks from Protocol</h3>
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                                            {protocolDetails.stages.map((stage, stageIdx) => (
                                                <div key={stageIdx} className="border rounded-lg p-3">
                                                    <div className="font-medium mb-2">{stage.stageName}</div>
                                                    <div className="space-y-2">
                                                        {stage.tasks.map((task, taskIdx) => {
                                                            const taskKey = `${stage.sequenceOrder}-${task.sequenceOrder}`;
                                                            return (
                                                                <label key={taskIdx} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedProtocolTasks.has(taskKey)}
                                                                        onChange={(e) => {
                                                                            const newSelected = new Set(selectedProtocolTasks);
                                                                            if (e.target.checked) {
                                                                                newSelected.add(taskKey);
                                                                            } else {
                                                                                newSelected.delete(taskKey);
                                                                            }
                                                                            setSelectedProtocolTasks(newSelected);
                                                                        }}
                                                                        className="rounded"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="text-sm font-medium">{task.taskName}</div>
                                                                        {task.description && (
                                                                            <div className="text-xs text-gray-600">{task.description}</div>
                                                                        )}
                                                                        <div className="flex gap-2 mt-1">
                                                                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{task.taskType}</span>
                                                                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">Day {task.daysAfter}</span>
                                                                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{task.durationDays}d</span>
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 justify-end border-t pt-4">
                                            <Button variant="outline" onClick={() => {
                                                setAddTaskMode(null);
                                                setSelectedProtocolTasks(new Set());
                                            }}>
                                                Back
                                            </Button>
                                            <Button onClick={handleAddTaskFromProtocol} disabled={selectedProtocolTasks.size === 0}>
                                                Add {selectedProtocolTasks.size} Task(s)
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                                    <div className="fixed inset-0 bg-black/50" onClick={() => {
                                        setAddTaskMode(null);
                                    }} />
                                    <div className="relative z-[90] w-full max-w-md bg-white rounded-lg shadow-xl p-6">
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <Spinner size="lg" />
                                            <p className="text-sm text-gray-600 mt-4">Loading protocol details...</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}

                        {/* Step 4: Version Name */}
                        {step === 'name' && (
                            <div className="max-w-2xl mx-auto space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Version Name *
                                    </label>
                                    <input
                                        type="text"
                                        {...register('versionName', { required: 'Version name is required' })}
                                        placeholder="e.g., Emergency Resolution v2.0"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.versionName && (
                                        <p className="text-sm text-red-600 mt-1">{errors.versionName.message}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 5: Preview */}
                        {step === 'preview' && (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {/* Header Info */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 mb-2">Resolution Summary</h3>
                                    <dl className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <dt className="text-blue-700 font-medium">Version Name:</dt>
                                            <dd className="text-gray-900">{watch('versionName')}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-blue-700 font-medium">Selected Plots:</dt>
                                            <dd className="text-gray-900">{selectedPlotIds.size} plots</dd>
                                        </div>
                                        <div className="col-span-2">
                                            <dt className="text-blue-700 font-medium">Resolution Reason:</dt>
                                            <dd className="text-gray-900 text-xs mt-1">{watch('resolutionReason')}</dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* Current Plan vs New Solution Comparison */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Current Plan */}
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5" />
                                            Current Emergency Plan
                                        </h3>
                                        {planDetails && (
                                            <>
                                                <dl className="space-y-2 text-sm mb-4">
                                                    <div className="flex justify-between">
                                                        <dt className="text-yellow-700">Stages:</dt>
                                                        <dd className="font-medium">{planDetails.stages.length}</dd>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <dt className="text-yellow-700">Total Tasks:</dt>
                                                        <dd className="font-medium">
                                                            {planDetails.stages.reduce((sum, stage) => sum + stage.tasks.length, 0)}
                                                        </dd>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <dt className="text-yellow-700">Est. Cost:</dt>
                                                        <dd className="font-medium">
                                                            {new Intl.NumberFormat('vi-VN', {
                                                                style: 'currency',
                                                                currency: 'VND',
                                                            }).format(planDetails.estimatedTotalPlanCost)}
                                                        </dd>
                                                    </div>
                                                </dl>

                                                {/* Current Tasks List */}
                                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                                    {planDetails.stages.map((stage, idx) => (
                                                        <div key={idx} className="bg-white rounded p-2 border border-yellow-300">
                                                            <div className="font-medium text-xs text-yellow-900 mb-1">
                                                                {stage.stageName}
                                                            </div>
                                                            <div className="space-y-1">
                                                                {stage.tasks.map((task, taskIdx) => (
                                                                    <div key={taskIdx} className="text-xs text-gray-700 pl-2">
                                                                        • {task.taskName}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* New Solution */}
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            New Solution
                                        </h3>
                                        <dl className="space-y-2 text-sm mb-4">
                                            <div className="flex justify-between">
                                                <dt className="text-green-700">Protocol:</dt>
                                                <dd className="font-medium text-xs">{protocolDetails?.planName || 'None'}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-green-700">Stages:</dt>
                                                <dd className="font-medium">{editableStages.length}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-green-700">Total Tasks:</dt>
                                                <dd className="font-medium">
                                                    {editableStages.reduce((sum, stage) => sum + stage.tasks.length, 0)}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-green-700">Selected Plots:</dt>
                                                <dd className="font-medium">{selectedPlotIds.size} plots</dd>
                                            </div>
                                        </dl>

                                        {/* New Tasks List */}
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                            {editableStages.map((stage, idx) => (
                                                <div key={idx} className="bg-white rounded p-2 border border-green-300">
                                                    <div className="font-medium text-xs text-green-900 mb-1 flex items-center justify-between">
                                                        <span>{stage.stageName}</span>
                                                        <span className="text-[10px] text-gray-600">
                                                            {stage.tasks.length} tasks
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {stage.tasks.map((task, taskIdx) => (
                                                            <div key={taskIdx} className="text-xs text-gray-700 pl-2 flex items-start gap-1">
                                                                <span>•</span>
                                                                <div className="flex-1">
                                                                    <div className="font-medium">{task.taskName}</div>
                                                                    <div className="text-[10px] text-gray-600">
                                                                        Day {task.daysAfter} • {task.durationDays}d • {task.taskType}
                                                                        {task.isFromProtocol && (
                                                                            <span className="ml-1 px-1 py-0.5 bg-green-100 text-green-700 rounded">
                                                                                From Protocol
                                                                            </span>
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

                                {/* Selected Plots Preview */}
                                {planDetails && selectedPlotIds.size > 0 && (
                                    <div className="bg-white border rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3">Selected Plots ({selectedPlotIds.size})</h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            {planDetails.groupDetails.plots
                                                .filter(plot => selectedPlotIds.has(plot.id))
                                                .map((plot) => (
                                                    <div key={plot.id} className="border rounded-lg p-2 bg-gray-50">
                                                        <div className="font-medium text-sm">{plot.plotName}</div>
                                                        <div className="text-xs text-gray-600 mt-1">
                                                            {plot.area} ha
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Changes Summary */}
                                <div className="bg-white border rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3">Impact Summary</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700">Tasks Added:</span>
                                            <span className="font-medium text-green-600">
                                                +{editableStages.reduce((sum, stage) => sum + stage.tasks.filter(t => t.isFromProtocol || !t.originalTaskId).length, 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700">Existing Tasks Modified:</span>
                                            <span className="font-medium text-blue-600">
                                                {editableStages.reduce((sum, stage) => sum + stage.tasks.filter(t => t.originalTaskId && !t.isFromProtocol).length, 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700">Total Cultivation Tasks Created:</span>
                                            <span className="font-medium text-purple-600">
                                                {editableStages.reduce((sum, stage) => sum + stage.tasks.length, 0) * selectedPlotIds.size}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                                        ℹ️ Each task will be created for all {selectedPlotIds.size} selected plot{selectedPlotIds.size !== 1 ? 's' : ''},
                                        with materials scaled by each plot's area.
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="border-t px-6 py-4 flex justify-between bg-gray-50">
                            {/* Footer */}
                            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                                Cancel
                            </Button>
                            <div className="flex gap-2">
                                {step !== 'protocol' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            if (step === 'plots') setStep('protocol');
                                            else if (step === 'edit') setStep('plots');
                                            else if (step === 'name') setStep('edit');
                                            else if (step === 'preview') setStep('name');
                                        }}
                                        disabled={isLoading}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Back
                                    </Button>
                                )}

                                {step === 'protocol' && (
                                    <Button
                                        onClick={() => setStep('plots')}
                                        disabled={!planDetails || isLoadingPlan}
                                    >
                                        Next: Select Plots
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                )}

                                {step === 'plots' && (
                                    <Button
                                        onClick={() => setStep('edit')}
                                        disabled={selectedPlotIds.size === 0}
                                    >
                                        Next: Edit Tasks
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                )}

                                {step === 'edit' && (
                                    <Button onClick={() => setStep('name')} disabled={isLoading}>
                                        Next: Version Name
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                )}

                                {step === 'name' && (
                                    <Button onClick={() => setStep('preview')} disabled={isLoading}>
                                        Next: Preview
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                )}

                                {step === 'preview' && (
                                    <Button
                                        onClick={handleSubmit(handleResolve)}
                                        disabled={resolveMutation.isPending || selectedPlotIds.size === 0}
                                    >
                                        {resolveMutation.isPending ? (
                                            <>
                                                <Spinner size="sm" className="mr-2" />
                                                Resolving...
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle className="h-4 w-4 mr-2" />
                                                Resolve Emergency
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
