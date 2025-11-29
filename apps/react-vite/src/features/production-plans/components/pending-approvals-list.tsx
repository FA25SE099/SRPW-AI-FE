import { useState } from 'react';
import { Clock, MapPin, Users, DollarSign, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { usePendingApprovals } from '../api/get-pending-approvals';

type PendingApprovalsListProps = {
  onViewPlan: (planId: string) => void;
  groupId?: string;
  seasonId?: string;
};

export const PendingApprovalsList = ({
  onViewPlan,
  groupId,
  seasonId,
}: PendingApprovalsListProps) => {
  const { data: approvals, isLoading } = usePendingApprovals({
    params: { groupId, seasonId },
  });

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const plans = approvals || [];

  if (plans.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <Clock className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No Pending Approvals</h3>
        <p className="mt-2 text-sm text-gray-600">
          There are currently no production plans waiting for your approval.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pending Approvals</h2>
          <p className="text-sm text-gray-600">{plans.length} plans awaiting review</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.planId}
            className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{plan.planName}</h3>
                <p className="mt-1 text-sm text-gray-600">{plan.groupName}</p>
                <p className="text-xs text-gray-500">
                  Supervisor: {plan.supervisorName}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                <Clock className="h-3 w-3" />
                Pending
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    {plan.totalArea.toFixed(2)} ha
                  </p>
                  <p className="text-xs text-gray-500">{plan.plotCount} plots</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    {plan.estimatedCost.toLocaleString('vi-VN')}
                  </p>
                  <p className="text-xs text-gray-500">VND</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-xs text-gray-500">
                Submitted {new Date(plan.submittedAt).toLocaleString()}
              </p>
              <Button
                size="sm"
                onClick={() => onViewPlan(plan.planId)}
                icon={<Eye className="h-3 w-3" />}
              >
                Review
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

