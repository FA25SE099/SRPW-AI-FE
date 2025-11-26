import { AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

type ProtocolPreviewProps = {
    protocolDetails: any;
    isLoadingDetails: boolean;
};

export const ProtocolPreview = ({ protocolDetails, isLoadingDetails }: ProtocolPreviewProps) => {
    if (isLoadingDetails) {
        return (
            <div className="flex justify-center py-4">
                <Spinner size="md" />
            </div>
        );
    }

    if (!protocolDetails) return null;

    return (
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
                        {protocolDetails.thresholds.map((threshold: any, idx: number) => (
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
            {protocolDetails.stages.map((stage: any, stageIdx: number) => (
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
                    {stage.notes && <p className="text-xs text-gray-600 italic mb-2">{stage.notes}</p>}
                    <div className="space-y-1.5 pl-8">
                        {stage.tasks.map((task: any, taskIdx: number) => (
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
    );
};

