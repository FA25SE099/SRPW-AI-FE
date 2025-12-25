import { Trash2, Plus } from 'lucide-react';
import { EditableTask } from '../types';
import { formatDateForInput } from '@/utils/format-date';
import { MaterialsEditor } from './MaterialsEditor';

type TaskCardProps = {
    task: EditableTask;
    stageIndex: number;
    taskIndex: number;
    isLoading: boolean;
    hasTaskError: boolean;
    fertilizers: any[];
    pesticides: any[];
    isLoadingMaterials: boolean;
    onUpdateTask: (stageIndex: number, taskIndex: number, updates: Partial<EditableTask>) => void;
    onRemoveTask: (stageIndex: number, taskIndex: number) => void;
    onUpdateMaterial: (
        stageIndex: number,
        taskIndex: number,
        materialIndex: number,
        field: 'materialId' | 'quantityPerHa',
        value: string | number
    ) => void;
    onRemoveMaterial: (stageIndex: number, taskIndex: number, materialIndex: number) => void;
    onAddMaterial: (stageIndex: number, taskIndex: number) => void;
    onOpenAddTaskMenu: (stageIndex: number, position: number) => void;
};

export const TaskCard = ({
    task,
    stageIndex,
    taskIndex,
    isLoading,
    hasTaskError,
    fertilizers,
    pesticides,
    isLoadingMaterials,
    onUpdateTask,
    onRemoveTask,
    onUpdateMaterial,
    onRemoveMaterial,
    onAddMaterial,
    onOpenAddTaskMenu,
}: TaskCardProps) => {
    // Disable editing for completed tasks or EmergencyApproval tasks
    const isCompleted = task.status === 'Completed' || task.status === 'EmergencyApproval';
    const isDisabled = isLoading || isCompleted;

    const showActualStartDate = isCompleted || task.status === 'InProgress';
    const showActualEndDate = isCompleted;
    const isScheduledEndDateDisabled = isCompleted;

    // Simple validation for required fields within the card
    const hasScheduledEndDateError = !task.scheduledEndDate;

    return (
        <div className="relative">
            {/* Add task before this task - small icon button */}
            {taskIndex === 0 && !isCompleted && (
                <button
                    type="button"
                    onClick={() => onOpenAddTaskMenu(stageIndex, 0)}
                    disabled={isDisabled}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-md transition-colors"
                    title={isCompleted ? 'Cannot add task before a completed/approved task' : 'Add task before'}
                >
                    <Plus className="h-3.5 w-3.5" />
                </button>
            )}

            <div
                className={`rounded-md border-2 ${hasTaskError ? 'border-red-300 bg-red-50' : 'border-blue-200 bg-white'
                    } p-2.5 shadow-sm hover:shadow-md transition-shadow flex flex-col`}
            >
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1 flex-wrap">
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold">
                            {taskIndex + 1}
                        </span>
                        {task.isFromProtocol && (
                            <span className="inline-block text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                Protocol
                            </span>
                        )}
                        {!task.isFromProtocol && !task.originalTaskId && (
                            <span className="inline-block text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                New
                            </span>
                        )}
                        {/* Task Status Badge - Read-only */}
                        {task.status === 'Draft' && (
                            <span className="inline-block text-[9px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                                Draft
                            </span>
                        )}
                        {task.status === 'PendingApproval' && (
                            <span className="inline-block text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                                Pending
                            </span>
                        )}
                        {task.status === 'Approved' && (
                            <span className="inline-block text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                Approved
                            </span>
                        )}
                        {task.status === 'InProgress' && (
                            <span className="inline-block text-[9px] bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded">
                                In Progress
                            </span>
                        )}
                        {task.status === 'OnHold' && (
                            <span className="inline-block text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                                On Hold
                            </span>
                        )}
                        {task.status === 'Completed' && (
                            <span className="inline-block text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                Completed
                            </span>
                        )}
                        {task.status === 'Cancelled' && (
                            <span className="inline-block text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                Cancelled
                            </span>
                        )}
                        {task.status === 'Emergency' && (
                            <span className="inline-block text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                Emergency
                            </span>
                        )}
                        {task.status === 'EmergencyApproval' && (
                            <span className="inline-block text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                                Emerg. Approval
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => onRemoveTask(stageIndex, taskIndex)}
                        disabled={isDisabled}
                        className="p-0.5 text-red-600 hover:bg-red-50 rounded hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isCompleted ? 'Cannot delete completed tasks or emergency approval tasks' : 'Delete task'}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="space-y-2 flex-1">
                    <div className="space-y-0.5">
                        <label className="block text-[10px] font-medium text-gray-600">Task name *</label>
                        <input
                            type="text"
                            value={task.taskName}
                            onChange={(e) => onUpdateTask(stageIndex, taskIndex, { taskName: e.target.value })}
                            disabled={isDisabled}
                            placeholder="Task name"
                            className={`block w-full rounded-md border ${hasTaskError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                } px-2 py-1 text-xs font-medium focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                        />
                        {hasTaskError && (
                            <p className="text-[10px] text-red-600 mt-0.5">Task name is required</p>
                        )}
                    </div>

                    <div className="space-y-0.5">
                        <label className="block text-[10px] font-medium text-gray-600">Description</label>
                        <textarea
                            value={task.description || ''}
                            onChange={(e) => onUpdateTask(stageIndex, taskIndex, { description: e.target.value })}
                            disabled={isDisabled}
                            placeholder="Description"
                            rows={2}
                            className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                        <div className="space-y-0.5">
                            <label className="block text-[10px] font-medium text-gray-600">Days After</label>
                            <input
                                type="number"
                                value={task.daysAfter}
                                onChange={(e) => onUpdateTask(stageIndex, taskIndex, { daysAfter: parseInt(e.target.value) || 0 })}
                                disabled={isDisabled}
                                placeholder="0"
                                className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-0.5">
                            <label className="block text-[10px] font-medium text-gray-600">Duration</label>
                            <input
                                type="number"
                                value={task.durationDays}
                                onChange={(e) => onUpdateTask(stageIndex, taskIndex, { durationDays: parseInt(e.target.value) || 1 })}
                                disabled={isDisabled}
                                min="1"
                                placeholder="1"
                                className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                        <div className="space-y-0.5">
                            <label className="block text-[10px] font-medium text-gray-600">Scheduled End Date *</label>
                            <input
                                type="datetime-local"
                                value={formatDateForInput(task.scheduledEndDate)}
                                onChange={(e) => onUpdateTask(stageIndex, taskIndex, { scheduledEndDate: e.target.value || null })}
                                disabled={isDisabled || isScheduledEndDateDisabled}
                                className={`block w-full rounded-md border ${hasScheduledEndDateError && !isDisabled
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300 bg-white'
                                    } px-1.5 py-0.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                            />
                            {hasScheduledEndDateError && !isDisabled && (
                                <p className="text-[10px] text-red-600 mt-0.5">Scheduled end date is required</p>
                            )}
                        </div>
                    </div>

                    {(showActualStartDate || showActualEndDate) && (
                        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                            {showActualStartDate && (
                                <div className="space-y-0.5">
                                    <label className="block text-[10px] font-medium text-gray-600">Actual Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formatDateForInput(task.actualStartDate)}
                                        disabled={true}
                                        className="block w-full rounded-md border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs cursor-not-allowed"
                                    />
                                </div>
                            )}
                            {showActualEndDate && (
                                <div className="space-y-0.5">
                                    <label className="block text-[10px] font-medium text-gray-600">Actual End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formatDateForInput(task.actualEndDate)}
                                        disabled={true}
                                        className="block w-full rounded-md border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs cursor-not-allowed"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-0.5">
                        <label className="block text-[10px] font-medium text-gray-600">Task Type</label>
                        <select
                            value={task.taskType}
                            onChange={(e) => onUpdateTask(stageIndex, taskIndex, { taskType: e.target.value })}
                            disabled={isDisabled}
                            className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                            onChange={(e) => onUpdateTask(stageIndex, taskIndex, { priority: e.target.value })}
                            disabled={isDisabled}
                            className="block w-full rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="Low">Low</option>
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>

                    <MaterialsEditor
                        materials={task.materials}
                        stageIndex={stageIndex}
                        taskIndex={taskIndex}
                        isLoading={isDisabled}
                        isLoadingMaterials={isLoadingMaterials}
                        fertilizers={fertilizers}
                        pesticides={pesticides}
                        onUpdateMaterial={onUpdateMaterial}
                        onRemoveMaterial={onRemoveMaterial}
                        onAddMaterial={onAddMaterial}
                    />
                </div>
            </div>

            {/* Add task after this task - small icon button */}
            <button
                type="button"
                onClick={() => onOpenAddTaskMenu(stageIndex, taskIndex + 1)}
                disabled={isLoading}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add task after"
            >
                <Plus className="h-3.5 w-3.5" />
            </button>
        </div>
    );
};
