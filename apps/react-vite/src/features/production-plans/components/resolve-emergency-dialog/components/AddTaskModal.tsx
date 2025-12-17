import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type AddTaskModalProps = {
    isOpen: boolean;
    selectedProtocolId: string | null;
    protocolDetails: any;
    isLoadingDetails: boolean;
    selectedProtocolTasks: Set<string>;
    addTaskMode: 'new' | 'protocol' | 'old' | null;
    onClose: () => void;
    onCreateNew: () => void;
    onSelectProtocol: () => void;
    onAddFromProtocol: () => void;
    onSelectOldTask: () => void;
    onAddOldTask: () => void;
    onBack: () => void;
    onToggleTask: (taskKey: string) => void;
    addNotification: (notification: any) => void;
    originalPlanTasks?: any[];
    editableStages?: any[];
};

export const AddTaskModal = ({
    isOpen,
    selectedProtocolId,
    protocolDetails,
    isLoadingDetails,
    selectedProtocolTasks,
    addTaskMode,
    onClose,
    onCreateNew,
    onSelectProtocol,
    onAddFromProtocol,
    onSelectOldTask,
    onAddOldTask,
    onBack,
    onToggleTask,
    addNotification,
    originalPlanTasks = [],
    editableStages = [],
}: AddTaskModalProps) => {
    if (!isOpen) return null;

    // Mode Selection Modal
    if (addTaskMode === null) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50" onClick={onClose} />
                <div className="relative z-[70] w-full max-w-md bg-white rounded-lg shadow-xl p-6">
                    <h3 className="font-semibold text-lg mb-4">Add Task</h3>
                    <p className="text-sm text-gray-600 mb-4">Choose how to add a task:</p>
                    <div className="space-y-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateNew();
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
                                    if (!protocolDetails) {
                                        addNotification({
                                            type: 'error',
                                            title: 'Protocol Not Loaded',
                                            message: 'Please wait for the protocol details to load.',
                                        });
                                        return;
                                    }
                                    onSelectProtocol();
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
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectOldTask();
                            }}
                            className="w-full p-4 border-2 border-orange-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-left"
                        >
                            <div className="font-medium text-orange-900">Add Old Task</div>
                            <div className="text-sm text-orange-700 mt-1">
                                Re-add tasks from the original plan that were removed
                            </div>
                        </button>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Task Selection from Protocol Modal
    if (addTaskMode === 'protocol') {
        if (!protocolDetails) {
            return (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={onBack} />
                    <div className="relative z-[90] w-full max-w-md bg-white rounded-lg shadow-xl p-6">
                        <div className="flex flex-col items-center justify-center py-8">
                            <Spinner size="lg" />
                            <p className="text-sm text-gray-600 mt-4">Loading protocol details...</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50" onClick={onClose} />
                <div className="relative z-[90] w-full max-w-3xl bg-white rounded-lg shadow-xl p-6 max-h-[80vh] overflow-y-auto">
                    <h3 className="font-semibold text-lg mb-4">Select Tasks from Protocol</h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                        {protocolDetails.stages.map((stage: any, stageIdx: number) => (
                            <div key={stageIdx} className="border rounded-lg p-3">
                                <div className="font-medium mb-2">{stage.stageName}</div>
                                <div className="space-y-2">
                                    {stage.tasks.map((task: any, taskIdx: number) => {
                                        const taskKey = `${stage.sequenceOrder}-${task.sequenceOrder}`;
                                        return (
                                            <label
                                                key={taskIdx}
                                                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProtocolTasks.has(taskKey)}
                                                    onChange={(e) => {
                                                        onToggleTask(taskKey);
                                                    }}
                                                    className="rounded"
                                                />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium">{task.taskName}</div>
                                                    {task.description && (
                                                        <div className="text-xs text-gray-600">{task.description}</div>
                                                    )}
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                                                            {task.taskType}
                                                        </span>
                                                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                                                            Day {task.daysAfter}
                                                        </span>
                                                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                                                            {task.durationDays}d
                                                        </span>
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
                        <Button variant="outline" onClick={onBack}>
                            Back
                        </Button>
                        <Button onClick={onAddFromProtocol} disabled={selectedProtocolTasks.size === 0}>
                            Add {selectedProtocolTasks.size} Task(s)
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Task Selection from Old Plan Tasks Modal
    if (addTaskMode === 'old') {
        // Get current task IDs in editable stages
        const currentTaskIds = new Set(
            editableStages.flatMap((stage: any) =>
                stage.tasks
                    .map((task: any) => task.originalTaskId || task.taskId || task.id)
                    .filter((id: any) => id !== undefined)
            )
        );

        // Filter out tasks that are already in editable stages
        const availableOldTasks = originalPlanTasks.filter(
            (task: any) => {
                const taskId = task.taskId || task.id;
                return taskId && !currentTaskIds.has(taskId);
            }
        );

        return (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50" onClick={onClose} />
                <div className="relative z-[90] w-full max-w-3xl bg-white rounded-lg shadow-xl p-6 max-h-[80vh] overflow-y-auto">
                    <h3 className="font-semibold text-lg mb-4">Re-add Old Tasks</h3>
                    {availableOldTasks.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">
                            All original tasks are already in the plan
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-600 mb-4">
                                Select tasks from the original cultivation plan to re-add them as Emergency tasks:
                            </p>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                                {availableOldTasks.map((task: any, taskIdx: number) => {
                                    const taskKey = task.taskId || task.id;
                                    return (
                                        <label
                                            key={taskIdx}
                                            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedProtocolTasks.has(taskKey)}
                                                onChange={() => {
                                                    onToggleTask(taskKey);
                                                }}
                                                className="rounded"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-medium">{task.taskName}</div>
                                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                                        Original Task
                                                    </span>
                                                </div>
                                                {task.description && (
                                                    <div className="text-xs text-gray-600 mt-1">{task.description}</div>
                                                )}
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                                                        {task.taskType}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                                                        Day {task.daysAfter}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                                                        {task.durationDays}d
                                                    </span>
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </>
                    )}
                    <div className="flex gap-2 justify-end border-t pt-4">
                        <Button variant="outline" onClick={onBack}>
                            Back
                        </Button>
                        <Button
                            onClick={onAddOldTask}
                            disabled={selectedProtocolTasks.size === 0 || availableOldTasks.length === 0}
                        >
                            Re-add {selectedProtocolTasks.size} Task(s)
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

