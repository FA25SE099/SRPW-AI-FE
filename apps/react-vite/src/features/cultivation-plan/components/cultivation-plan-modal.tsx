import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, Calendar, Leaf, CheckCircle2, Clock, TrendingUp, AlertCircle, MapPin, Sprout, ChevronDown, Package } from "lucide-react";
import { useCurrentCultivationPlan } from "../api/get-current-cultivation-plan";
import { useState } from "react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    plotId: string;
    plotName?: string;
};

export const CultivationPlanModal = ({ isOpen, onClose, plotId, plotName }: Props) => {
    const { data: plan, isLoading, error } = useCurrentCultivationPlan(plotId);
    const [openStages, setOpenStages] = useState<Set<string>>(new Set());

    const getTaskStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'InProgress':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Approved':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            default:
                return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    const getTaskStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed':
                return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
            case 'InProgress':
                return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
            default:
                return <div className="w-2 h-2 bg-slate-400 rounded-full" />;
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const toggleStage = (stageId: string) => {
        setOpenStages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(stageId)) {
                newSet.delete(stageId);
            } else {
                newSet.add(stageId);
            }
            return newSet;
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Sprout className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-slate-900">
                                Cultivation Plan
                            </DialogTitle>
                            {plotName && <p className="text-sm text-slate-500 mt-1">{plotName}</p>}
                        </div>
                    </div>
                </DialogHeader>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center space-y-3">
                            <Loader2 className="h-10 w-10 animate-spin mx-auto text-emerald-600" />
                            <p className="text-sm text-slate-600">Loading cultivation plan...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center space-y-3 max-w-md">
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle className="h-7 w-7 text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Unable to load plan</h3>
                            <p className="text-sm text-slate-600">
                                {error instanceof Error ? error.message : "Please try again later"}
                            </p>
                        </div>
                    </div>
                )}

                {/* Data Display */}
                {!isLoading && !error && plan && (
                    <div className="space-y-6 pb-6">
                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="border border-slate-200 hover:shadow-md transition-shadow">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Plot Area</p>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{plan.plotArea.toFixed(2)} ha</p>
                                    <p className="text-xs text-slate-500 mt-1">{plan.plotName}</p>
                                </CardContent>
                            </Card>

                            <Card className="border border-slate-200 hover:shadow-md transition-shadow">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Sprout className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rice Variety</p>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{plan.riceVarietyName}</p>
                                    <Badge variant="outline" className="mt-1 text-xs">{plan.status}</Badge>
                                </CardContent>
                            </Card>

                            <Card className="border border-slate-200 hover:shadow-md transition-shadow">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Expected Yield</p>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{plan.expectedYield} tons</p>
                                    <p className="text-xs text-slate-500 mt-1">Target production</p>
                                </CardContent>
                            </Card>

                            <Card className="border border-slate-200 hover:shadow-md transition-shadow">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Planting Date</p>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{formatDate(plan.plantingDate)}</p>
                                    <p className="text-xs text-slate-500 mt-1">{plan.seasonName} Season</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Rice Variety Description */}
                        {plan.riceVarietyDescription && (
                            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                                <CardContent className="p-5">
                                    <h3 className="text-sm font-semibold text-emerald-900 mb-2 uppercase tracking-wide">About This Variety</h3>
                                    <p className="text-sm text-emerald-800 leading-relaxed">{plan.riceVarietyDescription}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Progress Card */}
                        <Card className="border border-slate-200">
                            <CardHeader className="pb-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Cultivation Progress</h3>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-600">Overall Completion</span>
                                    <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                        {plan.progress.completionPercentage.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                                    <div
                                        className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                                        style={{ width: `${plan.progress.completionPercentage}%` }}
                                    ></div>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                                        <p className="text-3xl font-bold text-slate-900">{plan.progress.totalTasks}</p>
                                        <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wide">Total Tasks</p>
                                    </div>
                                    <div className="text-center p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                                        <p className="text-3xl font-bold text-emerald-600">{plan.progress.completedTasks}</p>
                                        <p className="text-xs text-emerald-700 mt-1 font-semibold uppercase tracking-wide">Completed</p>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                                        <p className="text-3xl font-bold text-blue-600">{plan.progress.inProgressTasks}</p>
                                        <p className="text-xs text-blue-700 mt-1 font-semibold uppercase tracking-wide">In Progress</p>
                                    </div>
                                    <div className="text-center p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                                        <p className="text-3xl font-bold text-amber-600">{plan.progress.pendingTasks}</p>
                                        <p className="text-xs text-amber-700 mt-1 font-semibold uppercase tracking-wide">Pending</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-slate-500" />
                                        <span className="text-sm text-slate-600">
                                            <span className="font-bold text-slate-900">{Math.abs(plan.progress.daysElapsed)}</span> days {plan.progress.daysElapsed < 0 ? 'until start' : 'elapsed'}
                                        </span>
                                    </div>
                                    <span className="text-sm text-slate-600">
                                        <span className="font-bold text-slate-900">{plan.progress.estimatedDaysRemaining}</span> days remaining
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cultivation Stages */}
                        <Card className="border border-slate-200">
                            <CardHeader className="pb-4 bg-slate-50 border-b">
                                <h3 className="text-lg font-bold text-slate-900">Cultivation Tasks ({plan.progress.totalTasks})</h3>
                                <p className="text-sm text-slate-600 mt-1">Organized by growth stages</p>
                            </CardHeader>
                            <CardContent className="p-6">
                                {plan.stages && plan.stages.length > 0 ? (
                                    <div className="space-y-3">
                                        {plan.stages.map((stage) => (
                                            <Collapsible
                                                key={stage.stageId}
                                                open={openStages.has(stage.stageId)}
                                                onOpenChange={() => toggleStage(stage.stageId)}
                                            >
                                                <Card className="border-2 border-emerald-200 overflow-hidden hover:shadow-md transition-shadow">
                                                    <CollapsibleTrigger className="w-full">
                                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-colors cursor-pointer">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                                    {stage.sequenceOrder}
                                                                </div>
                                                                <div className="text-left">
                                                                    <h4 className="font-bold text-slate-900">{stage.stageName}</h4>
                                                                    <p className="text-xs text-slate-600 mt-0.5">
                                                                        {stage.tasks.length} task{stage.tasks.length !== 1 ? 's' : ''} • ~{stage.typicalDurationDays} days
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <ChevronDown
                                                                className={`w-5 h-5 text-emerald-600 transition-transform duration-200 ${openStages.has(stage.stageId) ? 'transform rotate-180' : ''
                                                                    }`}
                                                            />
                                                        </div>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <div className="p-4 bg-white space-y-3">
                                                            {stage.tasks.map((task) => (
                                                                <div
                                                                    key={task.taskId}
                                                                    className="group p-4 border-l-4 border-emerald-300 bg-slate-50 rounded-r-lg hover:bg-white hover:shadow-sm transition-all"
                                                                >
                                                                    <div className="flex items-start justify-between gap-4 mb-3">
                                                                        <div className="flex items-start gap-3 flex-1">
                                                                            <div className="mt-0.5">
                                                                                {getTaskStatusIcon(task.status)}
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                    <span className="text-xs font-bold text-slate-500">#{task.orderIndex}</span>
                                                                                    <h5 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                                                                        {task.taskName}
                                                                                    </h5>
                                                                                </div>
                                                                                <p className="text-sm text-slate-600 leading-relaxed mt-2">
                                                                                    {task.taskDescription}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <Badge className={`${getTaskStatusColor(task.status)} border shrink-0 font-semibold`}>
                                                                            {task.status === 'InProgress' ? 'In Progress' : task.status}
                                                                        </Badge>
                                                                    </div>

                                                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600 mt-3 ml-7">
                                                                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                                                                            <span className="font-semibold text-slate-700">Type:</span> {task.taskType}
                                                                        </span>
                                                                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                                                                            <span className="font-semibold text-slate-700">Priority:</span> {task.priority}
                                                                        </span>
                                                                        {task.plannedEndDate && (
                                                                            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                                                                                <Calendar className="w-3 h-3" />
                                                                                <span className="font-semibold text-slate-700">Due:</span> {formatDate(task.plannedEndDate)}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {(task.actualStartDate || task.actualEndDate) && (
                                                                        <div className="flex flex-wrap gap-4 text-xs mt-3 ml-7 text-slate-600">
                                                                            {task.actualStartDate && (
                                                                                <span className="bg-blue-50 px-2 py-1 rounded border border-blue-200">
                                                                                    Started: <span className="font-semibold text-blue-700">{formatDate(task.actualStartDate)}</span>
                                                                                </span>
                                                                            )}
                                                                            {task.actualEndDate && (
                                                                                <span className="bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                                                                    Completed: <span className="font-semibold text-emerald-700">{formatDate(task.actualEndDate)}</span>
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {task.materials && task.materials.length > 0 && (
                                                                        <div className="mt-4 ml-7 p-3 bg-white rounded-lg border-2 border-slate-200">
                                                                            <div className="flex items-center gap-2 mb-3">
                                                                                <Package className="w-4 h-4 text-emerald-600" />
                                                                                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                                                                    Materials Required ({task.materials.length})
                                                                                </p>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                {task.materials.map((material) => (
                                                                                    <div
                                                                                        key={material.materialId}
                                                                                        className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200"
                                                                                    >
                                                                                        <span className="text-sm font-medium text-slate-700">
                                                                                            {material.materialName}
                                                                                        </span>
                                                                                        <span className="text-sm font-bold text-emerald-600">
                                                                                            {material.actualQuantity || material.plannedQuantity} {material.unit}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CollapsibleContent>
                                                </Card>
                                            </Collapsible>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                                        <p className="font-medium">No cultivation stages available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Yield Forecast */}
                        <Card className="border border-slate-200">
                            <CardHeader className="pb-4 bg-slate-50 border-b">
                                <h3 className="text-lg font-bold text-slate-900">Yield Forecast</h3>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="text-center p-8 bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-100 rounded-2xl border-2 border-emerald-300 shadow-lg">
                                        <p className="text-xs font-bold text-emerald-700 mb-3 uppercase tracking-wider">Expected Yield</p>
                                        <p className="text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                                            {plan.expectedYield}
                                        </p>
                                        <p className="text-sm text-emerald-700 font-bold">tons</p>
                                    </div>
                                    <div className="text-center p-8 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 rounded-2xl border-2 border-blue-300 shadow-lg">
                                        <p className="text-xs font-bold text-blue-700 mb-3 uppercase tracking-wider">Actual Yield</p>
                                        <p className="text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                            {plan.actualYield || '—'}
                                        </p>
                                        <p className="text-sm text-blue-700 font-bold">
                                            {plan.actualYield ? 'tons' : 'not harvested yet'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};