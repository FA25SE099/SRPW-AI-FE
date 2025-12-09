import { useState, useEffect, useRef } from 'react';
import {
    Calendar,
    ChevronDown,
    ChevronRight,
    Clock,
    FileText,
    Leaf,
    MapPin,
    Package,
    TrendingUp,
    X,
} from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCultivationPlanByGroupPlot } from '../api/get-cultivation-plan';
import { CultivationPlanTask, CultivationPlanStage } from '../types/cultivation-plan';
import { cn } from '@/utils/cn';

interface CultivationPlanDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    plotId: string;
    groupId: string;
    plotName?: string;
}

const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
        case 'Fertilization':
            return <Package className="h-4 w-4" />;
        case 'Sowing':
            return <Leaf className="h-4 w-4" />;
        case 'PestControl':
            return <FileText className="h-4 w-4" />;
        case 'Harvesting':
            return <TrendingUp className="h-4 w-4" />;
        case 'LandPreparation':
            return <MapPin className="h-4 w-4" />;
        default:
            return <FileText className="h-4 w-4" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'InProgress':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'Approved':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

export const CultivationPlanDetailDialog = ({
    isOpen,
    onClose,
    plotId,
    groupId,
    plotName,
}: CultivationPlanDetailDialogProps) => {
    const [openTasks, setOpenTasks] = useState<Set<string>>(new Set());
    const inProgressTaskRef = useRef<HTMLDivElement>(null);

    const { data: cultivationPlan, isLoading, error, refetch } = useCultivationPlanByGroupPlot({
        params: { plotId, groupId },
        queryConfig: {
            enabled: isOpen && !!plotId && !!groupId,
        },
    });

    // Refetch when dialog opens
    useEffect(() => {
        if (isOpen && plotId && groupId) {
            refetch();
        }
    }, [isOpen, plotId, groupId, refetch]);

    // Auto-expand InProgress tasks and scroll to the first one
    useEffect(() => {
        if (cultivationPlan?.stages) {
            const inProgressTaskIds = new Set<string>();
            let firstInProgressTaskId: string | null = null;

            cultivationPlan.stages.forEach((stage) => {
                stage.tasks.forEach((task) => {
                    if (task.status === 'InProgress') {
                        inProgressTaskIds.add(task.taskId);
                        if (!firstInProgressTaskId) {
                            firstInProgressTaskId = task.taskId;
                        }
                    }
                });
            });

            setOpenTasks(inProgressTaskIds);

            // Scroll to first InProgress task after a short delay to ensure rendering
            if (firstInProgressTaskId) {
                setTimeout(() => {
                    inProgressTaskRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                }, 100);
            }
        }
    }, [cultivationPlan]);

    const toggleTask = (taskId: string) => {
        setOpenTasks((prev) => {
            const next = new Set(prev);
            if (next.has(taskId)) {
                next.delete(taskId);
            } else {
                next.add(taskId);
            }
            return next;
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl">
                            {plotName || cultivationPlan?.plotName || 'Cultivation Plan Details'}
                        </DialogTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-800 dark:text-red-200">
                            Failed to load cultivation plan: {error.message}
                        </p>
                    </div>
                )}

                {cultivationPlan && (
                    <div className="space-y-6">
                        {/* Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="text-2xl font-bold">{cultivationPlan.plotArea}</p>
                                        <p className="text-sm text-muted-foreground">Area (ha)</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <Leaf className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="text-sm font-bold truncate" title={cultivationPlan.riceVarietyName}>
                                            {cultivationPlan.riceVarietyName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Rice Variety</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-8 w-8 text-purple-600" />
                                    <div>
                                        <p className="text-sm font-bold">{formatDate(cultivationPlan.plantingDate)}</p>
                                        <p className="text-sm text-muted-foreground">Planting Date</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="h-8 w-8 text-orange-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {cultivationPlan.progress.completionPercentage.toFixed(0)}%
                                        </p>
                                        <p className="text-sm text-muted-foreground">Progress</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Production Plan Info */}
                        <Card className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Production Plan</p>
                                    <p className="font-semibold">{cultivationPlan.productionPlanName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Season</p>
                                    <p className="font-semibold">{cultivationPlan.seasonName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge className={getStatusColor(cultivationPlan.status)}>
                                        {cultivationPlan.status}
                                    </Badge>
                                </div>
                            </div>
                        </Card>

                        {/* Progress Stats */}
                        <Card className="p-4">
                            <h3 className="font-semibold mb-4">Task Progress</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div>
                                    <p className="text-2xl font-bold">{cultivationPlan.progress.totalTasks}</p>
                                    <p className="text-sm text-muted-foreground">Total Tasks</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">
                                        {cultivationPlan.progress.completedTasks}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {cultivationPlan.progress.inProgressTasks}
                                    </p>
                                    <p className="text-sm text-muted-foreground">In Progress</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-600">
                                        {cultivationPlan.progress.pendingTasks}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {cultivationPlan.progress.estimatedDaysRemaining}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Days Remaining</p>
                                </div>
                            </div>
                        </Card>

                        {/* Stages and Tasks */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Cultivation Stages & Tasks</h3>

                            {cultivationPlan.stages.map((stage) => (
                                <Card key={stage.stageId} className="p-4">
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-md font-semibold flex items-center gap-2">
                                                <span className="text-primary">{stage.sequenceOrder}.</span>
                                                {stage.stageName}
                                            </h4>
                                            <Badge variant="outline">
                                                {stage.tasks.length} task{stage.tasks.length !== 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                        {stage.description && (
                                            <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {stage.tasks.map((task, index) => {
                                            const isInProgress = task.status === 'InProgress';
                                            const isOpen = openTasks.has(task.taskId);
                                            const isFirstInProgress = isInProgress && !cultivationPlan.stages
                                                .slice(0, cultivationPlan.stages.indexOf(stage))
                                                .some(s => s.tasks.some(t => t.status === 'InProgress'));

                                            return (
                                                <Collapsible
                                                    key={task.taskId}
                                                    open={isOpen}
                                                    onOpenChange={() => toggleTask(task.taskId)}
                                                >
                                                    <div
                                                        ref={isFirstInProgress ? inProgressTaskRef : null}
                                                        className={cn(
                                                            'border rounded-lg transition-colors',
                                                            isInProgress && 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                                        )}
                                                    >
                                                        <CollapsibleTrigger className="w-full">
                                                            <div className="p-3 flex items-center justify-between hover:bg-muted/50 rounded-lg">
                                                                <div className="flex items-center gap-3 flex-1 text-left">
                                                                    {isOpen ? (
                                                                        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                                    ) : (
                                                                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                                    )}

                                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                                        {getTaskTypeIcon(task.taskType)}
                                                                    </div>

                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium truncate">{task.taskName}</p>
                                                                    </div>

                                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                                        <Badge className={getStatusColor(task.status)}>
                                                                            {task.status}
                                                                        </Badge>

                                                                        {task.plannedStartDate && (
                                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                                <Clock className="h-3 w-3" />
                                                                                <span>Start: {formatDate(task.plannedStartDate)}</span>
                                                                            </div>
                                                                        )}

                                                                        {task.plannedEndDate && (
                                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                                <Clock className="h-3 w-3" />
                                                                                <span>End: {formatDate(task.plannedEndDate)}</span>
                                                                            </div>
                                                                        )}

                                                                        {task.actualStartDate && (
                                                                            <div className="flex items-center gap-1 text-xs text-green-600">
                                                                                <Clock className="h-3 w-3" />
                                                                                <span>Actual Start: {formatDate(task.actualStartDate)}</span>
                                                                            </div>
                                                                        )}

                                                                        {task.actualEndDate && (
                                                                            <div className="flex items-center gap-1 text-xs text-green-600">
                                                                                <Clock className="h-3 w-3" />
                                                                                <span>Actual End: {formatDate(task.actualEndDate)}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CollapsibleTrigger>

                                                        <CollapsibleContent>
                                                            <div className="px-3 pb-3 space-y-3 border-t pt-3 mt-2">
                                                                {/* Task Description */}
                                                                {task.taskDescription && (
                                                                    <div>
                                                                        <p className="text-sm font-medium mb-1">Description:</p>
                                                                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                                                                            {task.taskDescription}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {/* Materials */}
                                                                {task.materials.length > 0 && (
                                                                    <div>
                                                                        <p className="text-sm font-medium mb-2">Materials:</p>
                                                                        <div className="space-y-2">
                                                                            {task.materials.map((material) => (
                                                                                <div
                                                                                    key={material.materialId}
                                                                                    className="flex items-center justify-between p-2 bg-muted/50 rounded"
                                                                                >
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                                                        <span className="text-sm font-medium">
                                                                                            {material.materialName}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-4 text-sm">
                                                                                        {material.plannedQuantity > 0 && (
                                                                                            <span className="text-muted-foreground">
                                                                                                Planned: {material.plannedQuantity} {material.unit}
                                                                                            </span>
                                                                                        )}
                                                                                        {material.actualQuantity > 0 && (
                                                                                            <span className="font-medium">
                                                                                                Actual: {material.actualQuantity} {material.unit}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Task Priority */}
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-muted-foreground">Priority:</span>
                                                                    <Badge variant={task.priority === 'High' ? 'destructive' : 'outline'}>
                                                                        {task.priority}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </CollapsibleContent>
                                                    </div>
                                                </Collapsible>
                                            );
                                        })}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
