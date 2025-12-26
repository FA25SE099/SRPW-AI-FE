import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, DollarSign, RefreshCw, ChevronDown, Camera } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TableElement,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs as RadixTabs,
  TabsList as RadixTabsList,
  TabsTrigger as RadixTabsTrigger,
  TabsContent as RadixTabsContent,
} from '@/components/ui/tabs/radix-tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePlanDetails } from '@/features/supervisor/api/get-plan-details';
import { useFarmLogsByProductionPlanTask } from '@/features/production-plans/api/get-farm-logs-by-task';
import { Head } from '@/components/seo/head';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'inprogress':
      return <Clock className="h-5 w-5 text-blue-600" />;
    default:
      return <Clock className="h-5 w-5 text-gray-400" />;
  }
};

const ImageViewer = ({ images, open, onClose }: { images: string[]; open: boolean; onClose: () => void }) => {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Farm Log Images</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-4">
          {images.map((url, index) => (
            <a href={url} target="_blank" rel="noopener noreferrer" key={index}>
              <img
                src={url}
                alt={`Farm log image ${index + 1}`}
                className="rounded-lg object-cover w-full h-full cursor-pointer hover:opacity-80 transition-opacity"
              />
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Task row component with farm logs
const TaskRowWithLogs = ({ task }: { task: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loadLogs, setLoadLogs] = useState(false);
  const [viewingImages, setViewingImages] = useState<string[] | null>(null);

  const { data: logsData, isLoading: logsLoading, refetch } = useFarmLogsByProductionPlanTask({
    params: {
      productionPlanTaskId: task.productionPlanTaskId || task.taskId,
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
    <>
      <TableRow>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleToggle}
            >
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  isOpen && 'transform rotate-180'
                )}
              />
            </Button>
            {task.taskName}
          </div>
        </TableCell>
        <TableCell>{task.taskType}</TableCell>
        <TableCell className="text-sm">{formatDate(task.scheduledDate)}</TableCell>
        <TableCell className="text-sm">
          {task.actualStartDate ? formatDate(task.actualStartDate) : '-'}
        </TableCell>
        <TableCell>
          {task.totalActualCost
            ? formatCurrency(task.totalActualCost)
            : formatCurrency(task.estimatedCost)}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Badge variant={task.status === 'Completed' ? 'default' : 'outline'}>
              {task.status}
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
        </TableCell>
      </TableRow>
      {isOpen && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/50 p-4">
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
                    className="border rounded-lg p-3 bg-background"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
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
                        {log.photoUrls && log.photoUrls.length > 0 && (
                          <div className="mt-2">
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-xs flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingImages(log.photoUrls || []);
                              }}
                            >
                              <Camera className="h-3 w-3" />
                              View {log.photoUrls.length} image(s)
                            </Button>
                          </div>
                        )}
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
                No farm logs found for this task
              </p>
            )}
          </TableCell>
        </TableRow>
      )}
      <ImageViewer
        images={viewingImages || []}
        open={!!viewingImages}
        onClose={() => setViewingImages(null)}
      />
    </>
  );
};

const SupervisorPlanDetailsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId') || '';

  const { data: planData, isLoading, error } = usePlanDetails({ planId });

  // Ensure plan is always an object with expected properties
  const plan = planData || {};

  if (!planId) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Invalid Plan ID</AlertTitle>
          <AlertDescription>
            No plan ID provided. Please navigate from the group page.
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground">Loading detailed plan information...</p>
        <p className="text-sm text-muted-foreground">This may take a few moments</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Plan Details</AlertTitle>
          <AlertDescription>
            {error.message || 'Failed to load plan details. Please try again.'}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Plan Not Found</AlertTitle>
          <AlertDescription>
            The requested plan could not be found.
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <Head title={`Plan Details - ${(plan as any)?.planName || 'Loading...'}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{(plan as any)?.planName || 'Loading...'}</h1>
              <p className="text-muted-foreground">
                {(plan as any)?.seasonName} {(plan as any)?.seasonYear} • {(plan as any)?.groupName}
              </p>
            </div>
          </div>
          <Badge variant={(plan as any)?.status === 'Completed' ? 'default' : 'secondary'}>
            {(plan as any)?.status || 'Unknown'}
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-bold">{((plan as any)?.overallProgressPercentage || 0).toFixed(1)}%</p>
                </div>
                <Progress value={(plan as any)?.overallProgressPercentage || 0} className="h-2 w-16" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tasks</p>
                  <p className="text-2xl font-bold">{(plan as any)?.completedTasks || 0}/{(plan as any)?.totalTasks || 0}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Days Elapsed</p>
                  <p className="text-2xl font-bold">{(plan as any)?.daysElapsed || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Actual Cost</p>
                  <p className="text-lg font-bold">{formatCurrency((plan as any)?.actualCostToDate || 0)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <RadixTabs defaultValue="stages" className="space-y-6">
          <RadixTabsList>
            <RadixTabsTrigger value="stages">Stages & Tasks</RadixTabsTrigger>
            <RadixTabsTrigger value="plots">Plot Progress</RadixTabsTrigger>
            {(plan as any)?.economicsDetail && (
              <RadixTabsTrigger value="economics">Economics</RadixTabsTrigger>
            )}
          </RadixTabsList>

          {/* Stages Tab */}
          <RadixTabsContent value="stages" className="space-y-4">
            {((plan as any)?.stages || []).map((stage: any) => (
              <Card key={stage.stageId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(stage.status)}
                      <div>
                        <CardTitle>{stage.stageName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Stage {stage.sequenceOrder} • {stage.completedTasks}/{stage.totalTasks} tasks
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{stage.progressPercentage.toFixed(0)}%</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(stage.actualStageCost || stage.estimatedStageCost)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={stage.progressPercentage} className="mb-4" />

                  <div className="border rounded-lg">
                    <TableElement>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Scheduled</TableHead>
                          <TableHead>Actual</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(stage?.tasks || []).map((task: any) => (
                          <TaskRowWithLogs key={task.taskId} task={task} />
                        ))}
                      </TableBody>
                    </TableElement>
                  </div>
                </CardContent>
              </Card>
            ))}
          </RadixTabsContent>

          {/* Plot Progress Tab */}
          <RadixTabsContent value="plots">
            <Card>
              <CardHeader>
                <CardTitle>Plot-by-Plot Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <TableElement>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plot</TableHead>
                        <TableHead>Farmer</TableHead>
                        <TableHead>Area (ha)</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Latest Activity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {((plan as any)?.plotProgress || []).map((plot: any) => (
                        <TableRow key={plot.plotId}>
                          <TableCell className="font-medium">{plot.plotIdentifier}</TableCell>
                          <TableCell>{plot.farmerName}</TableCell>
                          <TableCell>{plot.area}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={plot.progressPercentage} className="h-2 w-20" />
                              <span className="text-sm font-medium">
                                {plot.progressPercentage.toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{plot.completedTasks}/{plot.totalTasks}</TableCell>
                          <TableCell>
                            {plot.actualCost
                              ? formatCurrency(plot.actualCost)
                              : formatCurrency(plot.estimatedCost)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {plot.latestCompletedTask || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableElement>
                </div>
              </CardContent>
            </Card>
          </RadixTabsContent>

          {/* Economics Tab */}
          {(plan as any)?.economicsDetail && (
            <RadixTabsContent value="economics">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Economic Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency((plan as any)?.economicsDetail?.totalRevenue || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gross Profit</p>
                        <p className="text-xl font-bold">
                          {formatCurrency((plan as any)?.economicsDetail?.grossProfit || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Profit Margin</p>
                        <p className="text-xl font-bold">
                          {((plan as any)?.economicsDetail?.profitMargin || 0).toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ROI</p>
                        <p className="text-xl font-bold text-blue-600">
                          {((plan as any)?.economicsDetail?.returnOnInvestment || 0).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Yield Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Expected</p>
                        <p className="text-2xl font-bold">{(plan as any)?.economicsDetail?.expectedYield || 0} tons</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Actual</p>
                        <p className="text-2xl font-bold text-green-600">
                          {(plan as any)?.economicsDetail?.actualYield || 0} tons
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Per Hectare</p>
                        <p className="text-2xl font-bold">
                          {((plan as any)?.economicsDetail?.yieldPerHectare || 0).toFixed(2)} t/ha
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </RadixTabsContent>
          )}
        </RadixTabs>
      </div>
    </>
  );
};

export default SupervisorPlanDetailsPage;
