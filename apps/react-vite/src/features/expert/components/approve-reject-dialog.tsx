import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Pencil, XCircle, Package, User, DollarSign, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { UpdateProductionPlanDialog } from '@/features/production-plans/components/update-production-plan-dialog';

import { useApproveRejectPlan } from '../api/approve-reject-plan';
import { usePlanDetail } from '../api/get-plan-detail';
import { usePlanPlotMaterials } from '../api/get-plan-plot-materials';

type ApproveRejectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  farmerName: string;
  cropType: string;
  issue: string;
  onSuccess?: () => void;
};

const approveRejectFormSchema = z.object({
  notes: z.string().max(1000, 'Notes must be less than 1000 characters'),
});

type ApproveRejectFormInput = z.infer<typeof approveRejectFormSchema>;

export const ApproveRejectDialog = ({
  open,
  onOpenChange,
  planId,
  farmerName,
  cropType,
  issue,
  onSuccess,
}: ApproveRejectDialogProps) => {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const {
    data: planDetail,
    isLoading: isLoadingPlan,
    refetch: refetchPlanDetail,
  } = usePlanDetail({
    planId: planId,
    queryConfig: { enabled: open && !!planId },
  });

  const { data: plotMaterialsData, isLoading: isLoadingMaterials } = usePlanPlotMaterials({
    planId: planId || '',
    queryConfig: { enabled: open && !!planId }
  });

  const form = useForm<ApproveRejectFormInput>({
    resolver: zodResolver(approveRejectFormSchema),
    defaultValues: {
      notes: '',
    },
  });

  const { mutate: approveRejectPlan, isPending } = useApproveRejectPlan({
    mutationConfig: {
      onSuccess: () => {
        onSuccess?.();
        onOpenChange(false);
        form.reset();
        setAction(null);
      },
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setAction(null);
    }
  }, [open, form]);

  const handleSubmit = (data: ApproveRejectFormInput) => {
    if (!action) return;

    approveRejectPlan({
      data: {
        planId,
        approved: action === 'approve',
        notes: data.notes,
      },
    });
  };

  const handleApprove = () => {
    setAction('approve');
    form.handleSubmit(handleSubmit)();
  };

  const handleReject = () => {
    const currentNotes = form.getValues('notes');
    if (!currentNotes) {
      setAction('reject');
      return;
    }
    setAction('reject');
    form.handleSubmit(handleSubmit)();
  };

  const handleEditComplete = () => {
    setIsUpdateDialogOpen(false);
    // Refetch the plan details after edit
    refetchPlanDetail();
  };

  const isRejectMode = action === 'reject';

  return (
    <>
      <Dialog
        open={open && !isUpdateDialogOpen}
        onOpenChange={(newOpen) => {
          // Only allow closing if not in edit mode
          if (!isUpdateDialogOpen) {
            onOpenChange(newOpen);
          }
        }}
      >
        <DialogContent className="flex max-h-[90vh] max-w-[1400px] flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {action === 'approve' ? (
                  <>
                    <CheckCircle className="size-5 text-green-600" />
                    Approve Plan
                  </>
                ) : action === 'reject' ? (
                  <>
                    <XCircle className="size-5 text-red-600" />
                    Reject Plan
                  </>
                ) : (
                  'Review Plan'
                )}
              </DialogTitle>
              {action === null && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsUpdateDialogOpen(true)}
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
              )}
            </div>
            <DialogDescription>
              {action === null
                ? 'Review the plan details and select an action'
                : action === 'approve'
                  ? 'Are you sure you want to approve this plan?'
                  : 'Please provide a reason for rejection (required)'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              {action === null && (
                <>
                  {(isLoadingPlan || isLoadingMaterials) && (
                    <div className="flex items-center justify-center p-8">
                      <Spinner size="lg" />
                    </div>
                  )}

                  {planDetail && (
                    <>
                      <div className="rounded border p-4 bg-white">
                        <div className="text-lg font-semibold">{planDetail.planName}</div>
                        <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                          <div>Status: <span className="font-medium">{planDetail.status}</span></div>
                          <div>Total Area: <span className="font-medium">{planDetail.totalArea} ha</span></div>
                          <div>Planting Date: <span className="font-medium">{new Date(planDetail.basePlantingDate).toLocaleDateString()}</span></div>
                          <div>Est. Cost: <span className="font-medium">{planDetail.estimatedTotalPlanCost.toLocaleString('vi-VN')} VND</span></div>
                        </div>
                      </div>

                      {plotMaterialsData && (
                        <div className="rounded border p-4 bg-white">
                          <div className="mb-3 flex items-center gap-2 text-base font-semibold">
                            <Package className="h-5 w-5" />
                            Individual Plots ({plotMaterialsData.plots?.length || 0})
                          </div>
                          {plotMaterialsData.plots && plotMaterialsData.plots.length > 0 ? (
                            <div className="space-y-4">
                              {plotMaterialsData.plots.map((plot) => {
                                const plotMaterials = plot.materials || [];
                                const plotTotalCost = plot.totalEstimatedCost || 0;

                                return (
                                  <div key={plot.plotId} className="rounded border-2 p-5 bg-gradient-to-br from-gray-50 to-white shadow-sm">
                                    <div className="mb-4 grid grid-cols-2 gap-6">
                                      <div className="bg-white rounded-lg border p-4 shadow-sm">
                                        <div className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-3">
                                          <User className="h-5 w-5 text-blue-600" />
                                          Plot Information
                                        </div>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Owner:</span>
                                            <span className="font-semibold text-gray-900">{plot.farmerName}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Area:</span>
                                            <span className="font-semibold text-gray-900">{plot.plotArea} ha</span>
                                          </div>
                                          {plot.soThua && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Số thửa:</span>
                                              <span className="font-semibold text-gray-900">{plot.soThua}</span>
                                            </div>
                                          )}
                                          {plot.soTo && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Số tờ:</span>
                                              <span className="font-semibold text-gray-900">{plot.soTo}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-200 p-4 shadow-sm">
                                        <div className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-3">
                                          <DollarSign className="h-5 w-5 text-green-600" />
                                          Cost Summary
                                        </div>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Total Materials Cost:</span>
                                            <span className="font-bold text-green-700 text-lg">{plotTotalCost.toLocaleString('vi-VN')} VND</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Cost per Hectare:</span>
                                            <span className="font-semibold text-green-600">{(plotTotalCost / plot.plotArea).toLocaleString('vi-VN')} VND/ha</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {plotMaterials.length > 0 && (
                                      <div className="mt-3">
                                        <div className="mb-2 text-sm font-medium text-gray-700">Materials Required</div>
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-sm border-collapse bg-white rounded">
                                            <thead>
                                              <tr className="bg-gray-200 border-b-2 border-gray-300">
                                                <th className="text-left p-3 font-semibold">Material Name</th>
                                                <th className="text-center p-3 font-semibold">Image</th>
                                                <th className="text-right p-3 font-semibold">Qty/ha</th>
                                                <th className="text-right p-3 font-semibold">Total Qty</th>
                                                <th className="text-center p-3 font-semibold">Unit</th>
                                                <th className="text-right p-3 font-semibold">Price/Unit (VND)</th>
                                                <th className="text-right p-3 font-semibold">Total Cost (VND)</th>
                                                <th className="text-center p-3 font-semibold">Price Valid Period</th>
                                                <th className="text-center p-3 font-semibold">Status</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {plotMaterials.map((material) => (
                                                <tr
                                                  key={material.materialId}
                                                  className={`border-b hover:bg-gray-50 transition-colors ${material.isOutdated ? 'bg-yellow-50' : ''}`}
                                                >
                                                  <td className="p-3 font-medium">{material.materialName}</td>
                                                  <td className="p-3 text-center">
                                                    {material.imgUrl ? (
                                                      <img
                                                        src={material.imgUrl}
                                                        alt={material.materialName}
                                                        className="w-12 h-12 object-cover rounded mx-auto"
                                                      />
                                                    ) : (
                                                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mx-auto">
                                                        <Package className="h-6 w-6 text-gray-400" />
                                                      </div>
                                                    )}
                                                  </td>
                                                  <td className="p-3 text-right">{material.quantityPerHa.toFixed(2)}</td>
                                                  <td className="p-3 text-right font-medium">{material.totalQuantity.toFixed(2)}</td>
                                                  <td className="p-3 text-center">
                                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                      {material.materialUnit}
                                                    </span>
                                                  </td>
                                                  <td className="p-3 text-right">
                                                    {material.pricePerUnit.toLocaleString('vi-VN')}
                                                  </td>
                                                  <td className="p-3 text-right font-semibold text-green-700">
                                                    {material.totalCost.toLocaleString('vi-VN')}
                                                  </td>
                                                  <td className="p-3">
                                                    <div className="flex flex-col gap-1 text-xs">
                                                      <div className="flex items-center justify-center gap-1">
                                                        <Calendar className="h-3 w-3 text-green-600" />
                                                        <span className="font-medium">From:</span>
                                                        <span>{new Date(material.priceValidFrom).toLocaleDateString()}</span>
                                                      </div>
                                                      {material.priceValidTo && (
                                                        <div className="flex items-center justify-center gap-1 text-orange-600">
                                                          <Calendar className="h-3 w-3" />
                                                          <span className="font-medium">To:</span>
                                                          <span>{new Date(material.priceValidTo).toLocaleDateString()}</span>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </td>
                                                  <td className="p-3 text-center">
                                                    {material.isOutdated ? (
                                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                                        Outdated
                                                      </span>
                                                    ) : (
                                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                        Current
                                                      </span>
                                                    )}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                            <tfoot>
                                              <tr className="bg-gray-100 border-t-2 border-gray-300">
                                                <td colSpan={6} className="p-3 text-right font-bold">Plot Total Cost:</td>
                                                <td className="p-3 text-right font-bold text-green-700 text-lg">
                                                  {plotTotalCost.toLocaleString('vi-VN')}
                                                </td>
                                                <td colSpan={2}></td>
                                              </tr>
                                            </tfoot>
                                          </table>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              No plots available for this plan
                            </div>
                          )}
                        </div>
                      )}

                      <div className="rounded border p-4 bg-white">
                        <div className="mb-2 text-base font-semibold">Stages & Tasks</div>
                        <div className="space-y-3">
                          {planDetail.stages.map((stage) => (
                            <div key={stage.id} className="rounded border p-3 bg-gray-50">
                              <div className="font-medium">{stage.sequenceOrder}. {stage.stageName}</div>
                              <div className="text-xs text-gray-600 mt-1">Duration: {stage.typicalDurationDays} days</div>
                              <div className="mt-2 space-y-2">
                                {stage.tasks.map((task) => (
                                  <div key={task.id} className="rounded border p-2 bg-white">
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
                                            <div key={m.materialId} className="grid grid-cols-5 gap-2 p-1 text-xs">
                                              <div>{m.materialName}</div>
                                              <div>Unit: {m.materialUnit}</div>
                                              <div>Qty/ha: {m.quantityPerHa}</div>
                                              <div>Est: {m.estimatedAmount.toLocaleString()}</div>
                                              <div className="text-gray-500">
                                                {m.priceValidFrom && `Valid: ${new Date(m.priceValidFrom).toLocaleDateString()}`}
                                              </div>
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
                    </>
                  )}
                </>
              )}

              {action !== null && (
                <FormProvider {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {action === 'reject'
                              ? 'Rejection Notes *'
                              : 'Notes (Optional)'}
                          </FormLabel>
                          <FormControl>
                            <textarea
                              {...field}
                              placeholder={
                                action === 'reject'
                                  ? 'Please explain why this plan is being rejected...'
                                  : 'Add any comments or notes...'
                              }
                              rows={4}
                              required={action === 'reject'}
                              disabled={action === null || isPending}
                              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </FormControl>
                          {action !== null && (
                            <FormDescription>
                              {action === 'reject'
                                ? 'Rejection notes are required'
                                : 'Optional notes about this approval'}
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </FormProvider>
              )}
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 sm:flex-row">
            {action === null ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAction('reject')}
                  disabled={isPending}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  onClick={() => setAction('approve')}
                  disabled={isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAction(null)}
                  disabled={isPending}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={isRejectMode ? handleReject : handleApprove}
                  disabled={
                    isPending || (isRejectMode && !form.getValues('notes'))
                  }
                  className={
                    isRejectMode
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }
                >
                  {isPending
                    ? 'Processing...'
                    : isRejectMode
                      ? 'Confirm Rejection'
                      : 'Confirm Approval'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpdateProductionPlanDialog
        isOpen={isUpdateDialogOpen}
        onClose={handleEditComplete}
        planId={planId}
      />
    </>
  );
};