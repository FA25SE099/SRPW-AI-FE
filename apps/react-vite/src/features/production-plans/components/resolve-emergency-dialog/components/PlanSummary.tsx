import { AlertTriangle } from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';
import { ProductionPlanDetail } from '@/features/production-plans/types';

type PlanSummaryProps = {
  planDetails: ProductionPlanDetail | undefined;
  isLoadingPlan: boolean;
};

export const PlanSummary = ({
  planDetails,
  isLoadingPlan,
}: PlanSummaryProps) => {
  if (isLoadingPlan) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size="md" />
      </div>
    );
  }

  if (!planDetails) return null;

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
      <h3 className="mb-2 flex items-center gap-2 font-semibold text-yellow-900">
        <AlertTriangle className="size-4" />
        Current Emergency Plan
      </h3>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="font-medium text-yellow-700">Plan Name:</dt>
          <dd className="text-gray-900">{planDetails.planName}</dd>
        </div>
        <div>
          <dt className="font-medium text-yellow-700">Total Area:</dt>
          <dd className="text-gray-900">{planDetails.totalArea} ha</dd>
        </div>
        <div>
          <dt className="font-medium text-yellow-700">Cluster:</dt>
          <dd className="text-gray-900">
            {planDetails.clusterName || 'N/A'}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-yellow-700">Estimated Cost:</dt>
          <dd className="text-gray-900">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(planDetails.estimatedTotalCost || 0)}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-yellow-700">Current Stages:</dt>
          <dd className="text-gray-900">{planDetails.stages.length} stages</dd>
        </div>
        <div>
          <dt className="font-medium text-yellow-700">Total Tasks:</dt>
          <dd className="text-gray-900">
            {planDetails.stages.reduce(
              (sum: number, stage: any) => sum + stage.tasks.length,
              0,
            )}{' '}
            tasks
          </dd>
        </div>
        <div>
          <dt className="font-medium text-yellow-700">Plots:</dt>
          <dd className="text-gray-900">
            {planDetails.groupDetails?.plots?.length || 0}{' '}
            plots
          </dd>
        </div>
      </dl>
    </div>
  );
};
