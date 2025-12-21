import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useEmergencyProtocols } from '@/features/emergency-protocols/api/get-emergency-protocols';
import { useEmergencyProtocol } from '@/features/emergency-protocols/api/get-emergency-protocol';
import { useResolveEmergency } from '../../api/resolve-emergency';
import { useNotifications } from '@/components/ui/notifications';
import { useUser } from '@/lib/auth';
import { useProductionPlan } from '../../api/get-production-plan';
import { ResolveEmergencyDialogProps, FormData, EditableStage, Step, AddTaskMode } from './types';
import { convertPlanToEditableStages, convertEditableTasksToPayload } from './utils/taskTransformers';
import { useTaskManagement } from './hooks/useTaskManagement';
import { useMaterialsData } from './hooks/useMaterialsData';
import { StepsIndicator } from './components/StepsIndicator';
import { AddTaskModal } from './components/AddTaskModal';
import { ProtocolSelectionStep } from './steps/ProtocolSelectionStep';
import { PlotSelectionStep } from './steps/PlotSelectionStep';
import { EditTasksStep } from './steps/EditTasksStep';
import { VersionNameStep } from './steps/VersionNameStep';
import { PreviewStep } from './steps/PreviewStep';

export const ResolveEmergencyDialog = ({
    isOpen,
    onClose,
    planId,
    planName,
}: ResolveEmergencyDialogProps) => {
    const [step, setStep] = useState<Step>('protocol');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);
    const [editableStages, setEditableStages] = useState<EditableStage[]>([]);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [addingToStageIndex, setAddingToStageIndex] = useState<number | null>(null);
    const [addingToTaskPosition, setAddingToTaskPosition] = useState<number | null>(null);
    const [addTaskMode, setAddTaskMode] = useState<AddTaskMode>(null);
    const [selectedProtocolTasks, setSelectedProtocolTasks] = useState<Set<string>>(new Set());
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});
    const [selectedPlotIds, setSelectedPlotIds] = useState<Set<string>>(new Set());

    const { data: user } = useUser();
    const { addNotification } = useNotifications();
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>();
    const { fertilizers, pesticides, isLoadingMaterials } = useMaterialsData();

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
            staleTime: 0,
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

    const taskManagement = useTaskManagement(
        editableStages,
        setEditableStages,
        validationErrors,
        setValidationErrors
    );

    useEffect(() => {
        if (planDetails && editableStages.length === 0) {
            setEditableStages(convertPlanToEditableStages(planDetails));
        }
    }, [planDetails, editableStages.length]);

    const handleClose = () => {
        setStep('protocol');
        setSearchQuery('');
        setSelectedProtocolId(null);
        setEditableStages([]);
        setSelectedPlotIds(new Set());
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
    };

    const handleOpenAddTaskMenu = (stageIndex: number, position: number) => {
        setAddingToStageIndex(stageIndex);
        setAddingToTaskPosition(position);
        setAddTaskMode(null);
        setIsAddingTask(true);
    };

    const handleAddTaskFromProtocol = () => {
        if (addingToStageIndex === null || addingToTaskPosition === null) return;

        taskManagement.handleAddTaskFromProtocol(
            protocolDetails,
            selectedProtocolTasks,
            addingToStageIndex,
            addingToTaskPosition
        );

        setIsAddingTask(false);
        setAddingToStageIndex(null);
        setAddingToTaskPosition(null);
        setAddTaskMode(null);
        setSelectedProtocolTasks(new Set());
    };

    const handleAddOldTask = () => {
        if (addingToStageIndex === null || addingToTaskPosition === null || !planDetails) return;

        // Get all tasks from the original cultivation plan
        const originalPlanTasks = planDetails.stages.flatMap((stage: any) =>
            stage.tasks.map((task: any) => ({
                ...task,
                stageName: stage.stageName,
                stageSequenceOrder: stage.sequenceOrder,
            }))
        );

        taskManagement.handleAddOldTask(
            originalPlanTasks,
            selectedProtocolTasks, // Reusing the same Set for old task IDs
            addingToStageIndex,
            addingToTaskPosition
        );

        setIsAddingTask(false);
        setAddingToStageIndex(null);
        setAddingToTaskPosition(null);
        setAddTaskMode(null);
        setSelectedProtocolTasks(new Set());
    };

    const handleResolve = (formData: FormData) => {
        if (!user?.id || !planDetails || selectedPlotIds.size === 0) return;

        const firstStageId = planDetails.stages[0]?.stageId;
        if (!firstStageId) {
            addNotification({
                type: 'error',
                title: 'No Stage Found',
                message: 'No production stage found in the plan.',
            });
            return;
        }

        const baseCultivationTasks = convertEditableTasksToPayload(
            editableStages,
            planDetails,
            formData.resolutionReason
        );

        resolveMutation.mutate({
            planId,
            newVersionName: formData.versionName,
            resolutionReason: formData.resolutionReason,
            expertId: user.id,
            productionStageId: firstStageId,
            plotIds: Array.from(selectedPlotIds),
            baseCultivationTasks,
        });
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
                    <StepsIndicator currentStep={step} />

                    {/* Content */}
                    <div className="p-6">
                        {step === 'protocol' && (
                            <ProtocolSelectionStep
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                selectedProtocolId={selectedProtocolId}
                                handleSelectProtocol={handleSelectProtocol}
                                protocols={protocols}
                                isLoadingProtocols={isLoadingProtocols}
                                protocolDetails={protocolDetails}
                                isLoadingDetails={isLoadingDetails}
                                planDetails={planDetails}
                                isLoadingPlan={isLoadingPlan}
                                register={register}
                                errors={errors}
                            />
                        )}

                        {step === 'plots' && planDetails && (
                            <PlotSelectionStep
                                planDetails={planDetails}
                                selectedPlotIds={selectedPlotIds}
                                setSelectedPlotIds={setSelectedPlotIds}
                            />
                        )}

                        {step === 'edit' && (
                            <EditTasksStep
                                editableStages={editableStages}
                                isLoadingPlan={isLoadingPlan}
                                isLoading={isLoading}
                                validationErrors={validationErrors}
                                fertilizers={fertilizers}
                                pesticides={pesticides}
                                isLoadingMaterials={isLoadingMaterials}
                                handleUpdateTask={taskManagement.handleUpdateTask}
                                handleRemoveTask={taskManagement.handleRemoveTask}
                                handleUpdateMaterial={taskManagement.handleUpdateMaterial}
                                handleRemoveMaterial={taskManagement.handleRemoveMaterial}
                                handleAddMaterial={taskManagement.handleAddMaterial}
                                handleOpenAddTaskMenu={handleOpenAddTaskMenu}
                            />
                        )}

                        {step === 'name' && <VersionNameStep register={register} errors={errors} />}

                        {step === 'preview' && planDetails && (
                            <PreviewStep
                                editableStages={editableStages}
                                planDetails={planDetails}
                                selectedPlotIds={selectedPlotIds}
                                protocolDetails={protocolDetails}
                                versionName={watch('versionName')}
                                resolutionReason={watch('resolutionReason')}
                                fertilizers={fertilizers}
                                pesticides={pesticides}
                            />
                        )}
                    </div>

                    {/* Add Task Modal */}
                    <AddTaskModal
                        isOpen={isAddingTask}
                        selectedProtocolId={selectedProtocolId}
                        protocolDetails={protocolDetails}
                        isLoadingDetails={isLoadingDetails}
                        selectedProtocolTasks={selectedProtocolTasks}
                        addTaskMode={addTaskMode}
                        onClose={() => {
                            setIsAddingTask(false);
                            setAddingToStageIndex(null);
                            setAddingToTaskPosition(null);
                            setAddTaskMode(null);
                            setSelectedProtocolTasks(new Set());
                        }}
                        onCreateNew={() => {
                            if (addingToStageIndex !== null && addingToTaskPosition !== null) {
                                taskManagement.handleAddNewTask(addingToStageIndex, addingToTaskPosition);
                            }
                            setIsAddingTask(false);
                            setAddingToStageIndex(null);
                            setAddingToTaskPosition(null);
                        }}
                        onSelectProtocol={() => setAddTaskMode('protocol')}
                        onAddFromProtocol={handleAddTaskFromProtocol}
                        onSelectOldTask={() => setAddTaskMode('old')}
                        onAddOldTask={handleAddOldTask}
                        onBack={() => {
                            setAddTaskMode(null);
                            setSelectedProtocolTasks(new Set());
                        }}
                        onToggleTask={(taskKey) => {
                            const newSelected = new Set(selectedProtocolTasks);
                            if (newSelected.has(taskKey)) {
                                newSelected.delete(taskKey);
                            } else {
                                newSelected.add(taskKey);
                            }
                            setSelectedProtocolTasks(newSelected);
                        }}
                        addNotification={addNotification}
                        originalPlanTasks={planDetails?.stages.flatMap((stage: any) =>
                            stage.tasks.map((task: any) => ({
                                ...task,
                                stageName: stage.stageName,
                                stageSequenceOrder: stage.sequenceOrder,
                            }))
                        )}
                        editableStages={editableStages}
                    />

                    {/* Footer */}
                    <div className="border-t px-6 py-4 flex justify-between bg-gray-50">
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
                                <Button onClick={() => setStep('plots')} disabled={!planDetails || isLoadingPlan}>
                                    Next: Select Plots
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            )}

                            {step === 'plots' && (
                                <Button onClick={() => setStep('edit')} disabled={selectedPlotIds.size === 0}>
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
    );
};

