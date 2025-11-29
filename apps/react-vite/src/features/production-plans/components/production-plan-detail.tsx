import { useState } from 'react';
import {
  Calendar,
  DollarSign,
  Package,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  TrendingUp,
  MapPin,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';
import { useUser } from '@/lib/auth';
import { ROLES } from '@/lib/authorization';
import { useProductionPlan } from '../api/get-production-plan';
import { useSubmitProductionPlan } from '../api/submit-production-plan';
import { useApproveRejectProductionPlan } from '../api/approve-reject-production-plan';
import { useExecutionSummary } from '../api/get-execution-summary';

type ProductionPlanDetailProps = {
  planId: string;
  onBack?: () => void;
};

export const ProductionPlanDetail = ({ planId, onBack }: ProductionPlanDetailProps) => {
  const { addNotification } = useNotifications();
  const user = useUser();
  const [comments, setComments] = useState('');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  const { data: plan, isLoading } = useProductionPlan({ planId });
  const { data: executionSummary, isLoading: isLoadingExecution } = useExecutionSummary({
    planId,
    queryConfig: {
      enabled: plan?.status === 'Approved',
    },
  });

  const submitMutation = useSubmitProductionPlan({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Production plan submitted for approval',
        });
      },
    },
  });

  const approveRejectMutation = useApproveRejectProductionPlan({
    mutationConfig: {
      onSuccess: (_, variables) => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: variables.isApproved
            ? 'Production plan approved successfully'
            : 'Production plan rejected',
        });
        setShowApprovalDialog(false);
        setComments('');
      },
    },
  });

  const handleSubmit = () => {
    if (!plan || !user.data?.id) return;
    submitMutation.mutate({
      planId: plan.planId,
      supervisorId: user.data.id,
    });
  };

  const handleApproveReject = (isApproved: boolean) => {
    if (!plan) return;
    approveRejectMutation.mutate({
      planId: plan.planId,
      isApproved,
      comments: comments || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Production plan not found</p>
      </div>
    );
  }

  const isSupervisor = user.data?.role === ROLES.Supervisor;
  const isExpert = user.data?.role === ROLES.AgronomyExpert;
  const canSubmit = isSupervisor && plan.status === 'Draft';
  const canApprove = isExpert && plan.status === 'Pending';
  const isApproved = plan.status === 'Approved';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{plan.planName}</h1>
          <p className="mt-1 text-sm text-gray-600">{plan.groupName}</p>
        </div>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          {canSubmit && (
            <Button
              onClick={handleSubmit}
              isLoading={submitMutation.isPending}
              icon={<Send className="h-4 w-4" />}
            >
              Submit for Approval
            </Button>
          )}
          {canApprove && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setShowApprovalDialog(true);
                }}
                icon={<XCircle className="h-4 w-4" />}
              >
                Reject
              </Button>
              <Button
                onClick={() => {
                  setShowApprovalDialog(true);
                }}
                icon={<CheckCircle className="h-4 w-4" />}
              >
                Approve
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
            plan.status === 'Draft'
              ? 'bg-gray-100 text-gray-700'
              : plan.status === 'Pending'
              ? 'bg-yellow-100 text-yellow-700'
              : plan.status === 'Approved'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {plan.status === 'Draft' && <Clock className="h-4 w-4" />}
          {plan.status === 'Pending' && <Send className="h-4 w-4" />}
          {plan.status === 'Approved' && <CheckCircle className="h-4 w-4" />}
          {plan.status === 'Rejected' && <XCircle className="h-4 w-4" />}
          {plan.status}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>Estimated Cost</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {plan.estimatedTotalCost.toLocaleString('vi-VN')}
          </p>
          <p className="text-xs text-gray-500">VND</p>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="h-4 w-4" />
            <span>Total Area</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {plan.totalArea.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">hectares</p>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Planting Date</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            {new Date(plan.basePlantingDate).toLocaleDateString()}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Duration</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {plan.stages.reduce((sum, s) => sum + s.expectedDurationDays, 0)}
          </p>
          <p className="text-xs text-gray-500">days</p>
        </div>
      </div>

      {/* Execution Summary (for approved plans) */}
      {isApproved && executionSummary && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Execution Summary</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Users className="h-4 w-4" />
                <span>Plots / Farmers</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-blue-900">
                {executionSummary.plotCount} / {executionSummary.farmerCount}
              </p>
            </div>

            <div className="rounded-lg border bg-green-50 p-4">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span>Tasks Completed</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-green-900">
                {executionSummary.tasksCompleted} / {executionSummary.totalTasksCreated}
              </p>
              <p className="text-xs text-green-700">
                {executionSummary.completionPercentage.toFixed(1)}% complete
              </p>
            </div>

            <div className="rounded-lg border bg-yellow-50 p-4">
              <div className="flex items-center gap-2 text-sm text-yellow-700">
                <Clock className="h-4 w-4" />
                <span>In Progress</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-yellow-900">
                {executionSummary.tasksInProgress}
              </p>
            </div>

            <div className="rounded-lg border bg-purple-50 p-4">
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <DollarSign className="h-4 w-4" />
                <span>Actual Cost</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-purple-900">
                {executionSummary.actualCost.toLocaleString('vi-VN')}
              </p>
              <p className="text-xs text-purple-700">
                / {executionSummary.estimatedCost.toLocaleString('vi-VN')} VND
              </p>
            </div>
          </div>

          {/* Plot Progress */}
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Plot Progress</h3>
            <div className="space-y-3">
              {executionSummary.plotSummaries.map((plot) => (
                <div
                  key={plot.plotId}
                  className="flex items-center justify-between rounded-lg border bg-gray-50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{plot.plotName}</p>
                      <p className="text-sm text-gray-600">
                        {plot.farmerName} • {plot.plotArea.toFixed(2)} ha
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {plot.completedTasks} / {plot.taskCount} tasks
                      </p>
                      <p className="text-xs text-gray-500">
                        {plot.completionRate.toFixed(1)}% complete
                      </p>
                    </div>
                    <div className="h-12 w-24 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${plot.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stages & Tasks */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Stages & Tasks</h2>
        <div className="space-y-4">
          {plan.stages.map((stage, idx) => (
            <div key={idx} className="rounded-lg border bg-gray-50 p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900">
                  {stage.sequenceOrder}. {stage.stageName}
                </h3>
                <p className="text-sm text-gray-600">
                  Duration: {stage.expectedDurationDays} days
                  {stage.isMandatory && (
                    <span className="ml-2 text-xs text-red-600">(Mandatory)</span>
                  )}
                </p>
                {stage.notes && (
                  <p className="mt-1 text-sm text-gray-500">{stage.notes}</p>
                )}
              </div>

              <div className="space-y-2">
                {stage.tasks.map((task, taskIdx) => (
                  <div
                    key={taskIdx}
                    className="rounded-md border border-gray-200 bg-white p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{task.taskName}</h4>
                        <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                          <span className="rounded bg-blue-100 px-2 py-1 text-blue-700">
                            Day {task.daysAfter}
                          </span>
                          <span className="rounded bg-purple-100 px-2 py-1 text-purple-700">
                            {task.taskType}
                          </span>
                          <span className="rounded bg-green-100 px-2 py-1 text-green-700">
                            {task.priority}
                          </span>
                        </div>

                        {task.materials && task.materials.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700">Materials:</p>
                            <ul className="mt-1 space-y-1">
                              {task.materials.map((material, matIdx) => (
                                <li key={matIdx} className="text-xs text-gray-600">
                                  • {material.materialName}: {material.quantityPerHa} {material.unit}/ha
                                  {material.estimatedAmount && (
                                    <span className="ml-2 text-gray-500">
                                      (Total: {material.estimatedAmount.toLocaleString('vi-VN')} VND)
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Approval Dialog */}
      {showApprovalDialog && canApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Approve/Reject Production Plan
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Comments
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Add comments (optional)..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApprovalDialog(false);
                    setComments('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleApproveReject(false)}
                  isLoading={approveRejectMutation.isPending}
                  icon={<XCircle className="h-4 w-4" />}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproveReject(true)}
                  isLoading={approveRejectMutation.isPending}
                  icon={<CheckCircle className="h-4 w-4" />}
                >
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

