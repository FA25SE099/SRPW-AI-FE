import { AlertTriangle, FileText, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { EditableStage } from '../types';
import { CultivationPlan } from '@/features/reports/types';
import { useCalculatePlotMaterialCostWithTasks, PlotMaterialCostWithTasksResponse } from '@/features/materials/api/calculate-cost-by-plot-with-tasks';
import { Spinner } from '@/components/ui/spinner';

type PreviewStepProps = {
    editableStages: EditableStage[];
    cultivationPlan: CultivationPlan;
    protocolDetails: any;
    versionName: string;
    resolutionReason: string;
    fertilizers: any[];
    pesticides: any[];
    seeds: any[];
};

export const PreviewStep = ({
    editableStages,
    cultivationPlan,
    protocolDetails,
    versionName,
    resolutionReason,
    fertilizers,
    pesticides,
    seeds,
}: PreviewStepProps) => {
    const [costData, setCostData] = useState<PlotMaterialCostWithTasksResponse | null>(null);
    const calculateCostMutation = useCalculatePlotMaterialCostWithTasks();

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

    // Calculate costs for NewEmergency tasks only
    useEffect(() => {
        // Filter tasks with NewEmergency status
        const emergencyTasks = editableStages.flatMap(stage =>
            stage.tasks.filter(task => task.status === 'NewEmergency')
        );

        if (emergencyTasks.length === 0) {
            setCostData(null);
            return;
        }

        // Build tasks array for API
        const tasksForApi = emergencyTasks.map(task => ({
            taskName: task.taskName,
            taskDescription: task.description,
            materials: task.materials.filter(m => m.materialId && m.quantityPerHa > 0),
        })).filter(task => task.materials.length > 0);

        if (tasksForApi.length === 0) {
            setCostData(null);
            return;
        }

        calculateCostMutation.mutate(
            {
                plotId: cultivationPlan.plotId,
                tasks: tasksForApi,
            },
            {
                onSuccess: (response) => {
                    setCostData(response);
                },
                onError: (error) => {
                    console.error('Failed to calculate costs:', error);
                    setCostData(null);
                },
            }
        );
    }, [editableStages, cultivationPlan.plotId]);

    const emergencyTasksCount = editableStages.reduce(
        (sum, stage) => sum + stage.tasks.filter(t => t.status === 'NewEmergency').length,
        0
    );

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
                        <dt className="text-blue-700 font-medium">Plot:</dt>
                        <dd className="text-gray-900">{cultivationPlan.plotName} ({cultivationPlan.totalArea} ha)</dd>
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
                        Current Cultivation Plan
                    </h3>
                    <dl className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                            <dt className="text-yellow-700">Stages:</dt>
                            <dd className="font-medium">{cultivationPlan.stages.length}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-yellow-700">Total Tasks:</dt>
                            <dd className="font-medium">
                                {cultivationPlan.stages.reduce((sum, stage) => sum + stage.tasks.length, 0)}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-yellow-700">Est. Cost:</dt>
                            <dd className="font-medium">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(cultivationPlan.estimatedTotalCost)}
                            </dd>
                        </div>
                    </dl>

                    {/* Current Tasks List */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {cultivationPlan.stages.map((stage, idx) => (
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
                                                            Protocol
                                                        </span>
                                                    )}
                                                    {!task.isFromProtocol && !task.originalTaskId && (
                                                        <span className="ml-1 px-1 py-0.5 bg-red-100 text-red-700 rounded">
                                                            New-Emergency Task
                                                        </span>
                                                    )}
                                                    {task.status === 'Emergency' && task.originalTaskId && (
                                                        <span className="ml-1 px-1 py-0.5 bg-orange-100 text-orange-700 rounded">
                                                            Re-added
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

            {/* Changes Summary */}
            <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Impact Summary</h3>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Emergency Tasks Added:</span>
                        <span className="font-medium text-red-600">
                            +{emergencyTasksCount}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Existing Tasks Modified:</span>
                        <span className="font-medium text-blue-600">
                            {editableStages.reduce(
                                (sum, stage) =>
                                    sum + stage.tasks.filter((t) => t.originalTaskId && t.status !== 'NewEmergency').length,
                                0
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Total Tasks in New Plan:</span>
                        <span className="font-medium text-purple-600">
                            {editableStages.reduce((sum, stage) => sum + stage.tasks.length, 0)}
                        </span>
                    </div>
                </div>
                <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                    ℹ️ Tasks will be applied to {cultivationPlan.plotName} only ({cultivationPlan.totalArea} ha)
                </div>
            </div>

            {/* Cost Estimate for Emergency Tasks */}
            {emergencyTasksCount > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="h-5 w-5 text-red-600" />
                        <h3 className="font-semibold text-gray-900">Emergency Tasks Cost Estimate</h3>
                        {calculateCostMutation.isPending && <Spinner size="sm" />}
                    </div>

                    {calculateCostMutation.isPending ? (
                        <div className="py-4 text-center text-gray-500">
                            Calculating costs for emergency tasks...
                        </div>
                    ) : !costData ? (
                        <div className="py-4 text-center text-gray-500">
                            {emergencyTasksCount > 0 ? 'Unable to load cost information' : 'No emergency tasks with materials'}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Task-by-Task Breakdown */}
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-gray-700">By Task:</h4>
                                {costData.taskCostBreakdowns.map((taskBreakdown, idx) => (
                                    <div key={idx} className="bg-white rounded-lg p-3 border">
                                        <div className="font-medium text-sm mb-2">{taskBreakdown.taskName}</div>
                                        <div className="space-y-1">
                                            {taskBreakdown.materials.map((material, matIdx) => (
                                                <div key={matIdx} className="flex justify-between text-xs">
                                                    <span className="text-gray-600">
                                                        {material.materialName} ({material.totalQuantityNeeded?.toFixed(2) || '0.00'} {material.unit})
                                                    </span>
                                                    <span className="font-medium">
                                                        {(material.totalCost || 0).toLocaleString('vi-VN')} VND
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2 pt-2 border-t flex justify-between text-sm font-medium">
                                            <span>Task Total:</span>
                                            <span className="text-red-600">
                                                {taskBreakdown.totalTaskCost.toLocaleString('vi-VN')} VND
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total Summary */}
                            <div className="bg-white rounded-lg p-3 border-2 border-red-300">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-sm text-gray-600">Total Emergency Cost</div>
                                        <div className="text-xs text-gray-500">
                                            For {cultivationPlan.totalArea} ha
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-red-600">
                                            {costData.totalCostForArea.toLocaleString('vi-VN')} VND
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            ({costData.totalCostPerHa.toLocaleString('vi-VN')} VND/ha)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {costData.priceWarnings && costData.priceWarnings.length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                                    <div className="text-xs font-medium text-yellow-800 mb-1">⚠️ Price Warnings:</div>
                                    {costData.priceWarnings.map((warning, idx) => (
                                        <div key={idx} className="text-xs text-yellow-700">• {warning}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

