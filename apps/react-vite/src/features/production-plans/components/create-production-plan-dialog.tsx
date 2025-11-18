import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SimpleDialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';
import { useProductionPlanDraft } from '../api/get-production-plan-draft';
import { useCreateProductionPlan, CreateProductionPlanDTO } from '../api/create-production-plan';
import { useStandardPlans } from '@/features/standard-plans/api/get-standard-plans';
import {
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Package,
  FileText
} from 'lucide-react';

type CreateProductionPlanDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  seasonId?: string;
};

type FormData = {
  standardPlanId: string;
  basePlantingDate: string;
  planName: string;
};

export const CreateProductionPlanDialog = ({
  isOpen,
  onClose,
  groupId,
  groupName,
}: CreateProductionPlanDialogProps) => {
  const [showDraft, setShowDraft] = useState(false);
  const [draftParams, setDraftParams] = useState<FormData | null>(null);
  const { addNotification } = useNotifications();

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormData>();
  const standardPlanId = watch('standardPlanId');
  const basePlantingDate = watch('basePlantingDate');

  // Fetch standard plans
  const { data: standardPlansData, isLoading: isLoadingPlans } = useStandardPlans({
    params: { isActive: true },
  });

  // Fetch draft preview
  const { data: draft, isLoading: isDraftLoading, error: draftError } = useProductionPlanDraft({
    params: {
      standardPlanId: draftParams?.standardPlanId || '',
      groupId,
      basePlantingDate: draftParams?.basePlantingDate || '',
    },
    queryConfig: {
      enabled: showDraft && !!draftParams,
    },
  });

  const createPlanMutation = useCreateProductionPlan({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Production plan created successfully',
        });
        handleClose();
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Error',
          message: error.message || 'Failed to create production plan',
        });
      },
    },
  });

  const handlePreviewDraft = (data: FormData) => {
    setDraftParams(data);
    setShowDraft(true);
  };

  const handleCreatePlan = () => {
    if (!draftParams || !draft) return;

    // Transform draft data to match API requirements
    const createData: CreateProductionPlanDTO = {
      groupId,
      standardPlanId: draftParams.standardPlanId,
      planName: draftParams.planName || draft.planName,
      basePlantingDate: draftParams.basePlantingDate,
      totalArea: draft.totalArea,
      stages: draft.stages.map(stage => ({
        stageName: stage.stageName,
        sequenceOrder: stage.sequenceOrder,
        description: stage.description,
        typicalDurationDays: stage.typicalDurationDays || 0,
        colorCode: stage.colorCode,
        tasks: (stage.tasks || []).map(task => {
          const scheduledDate = task.scheduledDate;
          const scheduledEndDate = task.scheduledEndDate &&
            new Date(task.scheduledEndDate) >= new Date(scheduledDate)
            ? task.scheduledEndDate
            : scheduledDate; // Use scheduledDate as end date if not provided or invalid

          return {
            taskName: task.taskName,
            description: task.description,
            taskType: task.taskType,
            scheduledDate,
            scheduledEndDate,
            priority: task.priority || 'Low',
            sequenceOrder: task.sequenceOrder || 0,
            materials: (task.materials || []).map(material => ({
              materialId: material.materialId,
              quantityPerHa: material.quantityPerHa,
            })),
          };
        }),
      })),
    };

    createPlanMutation.mutate(createData);
  };

  const handleClose = () => {
    reset();
    setShowDraft(false);
    setDraftParams(null);
    onClose();
  };

  const standardPlans = standardPlansData || [];

  return (
    <SimpleDialog
      isOpen={isOpen}
      onClose={handleClose}
      title={showDraft ? 'Review Production Plan' : 'Create Production Plan'}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Step 1: Input Form */}
        {!showDraft && (
          <form onSubmit={handleSubmit(handlePreviewDraft)} className="space-y-4">
            <div className="rounded-lg border bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Group: {groupName}</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Create a production plan from a standard template. The system will calculate costs based on current material prices.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Standard Plan Template *
                </label>
                {isLoadingPlans ? (
                  <div className="flex items-center justify-center p-4">
                    <Spinner size="sm" />
                  </div>
                ) : (
                  <select
                    {...register('standardPlanId', { required: 'Standard plan is required' })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Select a standard plan...</option>
                    {standardPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - {plan.estimatedDurationDays} days
                      </option>
                    ))}
                  </select>
                )}
                {errors.standardPlanId && (
                  <p className="text-sm text-red-600">{errors.standardPlanId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Base Planting Date *
                </label>
                <input
                  type="date"
                  {...register('basePlantingDate', { required: 'Planting date is required' })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
                {errors.basePlantingDate && (
                  <p className="text-sm text-red-600">{errors.basePlantingDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Plan Name (Optional)
                </label>
                <input
                  type="text"
                  {...register('planName')}
                  placeholder="Leave empty to auto-generate"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500">
                  If not provided, system will generate a name automatically
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!standardPlanId || !basePlantingDate}
                icon={<Calendar className="h-4 w-4" />}
              >
                Preview Plan
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Draft Preview */}
        {showDraft && (
          <>
            {isDraftLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : draft ? (
              <div className="space-y-4">
                {/* Price Warnings */}
                {draft.hasPriceWarnings && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900">Price Warnings</h4>
                        <p className="text-sm text-yellow-800 mt-1">
                          Some materials have outdated prices. The cost estimates may not be accurate.
                        </p>
                        <ul className="mt-2 space-y-1">
                          {draft.priceWarnings.map((warning, index) => (
                            <li key={index} className="text-sm text-yellow-700">
                              • {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border bg-green-50 p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Estimated Cost</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-green-900">
                      {draft.estimatedTotalPlanCost.toLocaleString('vi-VN')}
                    </p>
                    <p className="text-xs text-green-700">VND</p>
                  </div>

                  <div className="rounded-lg border bg-blue-50 p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Total Area</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-blue-900">
                      {draft.totalArea.toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-700">hectares</p>
                  </div>

                  <div className="rounded-lg border bg-purple-50 p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Stages</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-purple-900">
                      {draft.stages.length}
                    </p>
                    <p className="text-xs text-purple-700">
                      {draft.stages.reduce((sum, s) => sum + (s.tasks?.length || 0), 0)} tasks total
                    </p>
                  </div>
                </div>

                {/* Plan Details */}
                <div className="rounded-lg border bg-gray-50 p-4">
                  <h4 className="font-semibold text-gray-900">{draft.planName}</h4>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    <div>
                      <span className="font-medium text-gray-700">Group:</span>{' '}
                      <span className="text-gray-900">{groupName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Planting Date:</span>{' '}
                      <span className="text-gray-900">
                        {new Date(draft.basePlantingDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stages Overview */}
                <div className="max-h-[400px] overflow-y-auto rounded-lg border">
                  <div className="p-4 space-y-3">
                    <h4 className="font-semibold text-gray-900 sticky top-0 bg-white pb-2 z-10">
                      Stages & Tasks
                    </h4>
                    {draft.stages.map((stage, idx) => (
                      <div key={idx} className="rounded-lg border bg-white p-3">
                        <div className="font-medium text-gray-900">
                          {stage.sequenceOrder}. {stage.stageName}
                        </div>
                        {stage.tasks && stage.tasks.length > 0 ? (
                          <div className="mt-2 space-y-2">
                            {stage.tasks.map((task, taskIdx) => (
                              <div key={taskIdx} className="text-sm pl-4 border-l-2 border-gray-200">
                                <div className="font-medium text-gray-700">{task.taskName}</div>
                                <div className="text-gray-500">
                                  Day {task.daysAfter} • {task.taskType}
                                </div>
                                {task.materials && task.materials.length > 0 && (
                                  <div className="mt-1 text-xs text-gray-600 break-words">
                                    Materials: {task.materials.map(m => m.materialName).join(', ')}
                                    {task.materials.some(m => m.hasPriceWarning) && (
                                      <span className="ml-2 text-yellow-600">⚠️</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-gray-500 italic">No tasks defined for this stage</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowDraft(false)}
                    disabled={createPlanMutation.isPending}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreatePlan}
                    disabled={createPlanMutation.isPending}
                    icon={createPlanMutation.isPending ? <Spinner size="sm" /> : <CheckCircle className="h-4 w-4" />}
                  >
                    {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-2">
                <p className="text-gray-500">Unable to generate draft preview</p>
                {draftError && (
                  <p className="text-sm text-red-600">
                    Error: {(draftError as Error).message || 'Unknown error'}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </SimpleDialog>
  );
};

