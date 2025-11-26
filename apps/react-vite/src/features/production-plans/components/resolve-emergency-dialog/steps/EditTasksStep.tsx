import { Plus, FileText } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { EditableStage, EditableTask } from '../types';
import { TaskCard } from '../components/TaskCard';

type EditTasksStepProps = {
    editableStages: EditableStage[];
    isLoadingPlan: boolean;
    isLoading: boolean;
    validationErrors: { [key: string]: boolean };
    fertilizers: any[];
    pesticides: any[];
    isLoadingMaterials: boolean;
    handleUpdateTask: (stageIndex: number, taskIndex: number, updates: Partial<EditableTask>) => void;
    handleRemoveTask: (stageIndex: number, taskIndex: number) => void;
    handleUpdateMaterial: (
        stageIndex: number,
        taskIndex: number,
        materialIndex: number,
        field: 'materialId' | 'quantityPerHa',
        value: string | number
    ) => void;
    handleRemoveMaterial: (stageIndex: number, taskIndex: number, materialIndex: number) => void;
    handleAddMaterial: (stageIndex: number, taskIndex: number) => void;
    handleOpenAddTaskMenu: (stageIndex: number, position: number) => void;
};

export const EditTasksStep = ({
    editableStages,
    isLoadingPlan,
    isLoading,
    validationErrors,
    fertilizers,
    pesticides,
    isLoadingMaterials,
    handleUpdateTask,
    handleRemoveTask,
    handleUpdateMaterial,
    handleRemoveMaterial,
    handleAddMaterial,
    handleOpenAddTaskMenu,
}: EditTasksStepProps) => {
    if (isLoadingPlan) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
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
                                                    <TaskCard
                                                        key={taskIndex}
                                                        task={task}
                                                        stageIndex={stageIndex}
                                                        taskIndex={taskIndex}
                                                        isLoading={isLoading}
                                                        hasTaskError={hasTaskError}
                                                        fertilizers={fertilizers}
                                                        pesticides={pesticides}
                                                        isLoadingMaterials={isLoadingMaterials}
                                                        onUpdateTask={handleUpdateTask}
                                                        onRemoveTask={handleRemoveTask}
                                                        onUpdateMaterial={handleUpdateMaterial}
                                                        onRemoveMaterial={handleRemoveMaterial}
                                                        onAddMaterial={handleAddMaterial}
                                                        onOpenAddTaskMenu={handleOpenAddTaskMenu}
                                                    />
                                                );
                                            })}
                                        </div>

                                        {stage.tasks.length === 0 && (
                                            <div className="text-center py-8">
                                                <p className="text-xs text-gray-500 italic mb-3">No tasks yet.</p>
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
                        {editableStages.length} stage{editableStages.length !== 1 ? 's' : ''} •{' '}
                        {editableStages.reduce((sum, s) => sum + s.tasks.length, 0)} tasks
                    </p>
                </div>
            </div>
        </>
    );
};

