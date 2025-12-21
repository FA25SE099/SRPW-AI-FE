import { useState } from 'react';
import { useCultivationTasks } from '../api/get-cultivation-tasks';
import { useFarmLogsByCultivation } from '../api/get-farm-logs-by-cultivation';
import { CultivationTaskStatus } from '../types';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Calendar,
  User,
  MapPin,
  DollarSign,
  Filter,
  AlertCircle,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

type CultivationTasksListProps = {
  planId: string;
  initialStatus?: CultivationTaskStatus;
  initialPlotId?: string;
};

const statusColors: Record<CultivationTaskStatus, string> = {
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Task item component with farm logs
const TaskItemWithLogs = ({ task }: { task: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loadLogs, setLoadLogs] = useState(false);

  const { data: logsData, isLoading: logsLoading, refetch } = useFarmLogsByCultivation({
    params: {
      plotCultivationId: task.plotCultivationId || task.plotId, // Use plotCultivationId if available, fallback to plotId
      currentPage: 1,
      pageSize: 10,
    },
    queryConfig: {
      enabled: loadLogs,
    },
  });

  const handleToggle = () => {
    if (!isOpen && !loadLogs) {
      setLoadLogs(true);
    }
    setIsOpen(!isOpen);
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    refetch();
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Main Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start gap-3">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 mt-1"
                    onClick={handleToggle}
                  >
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        isOpen && 'transform rotate-180'
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{task.taskName}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge className={statusColors[task.status as CultivationTaskStatus]}>
                        {task.status}
                      </Badge>
                      <Badge className={taskTypeColors[task.taskType] || 'bg-gray-100 text-gray-800'}>
                        {task.taskType}
                      </Badge>
                      {isOpen && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={handleRefresh}
                          disabled={logsLoading}
                        >
                          <RefreshCw className={cn('h-3 w-3', logsLoading && 'animate-spin')} />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500">Plot</p>
                        <p className="font-medium">{task.plotName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500">Farmer</p>
                        <p className="font-medium">{task.farmerName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500">Scheduled</p>
                        <p className="font-medium">
                          {new Date(task.scheduledEndDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-gray-500">Cost</p>
                        <p className="font-medium">
                          {(task.actualMaterialCost + task.actualServiceCost).toLocaleString('vi-VN')} VND
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dates Info */}
                  {(task.actualStartDate || task.actualEndDate) && (
                    <div className="flex gap-4 text-xs text-gray-600 pt-2 border-t">
                      {task.actualStartDate && (
                        <span>
                          Started: {new Date(task.actualStartDate).toLocaleDateString()}
                        </span>
                      )}
                      {task.actualEndDate && (
                        <span>
                          Completed: {new Date(task.actualEndDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Contingency Info */}
                  {task.isContingency && (
                    <div className="rounded bg-yellow-50 p-2 text-xs text-yellow-800">
                      <span className="font-medium">Contingency Task:</span> {task.contingencyReason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Farm Logs Collapsible Content */}
          <CollapsibleContent>
            <div className="mt-4 pt-4 border-t">
              {logsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Spinner size="sm" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading farm logs...</span>
                </div>
              ) : logsData && logsData.data && logsData.data.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm mb-3">
                    Farm Logs ({logsData.totalCount})
                  </h4>
                  {logsData.data.map((log) => (
                    <div
                      key={log.farmLogId}
                      className="border rounded-lg p-3 bg-muted/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">{log.plotName}</span>
                            <Badge variant="outline" className="text-xs">
                              {log.completionPercentage}% Complete
                            </Badge>
                          </div>
                          {log.workDescription && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {log.workDescription}
                            </p>
                          )}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Date:</span>{' '}
                              {formatDate(log.loggedDate)}
                            </div>
                            {log.actualAreaCovered && (
                              <div>
                                <span className="text-muted-foreground">Area:</span>{' '}
                                {log.actualAreaCovered} ha
                              </div>
                            )}
                            {log.serviceCost && (
                              <div>
                                <span className="text-muted-foreground">Service Cost:</span>{' '}
                                {formatCurrency(log.serviceCost)}
                              </div>
                            )}
                            {log.weatherConditions && (
                              <div>
                                <span className="text-muted-foreground">Weather:</span>{' '}
                                {log.weatherConditions}
                              </div>
                            )}
                          </div>
                          {log.materialsUsed && log.materialsUsed.length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs font-medium mb-1">Materials Used:</p>
                              <div className="space-y-1">
                                {log.materialsUsed.map((material, idx) => (
                                  <div key={idx} className="text-xs text-muted-foreground">
                                    {material.materialName}: {material.actualQuantityUsed} (
                                    {formatCurrency(material.actualCost)})
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No farm logs found for this cultivation
                </p>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
};

export const CultivationTasksList = ({
  planId,
  initialStatus,
  initialPlotId,
}: CultivationTasksListProps) => {
  const [selectedStatus, setSelectedStatus] = useState<CultivationTaskStatus | undefined>(
    initialStatus
  );
  const [selectedPlotId, setSelectedPlotId] = useState<string | undefined>(initialPlotId);
  const [showFilters, setShowFilters] = useState(false);

  const { data: tasks, isLoading, error } = useCultivationTasks({
    params: {
      planId,
      status: selectedStatus,
      plotId: selectedPlotId,
    },
    queryConfig: { enabled: !!planId },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load cultivation tasks</p>
        </CardContent>
      </Card>
    );
  }

  const tasksList = tasks || [];

  return (
    <div className="space-y-4">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Cultivation Tasks ({tasksList.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          icon={<Filter className="h-4 w-4" />}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={selectedStatus || ''}
                  onChange={(e) => setSelectedStatus(e.target.value as CultivationTaskStatus || undefined)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="PendingApproval">Pending Approval</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      {tasksList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No tasks found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasksList.map((task) => (
            <TaskItemWithLogs key={task.taskId} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

