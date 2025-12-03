import { AlertTriangle } from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';

type ProtocolPreviewProps = {
  protocolDetails: any;
  isLoadingDetails: boolean;
};

export const ProtocolPreview = ({
  protocolDetails,
  isLoadingDetails,
}: ProtocolPreviewProps) => {
  if (isLoadingDetails) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size="md" />
      </div>
    );
  }

  if (!protocolDetails) return null;

  return (
    <div className="max-h-[300px] space-y-3 overflow-y-auto">
      {/* Protocol Summary */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
        <h5 className="mb-2 font-medium text-blue-900">
          {protocolDetails.planName}
        </h5>
        <p className="mb-2 text-sm text-gray-700">
          {protocolDetails.description}
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-gray-600">Duration:</span>
            <span className="ml-1 font-medium">
              {protocolDetails.totalDurationDays} days
            </span>
          </div>
          <div>
            <span className="text-gray-600">Tasks:</span>
            <span className="ml-1 font-medium">
              {protocolDetails.totalTasks}
            </span>
          </div>
        </div>
      </div>

      {/* Thresholds */}
      {protocolDetails.thresholds && protocolDetails.thresholds.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
          <h6 className="mb-2 flex items-center gap-2 font-medium text-orange-900">
            <AlertTriangle className="size-4" />
            Thresholds ({protocolDetails.thresholds.length})
          </h6>
          <div className="space-y-2">
            {protocolDetails.thresholds.map((threshold: any, idx: number) => (
              <div key={idx} className="rounded border bg-white p-2 text-xs">
                {threshold.pestProtocolName && (
                  <div className="font-medium text-red-700">
                    🐛 Pest: {threshold.pestProtocolName}
                    {threshold.pestSeverityLevel &&
                      ` (${threshold.pestSeverityLevel})`}
                  </div>
                )}
                {threshold.weatherProtocolName && (
                  <div className="font-medium text-blue-700">
                    ☁️ Weather: {threshold.weatherProtocolName}
                    {threshold.weatherIntensityLevel &&
                      ` (${threshold.weatherIntensityLevel})`}
                  </div>
                )}
                {threshold.applicableSeason && (
                  <div className="mt-1 text-gray-600">
                    Season: {threshold.applicableSeason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stages and Tasks */}
      {protocolDetails.stages.map((stage: any, stageIdx: number) => (
        <div key={stageIdx} className="rounded-lg border bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-gray-600">
              {stage.tasks.length} tasks
            </span>
          </div>
          <div className="space-y-1.5 pl-8">
            {stage.tasks.map((task: any, taskIdx: number) => (
              <div
                key={taskIdx}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {taskIdx + 1}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{task.taskName}</div>
                  {task.description && (
                    <div className="text-xs text-gray-600">
                      {task.description}
                    </div>
                  )}
                  <div className="mt-1 flex gap-2 text-xs">
                    <span className="rounded bg-gray-100 px-2 py-0.5">
                      {task.taskType}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-0.5">
                      Day {task.daysAfter}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-0.5">
                      {task.durationDays}d
                    </span>
                    {task.priority !== 'Normal' && (
                      <span className="rounded bg-yellow-100 px-2 py-0.5 text-yellow-800">
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
