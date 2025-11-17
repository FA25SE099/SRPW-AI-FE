import { usePlotImplementation } from '../api/get-plot-implementation';
import { SimpleDialog } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  MapPin,
  User,
  Calendar,
  Sprout,
  TrendingUp,
  CheckCircle,
  Clock,
  Package,
  DollarSign,
} from 'lucide-react';

type PlotImplementationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  plotId: string;
  productionPlanId: string;
};

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  PendingApproval: 'bg-yellow-100 text-yellow-800',
  InProgress: 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const taskTypeColors: Record<string, string> = {
  Fertilizing: 'bg-green-100 text-green-800',
  Planting: 'bg-blue-100 text-blue-800',
  PestControl: 'bg-red-100 text-red-800',
  Cultivation: 'bg-yellow-100 text-yellow-800',
  Harvesting: 'bg-purple-100 text-purple-800',
  PostHarvest: 'bg-orange-100 text-orange-800',
};

export const PlotImplementationDialog = ({
  isOpen,
  onClose,
  plotId,
  productionPlanId,
}: PlotImplementationDialogProps) => {
  const { data: implementation, isLoading } = usePlotImplementation({
    params: { plotId, productionPlanId },
    queryConfig: { enabled: isOpen && !!plotId && !!productionPlanId },
  });

  return (
    <SimpleDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Plot Implementation Details"
      maxWidth="4xl"
    >
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : implementation ? (
        <div className="space-y-4">
          {/* Plot Header */}
          <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-green-50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Plot {implementation.plotName}
                </h3>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{implementation.farmerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>Thửa {implementation.soThua}, Tờ {implementation.soTo}</span>
                    <span className="mx-2">•</span>
                    <TrendingUp className="h-4 w-4" />
                    <span>{implementation.plotArea.toFixed(2)} ha</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {implementation.completionPercentage.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
          </div>

          {/* Plan Info */}
          <div className="rounded-lg border bg-white p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Production Plan</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Plan:</span>{' '}
                <span className="font-medium">{implementation.productionPlanName}</span>
              </div>
              <div>
                <span className="text-gray-500">Season:</span>{' '}
                <span className="font-medium">{implementation.seasonName}</span>
              </div>
              <div>
                <span className="text-gray-500">Rice Variety:</span>{' '}
                <span className="font-medium">{implementation.riceVarietyName}</span>
              </div>
              <div>
                <span className="text-gray-500">Planting Date:</span>{' '}
                <span className="font-medium">
                  {new Date(implementation.plantingDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Task Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border p-3 bg-green-50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Completed</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {implementation.completedTasks}
              </p>
            </div>

            <div className="rounded-lg border p-3 bg-blue-50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">In Progress</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {implementation.inProgressTasks}
              </p>
            </div>

            <div className="rounded-lg border p-3 bg-gray-50">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Pending</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {implementation.pendingTasks}
              </p>
            </div>

            <div className="rounded-lg border p-3 bg-purple-50">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Total</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {implementation.totalTasks}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-medium">{implementation.completionPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={implementation.completionPercentage} className="h-2" />
          </div>

          {/* Tasks List */}
          <div className="rounded-lg border">
            <div className="p-4 border-b bg-gray-50">
              <h4 className="font-semibold text-gray-900">Tasks Timeline</h4>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {implementation.tasks.map((task) => (
                <div
                  key={task.taskId}
                  className="rounded-lg border p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">{task.taskName}</span>
                        <Badge className={statusColors[task.status]}>
                          {task.status}
                        </Badge>
                        <Badge className={taskTypeColors[task.taskType] || 'bg-gray-100 text-gray-800'}>
                          {task.taskType}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}

                      {/* Task Dates */}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Scheduled: {new Date(task.scheduledEndDate).toLocaleDateString()}</span>
                        </div>
                        {task.actualStartDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Started: {new Date(task.actualStartDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {task.actualEndDate && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Completed: {new Date(task.actualEndDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Materials */}
                      {task.materials.length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          <p className="text-xs font-medium text-gray-700 mb-1">Materials:</p>
                          <div className="space-y-1">
                            {task.materials.map((material, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">
                                  {material.materialName} ({material.unit})
                                </span>
                                <div className="flex items-center gap-3">
                                  <span className="text-gray-500">
                                    Planned: {material.plannedQuantity.toFixed(1)}
                                  </span>
                                  <span className={material.actualQuantity > material.plannedQuantity ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                                    Actual: {material.actualQuantity.toFixed(1)}
                                  </span>
                                  <span className="text-blue-600 font-medium">
                                    {material.actualCost.toLocaleString('vi-VN')} VND
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Costs */}
                      {(task.actualMaterialCost > 0 || task.actualServiceCost) && (
                        <div className="mt-2 flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-green-600" />
                            <span className="text-gray-600">Material: </span>
                            <span className="font-medium">{task.actualMaterialCost.toLocaleString('vi-VN')} VND</span>
                          </div>
                          {task.actualServiceCost && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-blue-600" />
                              <span className="text-gray-600">Service: </span>
                              <span className="font-medium">{task.actualServiceCost.toLocaleString('vi-VN')} VND</span>
                            </div>
                          )}
                          {task.totalActualCost && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-purple-600" />
                              <span className="text-gray-600">Total: </span>
                              <span className="font-medium">{task.totalActualCost.toLocaleString('vi-VN')} VND</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right text-sm">
                      <div className="font-medium text-gray-500">Order</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {task.executionOrder}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center">
          <p className="text-gray-500">No implementation data available</p>
        </div>
      )}
    </SimpleDialog>
  );
};

