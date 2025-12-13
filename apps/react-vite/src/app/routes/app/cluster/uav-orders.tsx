import { useState, useMemo } from 'react';
import { 
  Plane, 
  Calendar, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Users,
  TrendingUp,
  Package,
  Filter
} from 'lucide-react';

import { ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/components/ui/notifications';
import { 
  useManagedGroups, 
  usePlotsReadyForUav,
  useCreateUavOrder,
  useTaskTypes,
  useGroupStatuses,
  useUavVendors,
  type TaskPriority,
  type UavPlotReadinessResponse,
} from '@/features/cluster/api';
import { formatDate } from '@/utils/format';
import { useUser } from '@/lib/auth';

const UavOrdersRoute = () => {
  const { addNotification } = useNotifications();
  const user = useUser();
  
  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  
  // Selected group & plots
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedTaskType, setSelectedTaskType] = useState<string>('PestControl');
  const [daysBeforeScheduled, setDaysBeforeScheduled] = useState<number>(7);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set()); // Track selected cultivation tasks by plotCultivationId
  
  // Order creation dialog
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [uavVendorId, setUavVendorId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Normal');
  const [orderName, setOrderName] = useState('');
  
  // Queries
  const { data: groupsData, isLoading: isLoadingGroups } = useManagedGroups({
    params: { 
      currentPage, 
      pageSize,
      statusFilter 
    },
  });
  
  const { data: readyPlots, isLoading: isLoadingPlots } = usePlotsReadyForUav({
    params: {
      groupId: selectedGroupId || '',
      requiredTaskType: selectedTaskType,
      daysBeforeScheduled: daysBeforeScheduled,
    },
    queryConfig: {
      enabled: !!selectedGroupId,
    },
  });
  
  console.log('🔍 Tasks Data:');
  console.log('- Total tasks available:', readyPlots?.length || 0);
  console.log('- Tasks data:', readyPlots);
  
  // Filter options from APIs
  const { data: taskTypesData, isLoading: isLoadingTaskTypes, error: taskTypesError } = useTaskTypes();
  const { data: groupStatusesData, isLoading: isLoadingStatuses, error: statusesError } = useGroupStatuses();
  const { data: uavVendorsData, isLoading: isLoadingVendors } = useUavVendors();
  
  // Debug logs
  console.log('🔍 Filter APIs Debug:');
  console.log('- Task Types Data:', taskTypesData);
  console.log('- Task Types Loading:', isLoadingTaskTypes);
  console.log('- Task Types Error:', taskTypesError);
  console.log('- Group Statuses Data:', groupStatusesData);
  console.log('- Statuses Loading:', isLoadingStatuses);
  console.log('- Statuses Error:', statusesError);
  console.log('- Selected Task Type:', selectedTaskType);
  
  // Mutations
  const createOrderMutation = useCreateUavOrder({
    mutationConfig: {
      onSuccess: (response) => {
        addNotification({
          type: 'success',
          title: 'UAV Order Created',
          message: response.message || 'UAV order has been created successfully',
        });
        setIsOrderDialogOpen(false);
        setSelectedTasks(new Set());
        setScheduledDate('');
        setUavVendorId('');
        setOrderName('');
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Failed to Create Order',
          message: error.message || 'An error occurred while creating the order',
        });
      },
    },
  });
  
  const groups = groupsData?.data || [];
  const selectedGroup = groups.find(g => g.groupId === selectedGroupId);
  
  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedTasks(new Set());
  };
  
  const handleTaskToggle = (cultivationTaskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cultivationTaskId)) {
        newSet.delete(cultivationTaskId);
      } else {
        newSet.add(cultivationTaskId);
      }
      return newSet;
    });
  };
  
  const handleSelectAll = () => {
    if (!readyPlots) return;
    // Only select tasks that are ready and don't have active orders
    const selectableTasks = readyPlots.filter(p => p.isReady && !p.hasActiveUavOrder && p.cultivationTaskId);
    if (selectedTasks.size === selectableTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(selectableTasks.map(p => p.cultivationTaskId!)));
    }
  };
  
  const handleCreateOrder = () => {
    if (!selectedGroupId || selectedTasks.size === 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Selection',
        message: 'Please select a group and at least one task',
      });
      return;
    }
    setIsOrderDialogOpen(true);
  };
  
  const handleSubmitOrder = () => {
    if (!selectedGroupId || !uavVendorId || !scheduledDate) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please fill in all required fields',
      });
      return;
    }
    
    // Get unique plot IDs and cultivation task IDs from selected tasks
    const selectedTasksData = readyPlots?.filter(p => p.cultivationTaskId && selectedTasks.has(p.cultivationTaskId)) || [];
    const uniquePlotIds = [...new Set(selectedTasksData.map(t => t.plotId))];
    const cultivationTaskIds = selectedTasksData.map(t => t.cultivationTaskId).filter((id): id is string => !!id);
    
    createOrderMutation.mutate({
      groupId: selectedGroupId,
      uavVendorId,
      scheduledDate,
      selectedPlotIds: uniquePlotIds, // Unique plot IDs
      cultivationTaskIds, // Specific cultivation task IDs
      orderNameOverride: orderName || undefined,
      priority,
      clusterManagerId: user.data?.id,
    });
  };
  
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-800 border-gray-200',
      Active: 'bg-green-100 text-green-800 border-green-200',
      ReadyForOptimization: 'bg-blue-100 text-blue-800 border-blue-200',
      Locked: 'bg-red-100 text-red-800 border-red-200',
      Exception: 'bg-orange-100 text-orange-800 border-orange-200',
      Completed: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  const calculateTotalCost = () => {
    if (!readyPlots) return 0;
    return readyPlots
      .filter(p => p.cultivationTaskId && selectedTasks.has(p.cultivationTaskId))
      .reduce((sum, p) => sum + p.estimatedMaterialCost, 0);
  };
  
  const calculateTotalArea = () => {
    if (!readyPlots) return 0;
    // Get unique plots only to avoid counting same plot multiple times
    const selectedTasksData = readyPlots.filter(p => p.cultivationTaskId && selectedTasks.has(p.cultivationTaskId));
    const uniquePlots = new Map<string, number>();
    selectedTasksData.forEach(task => {
      if (!uniquePlots.has(task.plotId)) {
        uniquePlots.set(task.plotId, task.plotArea);
      }
    });
    return Array.from(uniquePlots.values()).reduce((sum, area) => sum + area, 0);
  };
  
  const getSelectedPlotsCount = () => {
    if (!readyPlots) return 0;
    const selectedTasksData = readyPlots.filter(p => p.cultivationTaskId && selectedTasks.has(p.cultivationTaskId));
    return new Set(selectedTasksData.map(t => t.plotId)).size;
  };
  
  if (isLoadingGroups) {
    return (
      <ContentLayout title="UAV Order Management">
        <div className="flex h-96 items-center justify-center">
          <Spinner size="lg" className="text-blue-600" />
        </div>
      </ContentLayout>
    );
  }
  
  return (
    <ContentLayout title="UAV Order Management">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <Plane className="size-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">UAV Order Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Create and manage UAV service orders for plot spraying and pest control
            </p>
          </div>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Groups</p>
                <p className="text-2xl font-bold">{groupsData?.totalCount || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Groups</p>
                <p className="text-2xl font-bold text-green-600">
                  {groups.filter(g => g.status === 'Active').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Selected Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{selectedTasks.size}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Est. Cost</p>
                <p className="text-2xl font-bold text-purple-600">
                  {calculateTotalCost().toLocaleString()} đ
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Groups
              </CardTitle>
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) => 
                  setStatusFilter(value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger className="w-32 h-8 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {isLoadingStatuses ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : groupStatusesData && Array.isArray(groupStatusesData) && groupStatusesData.length > 0 ? (
                    groupStatusesData.map((status) => (
                      <SelectItem key={status.name} value={status.name}>
                        {status.displayName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>No statuses available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {groups.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No groups found
                </p>
              ) : (
                groups.map((group) => (
                  <button
                    key={group.groupId}
                    onClick={() => handleGroupSelect(group.groupId)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedGroupId === group.groupId
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900">
                          {group.groupName}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {group.supervisorName}
                        </p>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(group.status)}`}>
                        {group.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{group.totalArea?.toFixed(1) || 0} ha</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <span>{group.totalPlots} plots</span>
                      </div>
                    </div>
                    
                    {group.riceVarietyName && (
                      <p className="text-xs text-gray-500 mt-2">
                        🌾 {group.riceVarietyName}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
            
            {/* Pagination */}
            {groupsData && groupsData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={!groupsData.hasPrevious}
                >
                  Previous
                </Button>
                <span className="text-xs text-gray-600">
                  Page {currentPage} of {groupsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!groupsData.hasNext}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Ready Plots */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Plots Ready for UAV Service
            </CardTitle>
              {selectedGroupId && (
                <div className="flex items-center gap-3">
                  <Select
                    value={selectedTaskType}
                    onValueChange={(value) => {
                      setSelectedTaskType(value);
                      setSelectedTasks(new Set());
                    }}
                  >
                    <SelectTrigger className="w-40 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingTaskTypes ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : taskTypesData && Array.isArray(taskTypesData) && taskTypesData.length > 0 ? (
                        taskTypesData.map((taskType) => (
                          <SelectItem key={taskType.name} value={taskType.name}>
                            {taskType.displayName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>No task types available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor="daysFilter" className="text-xs text-gray-600 whitespace-nowrap">
                      Days ahead:
                    </Label>
                    <Input
                      id="daysFilter"
                      type="number"
                      min="1"
                      max="30"
                      value={daysBeforeScheduled}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          setDaysBeforeScheduled(val);
                          setSelectedTasks(new Set());
                        }
                      }}
                      className="w-16 h-9 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedGroupId ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Plane className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Group
                </h3>
                <p className="text-sm text-gray-600 max-w-sm">
                  Choose a group from the list to view plots that are ready for UAV service
                </p>
              </div>
            ) : isLoadingPlots ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : !readyPlots || readyPlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Plots Ready
                </h3>
                <p className="text-sm text-gray-600 max-w-sm">
                  There are no plots ready for {selectedTaskType} service in this group within the next {daysBeforeScheduled} days
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Try increasing the "Days ahead" filter to see more plots
                </p>
              </div>
            ) : (
              <>
                {/* Action Bar */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {selectedTasks.size === readyPlots.filter(p => p.isReady && !p.hasActiveUavOrder).length ? 'Deselect All' : 'Select All Ready'}
                  </Button>
                    <span className="text-sm text-gray-600">
                      {selectedTasks.size} of {readyPlots.filter(p => p.isReady && !p.hasActiveUavOrder).length} ready tasks selected
                    </span>
                  </div>
                  
                  <Button
                    onClick={handleCreateOrder}
                    disabled={selectedTasks.size === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plane className="h-4 w-4 mr-2" />
                    Create UAV Order
                  </Button>
                </div>
                
                {/* Plot Status Summary */}
                {readyPlots.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">Ready: <span className="font-semibold text-gray-900">{readyPlots.filter(p => p.isReady && !p.hasActiveUavOrder).length}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                        <span className="text-gray-600">Has Order: <span className="font-semibold text-gray-900">{readyPlots.filter(p => p.hasActiveUavOrder).length}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <span className="text-gray-600">Not Ready: <span className="font-semibold text-gray-900">{readyPlots.filter(p => !p.isReady).length}</span></span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Selection Summary */}
                {selectedTasks.size > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Selected Tasks</p>
                        <p className="font-bold text-gray-900">{selectedTasks.size} ({getSelectedPlotsCount()} plots)</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Total Area</p>
                        <p className="font-bold text-gray-900">
                          {calculateTotalArea().toFixed(2)} ha
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Estimated Cost</p>
                        <p className="font-bold text-gray-900">
                          {calculateTotalCost().toLocaleString()} đ
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Tasks List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {readyPlots.map((plot, index) => {
                    const taskKey = plot.cultivationTaskId || `${plot.plotId}-${index}`;
                    const isSelectable = plot.isReady && !plot.hasActiveUavOrder && plot.cultivationTaskId;
                    const isSelected = plot.cultivationTaskId && selectedTasks.has(plot.cultivationTaskId);
                    
                    return (
                    <div
                      key={taskKey}
                      onClick={() => isSelectable ? handleTaskToggle(plot.cultivationTaskId!) : undefined}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        !isSelectable
                          ? 'opacity-60 cursor-not-allowed border-gray-200 bg-gray-50'
                          : isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md cursor-pointer'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {isSelectable && (
                            <div className={`mt-1 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600'
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              )}
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {plot.plotName}
                              </h4>
                              {plot.taskType && (
                                <Badge variant="outline" className="text-xs">
                                  {plot.taskType}
                                </Badge>
                              )}
                              {plot.hasActiveUavOrder && (
                                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                                  Has Active Order
                                </Badge>
                              )}
                              {!plot.isReady && (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                  {plot.readyStatus}
                                </Badge>
                              )}
                              {plot.isReady && !plot.hasActiveUavOrder && (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                                  ✓ Ready
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1">
                              {plot.cultivationTaskName}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{plot.plotArea.toFixed(2)} ha</span>
                              </div>
                              {plot.readyDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Ready: {formatDate(plot.readyDate)}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                <span>{plot.estimatedMaterialCost.toLocaleString()} đ</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Create Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-blue-600" />
              Create UAV Order
            </DialogTitle>
            <DialogDescription>
              Configure and submit a new UAV service order for {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} across {getSelectedPlotsCount()} plot{getSelectedPlotsCount() !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Group:</span>
                <span className="font-semibold">{selectedGroup?.groupName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Task Type:</span>
                <span className="font-semibold">{selectedTaskType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Selected Tasks:</span>
                <span className="font-semibold">{selectedTasks.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Plots:</span>
                <span className="font-semibold">{getSelectedPlotsCount()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Area:</span>
                <span className="font-semibold">{calculateTotalArea().toFixed(2)} ha</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Est. Cost:</span>
                <span className="font-bold text-blue-600">
                  {calculateTotalCost().toLocaleString()} đ
                </span>
              </div>
            </div>
            
            {/* Form Fields */}
            <div className="space-y-2">
              <Label htmlFor="uavVendorId">UAV Vendor *</Label>
              <Select 
                value={uavVendorId} 
                onValueChange={setUavVendorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select UAV vendor" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingVendors ? (
                    <SelectItem value="loading" disabled>Loading vendors...</SelectItem>
                  ) : uavVendorsData && Array.isArray(uavVendorsData) && uavVendorsData.length > 0 ? (
                    uavVendorsData.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{vendor.name}</span>
                          <span className="text-xs text-gray-500">{vendor.email}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-vendors" disabled>No vendors available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {uavVendorId && uavVendorsData && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {uavVendorsData.find(v => v.id === uavVendorId)?.name}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date *</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orderName">Order Name (Optional)</Label>
              <Input
                id="orderName"
                placeholder="Custom order name"
                value={orderName}
                onChange={(e) => setOrderName(e.target.value)}
                maxLength={255}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOrderDialogOpen(false)}
              disabled={createOrderMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitOrder}
              disabled={createOrderMutation.isPending || !uavVendorId || !scheduledDate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plane className="h-4 w-4 mr-2" />
                  Create Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContentLayout>
  );
};

export const Component = UavOrdersRoute;
export default UavOrdersRoute;

