import { useStandardPlanDetail } from '../api/get-standard-plan-detail';
import { SimpleDialog } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Clock, ListChecks, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

type StandardPlanDetailDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
};

export const StandardPlanDetailDialog = ({
  isOpen,
  onClose,
  planId,
}: StandardPlanDetailDialogProps) => {
  const { data: plan, isLoading } = useStandardPlanDetail({
    id: planId,
    queryConfig: { enabled: isOpen && !!planId },
  });

  return (
    <SimpleDialog isOpen={isOpen} onClose={onClose} title="Standard Plan Details" maxWidth="4xl">
      <div className="max-h-[80vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : plan ? (
          <div className="space-y-4 p-1">
            {/* Plan Header */}
            <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 p-4">
              <h2 className="text-lg font-bold text-gray-900">{plan.planName}</h2>
              {plan.description && (
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{plan.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                  <Clock className="h-3 w-3" />
                  {plan.totalDurationDays} days
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700">
                  <ListChecks className="h-3 w-3" />
                  {plan.totalStages} stages
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                  <Calendar className="h-3 w-3" />
                  {plan.totalTasks} tasks
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
                  {plan.totalMaterialTypes} materials
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    plan.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {plan.isActive ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Stages and Tasks */}
            <div className="space-y-3">
              <div className="sticky top-0 bg-white py-2 border-b">
                <h3 className="text-base font-semibold text-gray-900">Cultivation Stages</h3>
                <p className="text-xs text-gray-500">Step-by-step cultivation process</p>
              </div>
              
              {plan.stages.map((stage) => (
                <div key={stage.id} className="rounded-lg border border-blue-200 bg-white shadow-sm">
                  {/* Stage Header */}
                  <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-t-lg border-b">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white shadow">
                      {stage.sequenceOrder}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 break-words">{stage.stageName}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-gray-600">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {stage.expectedDurationDays} days
                        </span>
                        {stage.isMandatory && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                            Mandatory
                          </span>
                        )}
                      </div>
                      {stage.notes && (
                        <p className="mt-1 text-xs text-gray-600 break-words">{stage.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Tasks */}
                  {stage.tasks && stage.tasks.length > 0 && (
                    <div className="p-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Tasks ({stage.tasks.length})
                      </p>
                      <div className="space-y-2">
                        {stage.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start gap-2 rounded-md border border-gray-200 bg-gray-50 p-2.5 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white border border-gray-300 text-xs font-medium text-gray-700">
                              {task.sequenceOrder}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="text-sm font-medium text-gray-900 break-words">{task.taskName}</p>
                                {task.priority && (
                                  <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                                      task.priority === 'High'
                                        ? 'bg-red-100 text-red-700'
                                        : task.priority === 'Medium'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-green-100 text-green-700'
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                )}
                              </div>
                              {task.description && (
                                <p className="mt-1 text-xs text-gray-600 break-words">{task.description}</p>
                              )}
                              {task.taskType && (
                                <p className="mt-1 text-xs text-gray-500">
                                  <span className="font-medium">Type:</span> {task.taskType}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Metadata */}
            <div className="rounded-lg border bg-gray-50 p-3 text-xs">
              <h4 className="font-semibold text-gray-700 mb-2">Plan Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                <div className="break-words">
                  <span className="font-medium text-gray-700">Category:</span> {plan.categoryName}
                </div>
                <div className="break-words">
                  <span className="font-medium text-gray-700">Creator:</span> {plan.creatorName}
                </div>
                <div className="break-words">
                  <span className="font-medium text-gray-700">Created:</span>{' '}
                  {new Date(plan.createdAt).toLocaleDateString()}
                </div>
                <div className="break-words">
                  <span className="font-medium text-gray-700">Last Modified:</span>{' '}
                  {new Date(plan.lastModified).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center">
            <p className="text-gray-500">Plan not found</p>
          </div>
        )}
      </div>
    </SimpleDialog>
  );
};

