"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Camera,
  MapPin,
  Calendar,
  Leaf,
  TrendingUp,
  Clock,
  Package,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/utils/cn";
import { useGroupDetail } from "@/features/groups/api/get-groups-detail";
import { useProductionPlan } from "../api/get-production-plan";
import { useFarmLogsByProductionPlanTask } from "../api/get-farm-logs-by-task";

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

const TaskItemWithLogs = ({ task }: { task: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loadLogs, setLoadLogs] = useState(false);
  const [viewingImages, setViewingImages] = useState<string[] | null>(null);

  const { data: logsData, isLoading: logsLoading, refetch } = useFarmLogsByProductionPlanTask({
    params: {
      productionPlanTaskId: task.taskId,
      currentPage: 1,
      pageSize: 10,
    },
    queryConfig: {
      enabled: loadLogs,
    },
  });

  useEffect(() => {
    if (isOpen && !loadLogs) {
      setLoadLogs(true);
    }
  }, [isOpen, loadLogs]);

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="border rounded-lg transition-colors">
          <CollapsibleTrigger asChild>
            <div className="w-full p-3 flex items-center justify-between hover:bg-muted/50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3 flex-1 text-left">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{task.taskName}</p>
                </div>
                <Badge variant="outline">{task.taskType}</Badge>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 pb-3 space-y-3 border-t pt-3 mt-2">
              {task.description && (
                <p className="text-sm text-muted-foreground">{task.description}</p>
              )}
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
                    <RefreshCw className={cn("h-4 w-4", logsLoading && "animate-spin")} />
                  </Button>
                </div>
                {logsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Spinner size="sm" />
                  </div>
                ) : logsData?.data && logsData.data.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {logsData.data.map((log) => (
                      <div key={log.farmLogId} className="p-3 bg-muted/30 rounded-lg space-y-2">
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
                            {log.completionPercentage}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Logged: {new Date(log.loggedDate).toLocaleDateString("vi-VN")}</span>
                          {log.actualAreaCovered && <span>Area: {log.actualAreaCovered} ha</span>}
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
                                  Service: {log.serviceCost.toLocaleString("vi-VN")} VND
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
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No farm logs available
                  </p>
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
    </>
  );
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
};

export const ProductionPlanDetailDialog = ({
  isOpen,
  onClose,
  groupId,
}: Props) => {
  const { data, isLoading } = useGroupDetail({ groupId });
  const planSummary = data?.productionPlans?.[0];

  const { data: planDetail, isLoading: isPlanDetailLoading } = useProductionPlan({
    planId: planSummary?.id || "",
    queryConfig: {
      enabled: !!planSummary?.id && isOpen,
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Production Plan Details</DialogTitle>
        </DialogHeader>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* No plan */}
        {!isLoading && !planSummary && (
          <p className="text-center text-muted-foreground py-8">
            This group has no production plan yet.
          </p>
        )}

        {/* Plan info */}
        {!isLoading && planSummary && (
          <div className="space-y-6">
            {/* Header */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{planSummary.planName}</h2>
                <Badge
                  variant={
                    planSummary.status === "Completed"
                      ? "default"
                      : planSummary.status === "InProgress"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {planSummary.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm font-bold">{planSummary.basePlantingDate?.slice(0, 10)}</p>
                    <p className="text-sm text-muted-foreground">Planting Date</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-bold">{planSummary.totalArea} ha</p>
                    <p className="text-sm text-muted-foreground">Total Area</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stages and Tasks */}
            {isPlanDetailLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : planDetail ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cultivation Stages & Tasks</h3>
                {planDetail.stages.map((stage: any) => (
                  <Card key={stage.stageId} className="p-4">
                    <div className="mb-3">
                      <h4 className="text-md font-semibold flex items-center gap-2">
                        <span className="text-primary">{stage.sequenceOrder}.</span>
                        {stage.stageName}
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {stage.tasks.map((task: any) => (
                        <TaskItemWithLogs key={task.taskId} task={task} />
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
