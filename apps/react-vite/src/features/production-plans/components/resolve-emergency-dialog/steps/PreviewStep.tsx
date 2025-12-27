import { AlertTriangle, FileText } from 'lucide-react';
import { EditableStage } from '../types';
import { ProductionPlanDetail } from '@/features/production-plans/types';

type PreviewStepProps = {
    editableStages: EditableStage[];
    planDetails: ProductionPlanDetail;
    selectedPlotIds: Set<string>;
    protocolDetails: any;
    versionName: string;
    resolutionReason: string;
    fertilizers: any[];
    pesticides: any[];
    seeds: any[];
};

export const PreviewStep = ({
    editableStages,
    planDetails,
    selectedPlotIds,
    protocolDetails,
    versionName,
    resolutionReason,
    fertilizers,
    pesticides,
    seeds,
}: PreviewStepProps) => {
    // Helper function to get material name by ID
    const getMaterialName = (materialId: string): string => {
        const fertilizer = fertilizers.find((f: any) => f.materialId === materialId);
        if (fertilizer) return fertilizer.name;

        const pesticide = pesticides.find((p: any) => p.materialId === materialId);
        if (pesticide) return pesticide.name;

        const seed = seeds.find((s: any) => s.materialId === materialId);
        if (seed) return seed.name;

        return materialId; // Fallback to ID if not found
    };

    return (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {/* Header Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Resolution Summary</h3>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <dt className="text-blue-700 font-medium">Version Name:</dt>
                        <dd className="text-gray-900">{versionName}</dd>
                    </div>
                    <div>
                        <dt className="text-blue-700 font-medium">Selected Plots:</dt>
                        <dd className="text-gray-900">{selectedPlotIds.size} plots</dd>
                    </div>
                    <div className="col-span-2">
                        <dt className="text-blue-700 font-medium">Resolution Reason:</dt>
                        <dd className="text-gray-900 text-xs mt-1">{resolutionReason}</dd>
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
                                }).format(planDetails.estimatedTotalCost || 0)}
                            </dd>
                        </div>
                    </dl>

                    {/* Current Tasks List */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {planDetails.stages.map((stage, idx) => (
                            <div key={idx} className="bg-white rounded p-2 border border-yellow-300">
                                <div className="font-medium text-xs text-yellow-900 mb-1">{stage.stageName}</div>
                                <div className="space-y-1">
                                    {stage.tasks.map((task, taskIdx) => {
                                        const taskAny = task as any;
                                        return (
                                            <div key={taskIdx} className="text-xs text-gray-700 pl-2">
                                                <div className="font-medium">• {task.taskName}</div>
                                                {(taskAny.daysAfter !== undefined || taskAny.durationDays !== undefined || taskAny.taskType) && (
                                                    <div className="text-[10px] text-gray-600 pl-3">
                                                        {taskAny.daysAfter !== undefined && `Day ${taskAny.daysAfter}`}
                                                        {taskAny.daysAfter !== undefined && taskAny.durationDays !== undefined && ' • '}
                                                        {taskAny.durationDays !== undefined && `${taskAny.durationDays}d`}
                                                        {(taskAny.daysAfter !== undefined || taskAny.durationDays !== undefined) && taskAny.taskType && ' • '}
                                                        {taskAny.taskType && taskAny.taskType}
                                                    </div>
                                                )}
                                                {task.materials && task.materials.length > 0 && (
                                                    <div className="pl-3 mt-0.5 text-[10px] text-gray-600 space-y-0.5">
                                                        <div className="font-medium">Materials:</div>
                                                        {task.materials.map((m: any, mIdx: number) => (
                                                            <div key={mIdx} className="pl-2">
                                                                • {m.materialName} ({m.quantityPerHa}/ha)
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
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
                                    <span className="text-[10px] text-gray-600">{stage.tasks.length} tasks</span>
                                </div>
                                <div className="space-y-1">
                                    {stage.tasks.map((task, taskIdx) => (
                                        <div
                                            key={taskIdx}
                                            className="text-xs text-gray-700 pl-2 flex items-start gap-1"
                                        >
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
                                                {task.materials && task.materials.length > 0 && (
                                                    <div className="text-[10px] text-gray-600 mt-0.5 space-y-0.5">
                                                        <div className="font-medium">Materials:</div>
                                                        {task.materials.map((m: any, mIdx: number) => (
                                                            <div key={mIdx} className="pl-2">
                                                                • {getMaterialName(m.materialId)} ({m.quantityPerHa}/ha)
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
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
            {selectedPlotIds.size > 0 && (
                <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                        Selected Plots ({selectedPlotIds.size})
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {planDetails.groupDetails.plots
                            .filter((plot) => selectedPlotIds.has(plot.id))
                            .map((plot) => (
                                <div key={plot.id} className="border rounded-lg p-2 bg-gray-50">
                                    <div className="font-medium text-sm">{plot.plotName}</div>
                                    <div className="text-xs text-gray-600 mt-1">{plot.area} ha</div>
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
                            +
                            {editableStages.reduce(
                                (sum, stage) =>
                                    sum + stage.tasks.filter((t) => t.isFromProtocol || !t.originalTaskId).length,
                                0
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Existing Tasks Modified:</span>
                        <span className="font-medium text-blue-600">
                            {editableStages.reduce(
                                (sum, stage) =>
                                    sum + stage.tasks.filter((t) => t.originalTaskId && !t.isFromProtocol).length,
                                0
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Total Cultivation Tasks Created:</span>
                        <span className="font-medium text-purple-600">
                            {editableStages.reduce((sum, stage) => sum + stage.tasks.length, 0) *
                                selectedPlotIds.size}
                        </span>
                    </div>
                </div>
                <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                    ℹ️ Each task will be created for all {selectedPlotIds.size} selected plot
                    {selectedPlotIds.size !== 1 ? 's' : ''}, with materials scaled by each plot's area.
                </div>
            </div>
        </div>
    );
};

