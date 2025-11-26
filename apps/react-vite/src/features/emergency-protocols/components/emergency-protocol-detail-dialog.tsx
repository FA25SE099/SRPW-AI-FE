import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useEmergencyProtocolDetails } from '../api/get-emergency-protocol-details';
import { Calendar, Activity, Target, CheckCircle2, Package } from 'lucide-react';

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
    const { data: response, isLoading, error } = useEmergencyProtocolDetails({
        protocolId: protocolId || '',
        enabled: isOpen && !!protocolId,
    });

    // The API returns the data directly, not wrapped in a 'data' property
    const protocol = response;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
                    <div className="text-center py-8">
                        <p className="text-gray-500">Protocol not found</p>
                        {error && <p className="text-red-500 text-sm mt-2">{String(error)}</p>}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{protocol.planName}</h3>
                                    <p className="text-sm text-gray-500">{protocol.categoryName}</p>
                                </div>
                                <span
                                    className={`px-3 py-1 text-sm rounded-full ${protocol.isActive
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
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-600 mb-1">
                                    <Calendar className="h-5 w-5" />
                                    <span className="text-sm font-medium">Duration</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-900">{protocol.totalDurationDays} days</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-green-600 mb-1">
                                    <Activity className="h-5 w-5" />
                                    <span className="text-sm font-medium">Stages</span>
                                </div>
                                <p className="text-2xl font-bold text-green-900">{protocol.totalStages}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-purple-600 mb-1">
                                    <Target className="h-5 w-5" />
                                    <span className="text-sm font-medium">Thresholds</span>
                                </div>
                                <p className="text-2xl font-bold text-purple-900">{protocol.totalThresholds}</p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-orange-600 mb-1">
                                    <Package className="h-5 w-5" />
                                    <span className="text-sm font-medium">Materials</span>
                                </div>
                                <p className="text-2xl font-bold text-orange-900">{protocol.totalMaterialTypes}</p>
                            </div>
                        </div>

                        {/* Thresholds */}
                        {protocol.thresholds && protocol.thresholds.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Trigger Thresholds</h4>
                                <div className="space-y-3">
                                    {protocol.thresholds.map((threshold, index) => (
                                        <div key={threshold.id} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex items-start justify-between mb-2">
                                                <h5 className="font-medium text-gray-900">
                                                    Threshold {index + 1} - Priority {threshold.priority}
                                                </h5>
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    {threshold.applicableSeason}
                                                </span>
                                            </div>

                                            {threshold.pestProtocolName && (
                                                <div className="mb-2">
                                                    <p className="text-sm font-medium text-gray-700">Pest Protocol</p>
                                                    <p className="text-sm text-gray-600">{threshold.pestProtocolName}</p>
                                                    {threshold.pestSeverityLevel && (
                                                        <p className="text-xs text-gray-500">
                                                            Severity: {threshold.pestSeverityLevel}
                                                            {threshold.pestAreaThresholdPercent && ` • Area: ${(threshold.pestAreaThresholdPercent * 100).toFixed(1)}%`}
                                                            {threshold.pestDamageThresholdPercent && ` • Damage: ${(threshold.pestDamageThresholdPercent * 100).toFixed(1)}%`}
                                                        </p>
                                                    )}
                                                    {threshold.pestThresholdNotes && (
                                                        <p className="text-xs text-gray-500 mt-1">{threshold.pestThresholdNotes}</p>
                                                    )}
                                                </div>
                                            )}

                                            {threshold.weatherProtocolName && (
                                                <div className="mb-2">
                                                    <p className="text-sm font-medium text-gray-700">Weather Protocol</p>
                                                    <p className="text-sm text-gray-600">{threshold.weatherProtocolName}</p>
                                                    {threshold.weatherEventType && (
                                                        <p className="text-xs text-gray-500">
                                                            Event: {threshold.weatherEventType}
                                                            {threshold.weatherIntensityLevel && ` • Intensity: ${threshold.weatherIntensityLevel}`}
                                                            {threshold.weatherMeasurementThreshold && ` • Threshold: ${threshold.weatherThresholdOperator} ${threshold.weatherMeasurementThreshold} ${threshold.weatherMeasurementUnit}`}
                                                        </p>
                                                    )}
                                                    {threshold.weatherThresholdNotes && (
                                                        <p className="text-xs text-gray-500 mt-1">{threshold.weatherThresholdNotes}</p>
                                                    )}
                                                </div>
                                            )}

                                            {threshold.riceVarietyName && (
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Rice Variety:</span> {threshold.riceVarietyName}
                                                </p>
                                            )}

                                            {threshold.generalNotes && (
                                                <p className="text-xs text-gray-500 mt-2 italic">{threshold.generalNotes}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stages */}
                        {protocol.stages && protocol.stages.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Implementation Stages</h4>
                                <div className="space-y-4">
                                    {protocol.stages.map((stage, index) => (
                                        <div key={stage.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h5 className="font-medium text-gray-900">
                                                        Stage {stage.sequenceOrder + 1}. {stage.stageName}
                                                    </h5>
                                                    <p className="text-sm text-gray-500">
                                                        {stage.expectedDurationDays} days
                                                        {stage.isMandatory && (
                                                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                                                Mandatory
                                                            </span>
                                                        )}
                                                    </p>
                                                    {stage.notes && (
                                                        <p className="text-xs text-gray-600 mt-1">{stage.notes}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {stage.tasks && stage.tasks.length > 0 && (
                                                <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
                                                    {stage.tasks.map((task) => (
                                                        <div key={task.id} className="space-y-2">
                                                            <div className="flex items-start gap-2">
                                                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {task.taskName}
                                                                    </p>
                                                                    {task.description && (
                                                                        <p className="text-xs text-gray-600 mt-1">
                                                                            {task.description}
                                                                        </p>
                                                                    )}
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Day {task.daysAfter} • Duration: {task.durationDays} day(s) •
                                                                        Type: {task.taskType} • Priority: {task.priority}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Materials */}
                                                            {task.materials && task.materials.length > 0 && (
                                                                <div className="ml-6 mt-2 bg-gray-50 rounded p-3">
                                                                    <p className="text-xs font-medium text-gray-700 mb-2">Required Materials:</p>
                                                                    <div className="space-y-1">
                                                                        {task.materials.map((material) => (
                                                                            <div key={material.id} className="flex items-center justify-between text-xs">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Package className="h-3 w-3 text-gray-400" />
                                                                                    <span className="text-gray-700">{material.materialName}</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-3 text-gray-600">
                                                                                    <span>{material.quantityPerHa} {material.unit}/ha</span>
                                                                                    <span className="text-gray-400">•</span>
                                                                                    <span>${material.pricePerUnit}/{material.unit}</span>
                                                                                    <span className="text-gray-400">•</span>
                                                                                    <span className="font-medium text-green-700">
                                                                                        ${material.estimatedCostPerHa.toFixed(2)}/ha
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
                        <div className="border-t pt-4 text-sm text-gray-500 space-y-1">
                            <p>Created by: {protocol.creatorName}</p>
                            <p>Created at: {new Date(protocol.createdAt).toLocaleString()}</p>
                            <p>Last modified: {new Date(protocol.lastModified).toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};