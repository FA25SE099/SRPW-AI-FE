import {
  Calendar,
  Activity,
  Target,
  CheckCircle2,
  Package,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

import { useEmergencyProtocolDetails } from '../api/get-emergency-protocol-details';

type EmergencyProtocolDetailDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  protocolId?: string;
};

export const EmergencyProtocolDetailDialog = ({
  isOpen,
  onClose,
  protocolId,
}: EmergencyProtocolDetailDialogProps) => {
  const {
    data: response,
    isLoading,
    error,
  } = useEmergencyProtocolDetails({
    protocolId: protocolId || '',
    enabled: isOpen && !!protocolId,
  });

  // Extract the data from the response
  const protocol = response?.data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Emergency Protocol Details</DialogTitle>
          <DialogDescription>
            View complete information about this emergency protocol
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : !protocol ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">Protocol not found</p>
            {error && (
              <p className="mt-2 text-sm text-red-500">{String(error)}</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {protocol.planName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {protocol.categoryName}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm ${protocol.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {protocol.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {protocol.description && (
                <p className="text-gray-700">{protocol.description}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-blue-600">
                  <Calendar className="size-5" />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {protocol.totalDurationDays} days
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-green-600">
                  <Activity className="size-5" />
                  <span className="text-sm font-medium">Tasks</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {protocol.totalTasks}
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-purple-600">
                  <Target className="size-5" />
                  <span className="text-sm font-medium">Thresholds</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {protocol.totalThresholds}
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-orange-600">
                  <Package className="size-5" />
                  <span className="text-sm font-medium">Materials</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">
                  {protocol.totalMaterialTypes}
                </p>
              </div>
            </div>

            {/* Thresholds */}
            {protocol.thresholds && protocol.thresholds.length > 0 && (
              <div>
                <h4 className="mb-3 font-semibold text-gray-900">
                  Trigger Thresholds
                </h4>
                <div className="space-y-3">
                  {protocol.thresholds.map((threshold: any, index: number) => (
                    <div
                      key={threshold.id}
                      className="rounded-lg border bg-gray-50 p-4"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h5 className="font-medium text-gray-900">
                          Threshold {index + 1} - Priority {threshold.priority}
                        </h5>
                        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                          {threshold.applicableSeason}
                        </span>
                      </div>

                      {threshold.pestProtocolName && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">
                            Pest Protocol
                          </p>
                          <p className="text-sm text-gray-600">
                            {threshold.pestProtocolName}
                          </p>
                          {threshold.pestSeverityLevel && (
                            <p className="text-xs text-gray-500">
                              Severity: {threshold.pestSeverityLevel}
                              {threshold.pestAreaThresholdPercent &&
                                ` • Area: ${(threshold.pestAreaThresholdPercent * 100).toFixed(1)}%`}
                              {threshold.pestDamageThresholdPercent &&
                                ` • Damage: ${(threshold.pestDamageThresholdPercent * 100).toFixed(1)}%`}
                            </p>
                          )}
                          {threshold.pestThresholdNotes && (
                            <p className="mt-1 text-xs text-gray-500">
                              {threshold.pestThresholdNotes}
                            </p>
                          )}
                        </div>
                      )}

                      {threshold.weatherProtocolName && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700">
                            Weather Protocol
                          </p>
                          <p className="text-sm text-gray-600">
                            {threshold.weatherProtocolName}
                          </p>
                          {threshold.weatherEventType && (
                            <p className="text-xs text-gray-500">
                              Event: {threshold.weatherEventType}
                              {threshold.weatherIntensityLevel &&
                                ` • Intensity: ${threshold.weatherIntensityLevel}`}
                              {threshold.weatherMeasurementThreshold &&
                                ` • Threshold: ${threshold.weatherThresholdOperator} ${threshold.weatherMeasurementThreshold} ${threshold.weatherMeasurementUnit}`}
                            </p>
                          )}
                          {threshold.weatherThresholdNotes && (
                            <p className="mt-1 text-xs text-gray-500">
                              {threshold.weatherThresholdNotes}
                            </p>
                          )}
                        </div>
                      )}

                      {threshold.riceVarietyName && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Rice Variety:</span>{' '}
                          {threshold.riceVarietyName}
                        </p>
                      )}

                      {threshold.generalNotes && (
                        <p className="mt-2 text-xs italic text-gray-500">
                          {threshold.generalNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stages */}
            {protocol.stages && protocol.stages.length > 0 && (
              <div>
                <h4 className="mb-3 font-semibold text-gray-900">
                  Implementation Tasks
                </h4>
                <div className="space-y-4">
                  {protocol.stages.map((stage: any, index: number) => (
                    <div key={stage.id} className="rounded-lg border p-4">
                      {stage.tasks && stage.tasks.length > 0 && (
                        <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
                          {stage.tasks.map((task: any) => (
                            <div key={task.id} className="space-y-2">
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {task.taskName}
                                  </p>
                                  {task.description && (
                                    <p className="mt-1 text-xs text-gray-600">
                                      {task.description}
                                    </p>
                                  )}
                                  <p className="mt-1 text-xs text-gray-500">
                                    Day {task.daysAfter} • Duration:{' '}
                                    {task.durationDays} day(s) •
                                    {task.durationDays} day(s) • Type:{' '}
                                    {task.taskType} • Priority: {task.priority}
                                  </p>
                                </div>
                              </div>

                              {/* Materials */}
                              {task.materials && task.materials.length > 0 && (
                                <div className="ml-6 mt-2 rounded bg-gray-50 p-3">
                                  <p className="mb-2 text-xs font-medium text-gray-700">
                                    Required Materials:
                                  </p>
                                  <div className="space-y-1">
                                    {task.materials.map((material: any) => (
                                      <div
                                        key={material.id}
                                        className="flex items-center justify-between text-xs"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Package className="size-3 text-gray-400" />
                                          <span className="text-gray-700">
                                            {material.materialName}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600">
                                          <span>
                                            {material.quantityPerHa}{' '}
                                            {material.unit}/ha
                                          </span>
                                          <span className="text-gray-400">
                                            •
                                          </span>
                                          <span>
                                            ${material.pricePerUnit}/
                                            {material.unit}
                                          </span>
                                          <span className="text-gray-400">
                                            •
                                          </span>
                                          <span className="font-medium text-green-700">
                                            $
                                            {material.estimatedCostPerHa.toFixed(
                                              2,
                                            )}
                                            /ha
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
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
            )}

            {/* Metadata */}
            <div className="space-y-1 border-t pt-4 text-sm text-gray-500">
              <p>Created by: {protocol.creatorName}</p>
              <p>Created at: {new Date(protocol.createdAt).toLocaleString()}</p>
              <p>
                Last modified:{' '}
                {new Date(protocol.lastModified).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
