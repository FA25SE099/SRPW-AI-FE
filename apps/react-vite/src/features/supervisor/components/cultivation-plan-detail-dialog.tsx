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
    RefreshCw,
    Camera,
    AlertTriangle,
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
import { useCreateLateFarmerRecord } from '../api/create-late-farmer-record';
import { useCultivationVersions } from '../api/get-cultivation-versions';
import { CultivationPlanTask, CultivationPlanStage } from '../types/cultivation-plan';
import { useFarmLogsByCultivationTask } from '@/features/production-plans/api/get-farm-logs-by-cultivation-task';
import { cn } from '@/utils/cn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CultivationPlanDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    plotId: string;
    groupId: string;
    plotName?: string;
}

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

// Task component with farm logs
const TaskItemWithLogs = ({
    task,
    isInProgress,
    inProgressTaskRef,
    isLatestVersion,
}: {
    task: CultivationPlanTask;
    isInProgress: boolean;
    inProgressTaskRef: React.RefObject<HTMLDivElement> | null;
    isLatestVersion: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(isInProgress);
    const [loadLogs, setLoadLogs] = useState(false);
    const [viewingImages, setViewingImages] = useState<string[] | null>(null);
    const [isReportingLate, setIsReportingLate] = useState(false);
    const [lateNotes, setLateNotes] = useState('');

    const { data: logsData, isLoading: logsLoading, refetch } = useFarmLogsByCultivationTask({
        params: {
            cultivationTaskId: task.taskId,
            currentPage: 1,
            pageSize: 10,
        },
        queryConfig: {
            enabled: loadLogs,
        },
    });

    const createLateRecordMutation = useCreateLateFarmerRecord();

    const handleReportLate = () => {
        if (!lateNotes.trim()) {
            // Optionally show a notification for empty notes
            return;
        }
        createLateRecordMutation.mutate({
            cultivationTaskId: task.taskId,
            notes: lateNotes,
        }, {
            onSuccess: () => {
                setIsReportingLate(false);
                setLateNotes('');
            }
        });
    };

    useEffect(() => {
        if (isOpen && !loadLogs) {
            setLoadLogs(true);
        }
    }, [isOpen, loadLogs]);

    return (
        <>
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
            >
                <div
                    ref={inProgressTaskRef}
                    className={cn(
                        'border rounded-lg transition-colors',
                        isInProgress && 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    )}
                >
                    <CollapsibleTrigger asChild>
                        <div className="w-full p-3 flex items-center justify-between hover:bg-muted/50 rounded-lg cursor-pointer">
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
                                    {isLatestVersion && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsReportingLate(true);
                                            }}
                                            title="Report Late Task"
                                        >
                                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                                        </Button>
                                    )}
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

                            {/* Farm Logs Section */}
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-sm font-semibold">Farm Logs</h5>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            refetch();
                                        }}
                                        disabled={logsLoading}
                                    >
                                        <RefreshCw className={cn('h-4 w-4', logsLoading && 'animate-spin')} />
                                    </Button>
                                </div>

                                {logsLoading && (
                                    <div className="flex items-center justify-center py-4">
                                        <Spinner size="sm" />
                                    </div>
                                )}

                                {!logsLoading && logsData?.data && logsData.data.length > 0 ? (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {logsData.data.map((log) => (
                                            <div
                                                key={log.farmLogId}
                                                className="p-3 bg-muted/30 rounded-lg space-y-2"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1 flex-1">
                                                        <p className="text-sm font-medium">{log.cultivationTaskName}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Thửa {log.soThua}, Tờ {log.soTo}
                                                        </p>
                                                        {log.workDescription && (
                                                            <p className="text-sm text-muted-foreground">{log.workDescription}</p>
                                                        )}
                                                    </div>
                                                    <Badge variant="outline" className="ml-2">
                                                        {log.completionPercentage}% Complete
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>Logged: {formatDate(log.loggedDate)}</span>
                                                    {log.actualAreaCovered && (
                                                        <span>Area: {log.actualAreaCovered} ha</span>
                                                    )}
                                                </div>

                                                {(log.materialsUsed.length > 0 || (log.serviceCost && log.serviceCost > 0) || (log.photoUrls && log.photoUrls.length > 0)) && (
                                                    <div className="mt-2 space-y-2">
                                                        {log.materialsUsed.length > 0 && (
                                                            <div className="text-xs bg-orange-50 dark:bg-orange-950/20 p-2 rounded border border-orange-100 dark:border-orange-900/30">
                                                                <p className="font-medium text-orange-700 dark:text-orange-300 mb-1">Materials Used:</p>
                                                                <ul className="space-y-1">
                                                                    {log.materialsUsed.map((material, idx) => (
                                                                        <li key={idx} className="flex justify-between text-orange-800 dark:text-orange-200">
                                                                            <span>• {material.materialName}</span>
                                                                            <span>{material.actualQuantityUsed}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-4 text-xs">
                                                            {log.serviceCost && log.serviceCost > 0 && (
                                                                <span className="text-blue-600 font-medium">
                                                                    Service: {log.serviceCost.toLocaleString('vi-VN')} VND
                                                                </span>
                                                            )}
                                                            {log.photoUrls && log.photoUrls.length > 0 && (
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
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    !logsLoading && (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No farm logs available
                                        </p>
                                    )
                                )}
                            </div>
                        </div>
                    </CollapsibleContent>
                </div>
            </Collapsible>
            <ImageViewer
                images={viewingImages || []}
                open={!!viewingImages}
                onClose={() => setViewingImages(null)}
            />
            <Dialog open={isReportingLate} onOpenChange={setIsReportingLate}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Report Late Task: {task.taskName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <label htmlFor="lateNotes" className="text-sm font-medium text-muted-foreground">Notes</label>
                        <textarea
                            id="lateNotes"
                            value={lateNotes}
                            onChange={(e) => setLateNotes(e.target.value)}
                            placeholder="Enter notes for the late record..."
                            className="w-full p-2 border rounded-md min-h-[100px] focus:ring-1 focus:ring-primary focus:border-primary"
                            rows={4}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsReportingLate(false)} disabled={createLateRecordMutation.isPending}>Cancel</Button>
                            <Button onClick={handleReportLate} disabled={createLateRecordMutation.isPending || !lateNotes.trim()}>
                                {createLateRecordMutation.isPending ? <Spinner size="sm" /> : 'Submit'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const CultivationPlanDetailDialog = ({
    isOpen,
    onClose,
    plotId,
    groupId,
    plotName,
}: CultivationPlanDetailDialogProps) => {
    const inProgressTaskRef = useRef<HTMLDivElement>(null);
    const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

    const { data: cultivationPlan, isLoading, error, refetch } = useCultivationPlanByGroupPlot({
        params: { plotId, groupId, versionId: selectedVersionId },
        queryConfig: {
            enabled: isOpen && !!plotId && !!groupId,
        },
    });

    const { data: versionsData, isLoading: isVersionsLoading } = useCultivationVersions({
        plotCultivationId: cultivationPlan?.plotCultivationId || '',
        queryConfig: {
            enabled: !!cultivationPlan?.plotCultivationId,
        }
    });

    // Handle potential API response inconsistency (unwrapped array vs object with data property)
    const versions = Array.isArray(versionsData) ? versionsData : (versionsData as any)?.data || [];

    // Refetch when dialog opens
    useEffect(() => {
        if (isOpen && plotId && groupId) {
            refetch();
        } else if (!isOpen) {
            setSelectedVersionId(null);
        }
    }, [isOpen, plotId, groupId, refetch]);

    // Auto-scroll to first InProgress task
    useEffect(() => {
        if (cultivationPlan?.stages) {
            setTimeout(() => {
                inProgressTaskRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 100);
        }
    }, [cultivationPlan]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <DialogTitle className="text-2xl">
                                {plotName || cultivationPlan?.plotName || 'Cultivation Plan Details'}
                            </DialogTitle>
                            {(isVersionsLoading || versions.length > 0) && (
                                <div className="w-[200px]">
                                    <Select
                                        value={selectedVersionId || "latest"}
                                        onValueChange={(value) => setSelectedVersionId(value === "latest" ? null : value)}
                                        disabled={isVersionsLoading}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder={isVersionsLoading ? "Loading..." : "Select version"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="latest">Latest Version</SelectItem>
                                            {versions.map((version: any) => (
                                                <SelectItem key={version.id} value={version.id}>
                                                    {version.versionName} {version.isActive ? '(Active)' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
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
                                            const isFirstInProgress = isInProgress && !cultivationPlan.stages
                                                .slice(0, cultivationPlan.stages.indexOf(stage))
                                                .some(s => s.tasks.some(t => t.status === 'InProgress'));

                                            return (
                                                <TaskItemWithLogs
                                                    key={task.taskId}
                                                    task={task}
                                                    isInProgress={isInProgress}
                                                    isLatestVersion={selectedVersionId === null || selectedVersionId === cultivationPlan.activeVersionId}
                                                    inProgressTaskRef={isFirstInProgress ? inProgressTaskRef : null}
                                                />
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
