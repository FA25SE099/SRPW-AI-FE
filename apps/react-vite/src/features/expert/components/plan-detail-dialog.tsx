import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { usePlanDetail } from '../api/get-plan-detail';

type PlanDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string | null;
};

export const PlanDetailDialog = ({ open, onOpenChange, planId }: PlanDetailDialogProps) => {
  const { data, isLoading, error } = usePlanDetail({ planId: planId || '', queryConfig: { enabled: open && !!planId } });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Plan Details</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <div className="p-4 text-center text-red-600">Failed to load plan details.</div>
        )}

        {data && (
          <div className="space-y-4 overflow-y-auto pr-2">
            <div className="rounded border p-4">
              <div className="text-lg font-semibold">{data.planName}</div>
              <div className="text-sm text-gray-600">Status: {data.status}</div>
              <div className="text-sm text-gray-600">Total Area: {data.totalArea} ha</div>
              <div className="text-sm text-gray-600">Base Planting Date: {new Date(data.basePlantingDate).toLocaleDateString()}</div>
            </div>

            {/* <div className="rounded border p-4">
              <div className="mb-2 text-base font-semibold">Group Details</div>
              <div className="text-sm">Cluster: {data.groupDetails.clusterName}</div>
              <div className="text-sm">Area: {data.groupDetails.totalArea} ha</div>
              <div className="mt-2 text-sm font-medium">Plots</div>
              <div className="mt-1 divide-y rounded border">
                {data.groupDetails.plots.map((plot) => (
                  <div key={plot.id} className="grid grid-cols-2 gap-2 p-2 text-sm">
                    <div>ID: {plot.id}</div>
                    <div>Area: {plot.area} ha</div>
                    <div>Status: {plot.status}</div>
                    <div>Farmer: {plot.farmerId}</div>
                  </div>
                ))}
              </div>
            </div> */}

            <div className="rounded border p-4">
              <div className="mb-2 text-base font-semibold">Stages</div>
              <div className="space-y-3">
                {data.stages.map((stage) => (
                  <div key={stage.id} className="rounded border p-3">
                    <div className="font-medium">{stage.sequenceOrder}. {stage.stageName}</div>
                    <div className="mt-2 space-y-2">
                      {stage.tasks.map((task) => (
                        <div key={task.id} className="rounded border p-2">
                          <div className="text-sm font-medium">{task.sequenceOrder}. {task.taskName} ({task.taskType})</div>
                          {task.description && (
                            <div className="mt-1 whitespace-pre-wrap text-xs text-gray-600">{task.description}</div>
                          )}
                          <div className="mt-1 text-xs text-gray-600">Priority: {task.priority}</div>
                          <div className="mt-1 text-xs text-gray-600">Scheduled: {task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : 'N/A'}</div>
                          {task.materials.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs font-medium">Materials</div>
                              <div className="mt-1 divide-y rounded border">
                                {task.materials.map((m) => (
                                  <div key={m.materialId} className="grid grid-cols-4 gap-2 p-1 text-xs">
                                    <div>{m.materialName}</div>
                                    <div>Unit: {m.materialUnit}</div>
                                    <div>Qty/ha: {m.quantityPerHa}</div>
                                    <div>Est: {m.estimatedAmount.toLocaleString()}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};


