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
  Filter,
  List,
  Clock,
  DollarSign,
  Percent,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs/tabs';
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import {
  useManagedGroups,
  usePlotsReadyForUav,
  useCreateUavOrder,
  useTaskTypes,
  useGroupStatuses,
  useUavVendors,
  useClusterManagerOrders,
  useUavOrderDetail,
  type TaskPriority,
  type UavPlotReadinessResponse,
  type UavServiceOrderResponse,
  type UavOrderDetail,
} from '@/features/cluster/api';
import { formatDate } from '@/utils/format';
import { useUser } from '@/lib/auth';

const UavOrdersRoute = () => {
  const { addNotification } = useNotifications();
  const user = useUser();

  // Tab state
  const [activeTab, setActiveTab] = useState('create');

  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  // Orders pagination
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPageSize] = useState(10);

  // Selected group & plots
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedTaskType, setSelectedTaskType] = useState<string>('PestControl');
  const [daysBeforeScheduled, setDaysBeforeScheduled] = useState<number>(2);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set()); // Track selected cultivation tasks by plotCultivationId
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [isProofViewerOpen, setIsProofViewerOpen] = useState(false);
  const [currentProofUrls, setCurrentProofUrls] = useState<string[]>([]);
  const [currentProofIndex, setCurrentProofIndex] = useState(0);

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

  // Orders query
  const { data: ordersData, isLoading: isLoadingOrders } = useClusterManagerOrders({
    params: {
      currentPage: ordersPage,
      pageSize: ordersPageSize,
    },
    queryConfig: {
      enabled: activeTab === 'orders',
    },
  });

  // Order detail query (enabled only when a specific order is selected & dialog is open)
  const {
    data: orderDetail,
    isLoading: isLoadingOrderDetail,
  } = useUavOrderDetail({
    orderId: selectedOrderId,
    queryConfig: {
      enabled: activeTab === 'orders' && !!selectedOrderId && isOrderDetailOpen,
    },
  });

  const closeOrderDetail = () => {
    setIsOrderDetailOpen(false);
    setSelectedOrderId(null);
  };

  const openProofViewer = (urls: string[], index: number) => {
    if (!urls || urls.length === 0) return;
    setCurrentProofUrls(urls);
    setCurrentProofIndex(index);
    setIsProofViewerOpen(true);
  };

  const closeProofViewer = () => {
    setIsProofViewerOpen(false);
    setCurrentProofUrls([]);
    setCurrentProofIndex(0);
  };

  const showPrevProof = () => {
    if (!currentProofUrls.length) return;
    setCurrentProofIndex((prev) =>
      prev === 0 ? currentProofUrls.length - 1 : prev - 1
    );
  };

  const showNextProof = () => {
    if (!currentProofUrls.length) return;
    setCurrentProofIndex((prev) =>
      prev === currentProofUrls.length - 1 ? 0 : prev + 1
    );
  };

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
          title: 'Đã Tạo Đơn Hàng UAV',
          message: response.message || 'Đơn hàng UAV đã được tạo thành công',
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
          title: 'Tạo Đơn Hàng Thất Bại',
          message: error.message || 'Đã xảy ra lỗi khi tạo đơn hàng',
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

  // Helper function to check if a plot already has a selected task
  const plotHasSelectedTask = (plotId: string, currentTaskId?: string): boolean => {
    if (!readyPlots) return false;
    return readyPlots.some(plot =>
      plot.plotId === plotId &&
      plot.cultivationTaskId &&
      plot.cultivationTaskId !== currentTaskId &&
      selectedTasks.has(plot.cultivationTaskId)
    );
  };

  const handleTaskToggle = (cultivationTaskId: string, plotId: string) => {
    // Prevent selection if another task in the same plot is already selected
    if (!selectedTasks.has(cultivationTaskId) && plotHasSelectedTask(plotId, cultivationTaskId)) {
      addNotification({
        type: 'error',
        title: 'Không Thể Chọn Nhiệm Vụ',
        message: 'Một nhiệm vụ khác từ cùng thửa đất đã được chọn. Chỉ có thể chọn một nhiệm vụ mỗi thửa đất.',
      });
      return;
    }

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

    // Check if all selectable tasks are already selected
    const allSelected = selectableTasks.every(p => p.cultivationTaskId && selectedTasks.has(p.cultivationTaskId));

    if (allSelected) {
      setSelectedTasks(new Set());
    } else {
      // Select only one task per plot (prefer the first one found for each plot)
      const plotToTaskMap = new Map<string, string>();
      selectableTasks.forEach(task => {
        if (task.cultivationTaskId && !plotToTaskMap.has(task.plotId)) {
          plotToTaskMap.set(task.plotId, task.cultivationTaskId);
        }
      });
      setSelectedTasks(new Set(Array.from(plotToTaskMap.values())));
    }
  };

  const handleCreateOrder = () => {
    if (!selectedGroupId || selectedTasks.size === 0) {
      addNotification({
        type: 'error',
        title: 'Lựa Chọn Không Hợp Lệ',
        message: 'Vui lòng chọn một nhóm và ít nhất một nhiệm vụ',
      });
      return;
    }
    setIsOrderDialogOpen(true);
  };

  const handleSubmitOrder = () => {
    if (!selectedGroupId || !uavVendorId || !scheduledDate) {
      addNotification({
        type: 'error',
        title: 'Thiếu Thông Tin',
        message: 'Vui lòng điền đầy đủ các trường bắt buộc',
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

  // Sort plots so ready tasks appear at the top of the list
  const sortedReadyPlots = useMemo(() => {
    if (!readyPlots) return [];

    const score = (p: UavPlotReadinessResponse) => {
      // 0: ready & no active order (most important)
      // 1: ready but already has active order
      // 2: not ready but has active order
      // 3: not ready & no active order (least important)
      if (p.isReady && !p.hasActiveUavOrder) return 0;
      if (p.isReady && p.hasActiveUavOrder) return 1;
      if (!p.isReady && p.hasActiveUavOrder) return 2;
      return 3;
    };

    return [...readyPlots].sort((a, b) => score(a) - score(b));
  }, [readyPlots]);

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

  const getOrderStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      PendingApproval: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Approved: 'bg-green-100 text-green-800 border-green-200',
      Rejected: 'bg-red-100 text-red-800 border-red-200',
      InProgress: 'bg-blue-100 text-blue-800 border-blue-200',
      Completed: 'bg-purple-100 text-purple-800 border-purple-200',
      Cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    const priorityMap: Record<string, string> = {
      Low: 'bg-gray-100 text-gray-800 border-gray-200',
      Normal: 'bg-blue-100 text-blue-800 border-blue-200',
      High: 'bg-orange-100 text-orange-800 border-orange-200',
      Critical: 'bg-red-100 text-red-800 border-red-200',
    };
    return priorityMap[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatScheduledDateTime = (date: string, time: string | null) => {
    const dateObj = new Date(date);
    const dateStr = formatDate(date);
    if (time) {
      // TimeSpan format is HH:mm:ss, extract HH:mm
      const timeParts = time.split(':');
      return `${dateStr} ${timeParts[0]}:${timeParts[1]}`;
    }
    return dateStr;
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
      <ContentLayout title="Quản Lý Đơn Hàng UAV">
        <div className="flex h-96 items-center justify-center">
          <Spinner size="lg" className="text-blue-600" />
        </div>
      </ContentLayout>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <Plane className="size-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đơn Hàng UAV</h1>
            <p className="text-sm text-gray-600 mt-1">
              Tạo và quản lý đơn hàng dịch vụ UAV cho phun tâu và kiểm soát sâu bệnh
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'create', label: 'Tạo Đơn Hàng', icon: Plane },
          { id: 'orders', label: 'Tất Cả Đơn Hàng', icon: List },
        ]}
        defaultTab={activeTab}
        onTabChange={setActiveTab}
      >
        {(activeTabId) => {
          if (activeTabId === 'orders') {
            return (
              <div className="space-y-6">
                {/* Orders Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Tổng Đơn Hàng</p>
                          <p className="text-2xl font-bold">{ordersData?.totalCount || 0}</p>
                        </div>
                        <Package className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Đang Thực Hiện</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {ordersData?.data?.filter(o => o.status === 'InProgress').length || 0}
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Đã Hoàn Thành</p>
                          <p className="text-2xl font-bold text-green-600">
                            {ordersData?.data?.filter(o => o.status === 'Completed').length || 0}
                          </p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Đang Chờ Duyệt</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {ordersData?.data?.filter(o => o.status === 'PendingApproval').length || 0}
                          </p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Orders Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <List className="h-5 w-5" />
                      Tất Cả Đơn Hàng UAV
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingOrders ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    ) : !ordersData?.data || ordersData.data.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Plane className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Không Có Đơn Hàng
                        </h3>
                        <p className="text-sm text-gray-600 max-w-sm">
                          Bạn chưa tạo đơn hàng UAV nào. Bắt đầu bằng cách tạo đơn hàng mới.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Order Name
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Group
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Scheduled Date
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Priority
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Area / Plots
                                  </th>
                                  {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Cost
                                  </th> */}
                                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Progress
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                {ordersData.data.map((order) => (
                                  <tr
                                    key={order.orderId}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => {
                                      setSelectedOrderId(order.orderId);
                                      setIsOrderDetailOpen(true);
                                    }}
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">
                                        {order.orderName}
                                      </div>
                                      {order.creatorName && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          bởi {order.creatorName}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{order.groupName}</div>
                                      <div className="text-xs text-gray-500">ID: {order.groupId.slice(0, 8)}...</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center gap-1 text-sm text-gray-900">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        {formatScheduledDateTime(order.scheduledDate, order.scheduledTime)}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <Badge className={`text-xs ${getOrderStatusColor(order.status)}`}>
                                        {order.status}
                                      </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <Badge className={`text-xs ${getPriorityColor(order.priority)}`}>
                                        {order.priority}
                                      </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">
                                        {order.totalArea.toFixed(2)} ha
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {order.totalPlots} thửa đất
                                      </div>
                                    </td>
                                    {/* <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">
                                        {order.estimatedCost ? (
                                          <>
                                            {order.estimatedCost.toLocaleString()} đ
                                            {order.actualCost && order.actualCost !== order.estimatedCost && (
                                              <div className="text-xs text-gray-500 mt-1">
                                                Actual: {order.actualCost.toLocaleString()} đ
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <span className="text-gray-400">N/A</span>
                                        )}
                                      </div>
                                    </td> */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                          <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${order.completionPercentage}%` }}
                                          />
                                        </div>
                                        <span className="text-xs text-gray-600 min-w-[40px]">
                                          {order.completionPercentage}%
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Pagination */}
                        {ordersData && ordersData.totalPages > 1 && (
                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                              disabled={!ordersData.hasPrevious}
                            >
                              Trước
                            </Button>
                            <span className="text-xs text-gray-600">
                              Trang {ordersPage} / {ordersData.totalPages} (Tổng {ordersData.totalCount})
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setOrdersPage(p => p + 1)}
                              disabled={!ordersData.hasNext}
                            >
                              Tiếp
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Order Detail Dialog */}
                <Dialog open={isOrderDetailOpen} onOpenChange={(open) => (open ? setIsOrderDetailOpen(true) : closeOrderDetail())}>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Plane className="h-5 w-5 text-blue-600" />
                        <span>Chi Tiết Đơn Hàng UAV</span>
                      </DialogTitle>
                      <DialogDescription>
                        Xem thông tin chi tiết và phân công thửa đất cho đơn hàng UAV này.
                      </DialogDescription>
                    </DialogHeader>

                    {isLoadingOrderDetail || !orderDetail ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    ) : (
                      <div className="space-y-6 py-2">
                        {/* Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase">Đơn Hàng</p>
                            <p className="text-lg font-bold text-gray-900">{orderDetail.orderName}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge className={`text-xs ${getOrderStatusColor(orderDetail.status)}`}>
                                {orderDetail.status}
                              </Badge>
                              <Badge className={`text-xs ${getPriorityColor(orderDetail.priority)}`}>
                                {orderDetail.priority}
                              </Badge>
                            </div>
                            {orderDetail.vendorName && (
                              <p className="text-xs text-gray-600 mt-2">
                                Nhà Cung Cấp: <span className="font-medium">{orderDetail.vendorName}</span>
                              </p>
                            )}
                            {orderDetail.creatorName && (
                              <p className="text-xs text-gray-600">
                                Tạo bởi: <span className="font-medium">{orderDetail.creatorName}</span>
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase">Lịch Trình</p>
                            <p className="text-sm text-gray-900 flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {formatScheduledDateTime(orderDetail.scheduledDate, orderDetail.scheduledTime)}
                            </p>
                            <p className="text-xs text-gray-600">
                              Nhóm: <span className="font-medium">{orderDetail.groupName}</span>
                            </p>
                            {orderDetail.startedAt && (
                              <p className="text-xs text-gray-600">
                                Bắt Đầu: <span className="font-medium">{formatDate(orderDetail.startedAt)}</span>
                              </p>
                            )}
                            {orderDetail.completedAt && (
                              <p className="text-xs text-gray-600">
                                Hoàn Thành: <span className="font-medium">{formatDate(orderDetail.completedAt)}</span>
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase">Hiệu Suất</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${orderDetail.completionPercentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-700">
                                {orderDetail.completionPercentage}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              Diện Tích: <span className="font-medium">{orderDetail.totalArea.toFixed(2)} ha</span>
                            </p>
                            <p className="text-xs text-gray-600">
                              Thửa Đất: <span className="font-medium">{orderDetail.totalPlots}</span>
                            </p>
                          </div>
                        </div>

                        {/* Plot Assignments */}
                        {orderDetail.plotAssignments && orderDetail.plotAssignments.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              Phân Công Thửa Đất
                            </h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {orderDetail.plotAssignments.map((p) => (
                                <div
                                  key={p.plotId}
                                  className="p-3 rounded-lg border border-gray-200 bg-gray-50"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {p.plotName}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1">
                                        Diện Tích: <span className="font-medium">{p.servicedArea.toFixed(2)} ha</span>
                                      </p>
                                      {p.completionDate && (
                                        <p className="text-xs text-gray-600">
                                          Hoàn Thành:{' '}
                                          <span className="font-medium">
                                            {formatDate(p.completionDate)}
                                          </span>
                                        </p>
                                      )}
                                      {p.reportNotes && (
                                        <p className="text-xs text-gray-600 mt-1">
                                          Ghi Chú: <span className="italic">{p.reportNotes}</span>
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <Badge className="text-xs">
                                        {p.status}
                                      </Badge>
                                      {p.proofUrls && p.proofUrls.length > 0 && (
                                        <div className="flex flex-col items-end gap-1">
                                          <span className="text-[10px] text-gray-500">
                                            {p.proofUrls.length} hình ảnh
                                          </span>
                                          <div className="mt-1 flex flex-wrap justify-end gap-1">
                                            {p.proofUrls.slice(0, 4).map((url, idx) => (
                                              <button
                                                key={url + idx}
                                                type="button"
                                                onClick={() => openProofViewer(p.proofUrls, idx)}
                                                className="h-10 w-10 overflow-hidden rounded border border-gray-300 bg-white hover:border-blue-400"
                                              >
                                                <img
                                                  src={url}
                                                  alt={`Proof ${idx + 1} for ${p.plotName}`}
                                                  className="h-full w-full object-cover"
                                                />
                                              </button>
                                            ))}
                                            {p.proofUrls.length > 4 && (
                                              <button
                                                type="button"
                                                onClick={() => openProofViewer(p.proofUrls, 4)}
                                                className="flex h-10 w-10 items-center justify-center rounded border border-dashed border-gray-300 bg-white text-[10px] text-gray-600 hover:border-blue-400"
                                              >
                                                +{p.proofUrls.length - 4}
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Proof Image Viewer (slides up from bottom) */}
                <Drawer
                  open={isProofViewerOpen}
                  onOpenChange={(open) => (open ? setIsProofViewerOpen(true) : closeProofViewer())}
                >
                  <DrawerContent side="bottom" className="max-h-[90vh] w-full sm:max-w-3xl mx-auto rounded-t-2xl">
                    <DrawerHeader>
                      <DrawerTitle>Hình Ảnh Minh Chứng</DrawerTitle>
                      {currentProofUrls.length > 0 && (
                        <DrawerDescription>
                          Hình {currentProofIndex + 1} / {currentProofUrls.length}
                        </DrawerDescription>
                      )}
                    </DrawerHeader>
                    <div className="flex flex-col items-center gap-4 pb-4">
                      {currentProofUrls.length > 0 && (
                        <div className="flex w-full flex-col items-center gap-3">
                          <div className="flex items-center justify-center w-full">
                            <img
                              src={currentProofUrls[currentProofIndex]}
                              alt={`Proof ${currentProofIndex + 1}`}
                              className="max-h-[60vh] w-auto max-w-full rounded-lg border border-gray-200 bg-black object-contain"
                            />
                          </div>
                          <div className="flex items-center justify-between w-full px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={showPrevProof}
                              disabled={currentProofUrls.length <= 1}
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              Trước
                            </Button>
                            <span className="text-xs text-gray-600">
                              {currentProofIndex + 1} / {currentProofUrls.length}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={showNextProof}
                              disabled={currentProofUrls.length <= 1}
                            >
                              Tiếp
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            );
          }

          // Create Order Tab Content (existing content)
          return (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tổng Nhóm</p>
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
                        <p className="text-sm text-muted-foreground">Nhóm Hoạt Động</p>
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
                        <p className="text-sm text-muted-foreground">Nhiệm Vụ Đã Chọn</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedTasks.size}</p>
                      </div>
                      <MapPin className="h-8 w-8 text-blue-600" />
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
                        Nhóm
                      </CardTitle>
                      <Select
                        value={statusFilter || 'all'}
                        onValueChange={(value) =>
                          setStatusFilter(value === 'all' ? undefined : value)
                        }
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <Filter className="h-3 w-3 mr-1" />
                          <SelectValue placeholder="Lọc" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất Cả</SelectItem>
                          {isLoadingStatuses ? (
                            <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                          ) : groupStatusesData && Array.isArray(groupStatusesData) && groupStatusesData.length > 0 ? (
                            groupStatusesData.map((status) => (
                              <SelectItem key={status.name} value={status.name}>
                                {status.displayName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-data" disabled>Không có trạng thái</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {groups.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">
                          Không tìm thấy nhóm
                        </p>
                      ) : (
                        groups.map((group) => (
                          <button
                            key={group.groupId}
                            onClick={() => handleGroupSelect(group.groupId)}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${selectedGroupId === group.groupId
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
                                <span>{group.totalPlots} thửa đất</span>
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
                          Trước
                        </Button>
                        <span className="text-xs text-gray-600">
                          Trang {currentPage} / {groupsData.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => p + 1)}
                          disabled={!groupsData.hasNext}
                        >
                          Tiếp
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Ready Plots - Keep existing content */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Plane className="h-5 w-5" />
                        Thửa Đất Sẵn Sàng Cho Dịch Vụ UAV
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
                                <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                              ) : taskTypesData && Array.isArray(taskTypesData) && taskTypesData.length > 0 ? (
                                taskTypesData.map((taskType) => (
                                  <SelectItem key={taskType.name} value={taskType.name}>
                                    {taskType.displayName}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-data" disabled>Không có loại nhiệm vụ</SelectItem>
                              )}
                            </SelectContent>
                          </Select>

                          <div className="flex items-center gap-2">
                            <Label htmlFor="daysFilter" className="text-xs text-gray-600 whitespace-nowrap">
                              Số ngày tới:
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
                          Chọn Một Nhóm
                        </h3>
                        <p className="text-sm text-gray-600 max-w-sm">
                          Chọn một nhóm từ danh sách để xem các thửa đất sẵn sàng cho dịch vụ UAV
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
                          Không Có Thửa Đất Sẵn Sàng
                        </h3>
                        <p className="text-sm text-gray-600 max-w-sm">
                          Không có thửa đất nào sẵn sàng cho dịch vụ {selectedTaskType} trong nhóm này trong vòng {daysBeforeScheduled} ngày tới
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Thử tăng bộ lọc "Số ngày tới" để xem thêm thửa đất
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
                              {(() => {
                                const selectableTasks = readyPlots.filter(p => p.isReady && !p.hasActiveUavOrder && p.cultivationTaskId);
                                const uniquePlots = new Set(selectableTasks.map(p => p.plotId));
                                const allSelected = selectableTasks.every(p => p.cultivationTaskId && selectedTasks.has(p.cultivationTaskId));
                                return allSelected ? 'Bỏ Chọn Tất Cả' : `Chọn Một Mỗi Thửa (${uniquePlots.size} thửa đất)`;
                              })()}
                            </Button>
                            <span className="text-sm text-gray-600">
                              {selectedTasks.size} nhiệm vụ đã chọn ({getSelectedPlotsCount()} thữa đất)
                            </span>
                          </div>

                          <Button
                            onClick={handleCreateOrder}
                            disabled={selectedTasks.size === 0}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plane className="h-4 w-4 mr-2" />
                            Tạo Đơn Hàng UAV
                          </Button>
                        </div>

                        {/* Plot Status Summary */}
                        {readyPlots.length > 0 && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <span className="text-gray-600">Sẵn Sàng: <span className="font-semibold text-gray-900">{readyPlots.filter(p => p.isReady && !p.hasActiveUavOrder).length}</span></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                <span className="text-gray-600">Có Đơn: <span className="font-semibold text-gray-900">{readyPlots.filter(p => p.hasActiveUavOrder).length}</span></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                <span className="text-gray-600">Chưa Sẵn Sàng: <span className="font-semibold text-gray-900">{readyPlots.filter(p => !p.isReady).length}</span></span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Selection Summary */}
                        {selectedTasks.size > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600 mb-1">Nhiệm Vụ Đã Chọn</p>
                                <p className="font-bold text-gray-900">{selectedTasks.size} ({getSelectedPlotsCount()} thửa đất)</p>
                              </div>
                              <div>
                                <p className="text-gray-600 mb-1">Tổng Diện Tích</p>
                                <p className="font-bold text-gray-900">
                                  {calculateTotalArea().toFixed(2)} ha
                                </p>
                              </div>
                              {/* <div>
                                <p className="text-gray-600 mb-1">Estimated Cost</p>
                                <p className="font-bold text-gray-900">
                                  {calculateTotalCost().toLocaleString()} đ
                                </p>
                              </div> */}
                            </div>
                          </div>
                        )}

                        {/* Tasks List */}
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                          {sortedReadyPlots.map((plot, index) => {
                            const taskKey = plot.cultivationTaskId || `${plot.plotId}-${index}`;
                            const isSelected = plot.cultivationTaskId && selectedTasks.has(plot.cultivationTaskId);
                            const plotHasOtherSelectedTask = plotHasSelectedTask(plot.plotId, plot.cultivationTaskId || undefined);
                            const isSelectable = plot.isReady &&
                              !plot.hasActiveUavOrder &&
                              plot.cultivationTaskId &&
                              (!plotHasOtherSelectedTask || isSelected);

                            return (
                              <div
                                key={taskKey}
                                onClick={() => isSelectable ? handleTaskToggle(plot.cultivationTaskId!, plot.plotId) : undefined}
                                className={`p-4 rounded-lg border-2 transition-all ${!isSelectable
                                  ? 'opacity-60 cursor-not-allowed border-gray-200 bg-gray-50'
                                  : isSelected
                                    ? 'border-blue-500 bg-blue-50 shadow-md cursor-pointer'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 cursor-pointer'
                                  }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1">
                                    {isSelectable && (
                                      <div className={`mt-1 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected
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
                                            Đã Có Đơn
                                          </Badge>
                                        )}
                                        {!plot.isReady && (
                                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                            {plot.readyStatus}
                                          </Badge>
                                        )}
                                        {plot.isReady && !plot.hasActiveUavOrder && !plotHasOtherSelectedTask && (
                                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                                            ✓ Sẵn Sàng
                                          </Badge>
                                        )}
                                        {plotHasOtherSelectedTask && !isSelected && (
                                          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                                            Nhiệm vụ khác đang chọn
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
                                            <span>Sẵn Sàng: {formatDate(plot.readyDate)}</span>
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
                      Tạo Đơn Hàng UAV
                    </DialogTitle>
                    <DialogDescription>
                      Cấu hình và gửi đơn hàng dịch vụ UAV mới cho {selectedTasks.size} nhiệm vụ trên {getSelectedPlotsCount()} thửa đất
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nhóm:</span>
                        <span className="font-semibold">{selectedGroup?.groupName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Loại Nhiệm Vụ:</span>
                        <span className="font-semibold">{selectedTaskType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nhiệm Vụ Đã Chọn:</span>
                        <span className="font-semibold">{selectedTasks.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng Thửa Đất:</span>
                        <span className="font-semibold">{getSelectedPlotsCount()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng Diện Tích:</span>
                        <span className="font-semibold">{calculateTotalArea().toFixed(2)} ha</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Chi Phí Ước Tính:</span>
                        <span className="font-bold text-blue-600">
                          {calculateTotalCost().toLocaleString()} đ
                        </span>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-2">
                      <Label htmlFor="uavVendorId">Nhà Cung Cấp UAV *</Label>
                      <Select
                        value={uavVendorId}
                        onValueChange={setUavVendorId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nhà cung cấp UAV" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingVendors ? (
                            <SelectItem value="loading" disabled>Đang tải...</SelectItem>
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
                            <SelectItem value="no-vendors" disabled>Không có nhà cung cấp</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {uavVendorId && uavVendorsData && (
                        <p className="text-xs text-gray-500 mt-1">
                          Đã chọn: {uavVendorsData.find(v => v.id === uavVendorId)?.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate">Ngày Lên Lịch *</Label>
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
                      <Label htmlFor="priority">Ưu Tiên</Label>
                      <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Thấp</SelectItem>
                          <SelectItem value="Normal">Bình Thường</SelectItem>
                          <SelectItem value="High">Cao</SelectItem>
                          <SelectItem value="Critical">Khẩn Cấp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderName">Tên Đơn Hàng (Tùy Chọn)</Label>
                      <Input
                        id="orderName"
                        placeholder="Tên đơn hàng tùy chỉnh"
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
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSubmitOrder}
                      disabled={createOrderMutation.isPending || !uavVendorId || !scheduledDate}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang Tạo...
                        </>
                      ) : (
                        <>
                          <Plane className="h-4 w-4 mr-2" />
                          Tạo Đơn Hàng
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          );
        }}
      </Tabs>
    </div>
  );
};

export const Component = UavOrdersRoute;
export default UavOrdersRoute;

