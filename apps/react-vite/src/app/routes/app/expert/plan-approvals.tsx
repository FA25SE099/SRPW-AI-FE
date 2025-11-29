import { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { PendingApprovalsList, ProductionPlanDetail } from '@/features/production-plans/components';

const PlanApprovalsRoute = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  if (selectedPlanId) {
    return (
      <ContentLayout title="Review Production Plan">
        <ProductionPlanDetail
          planId={selectedPlanId}
          onBack={() => setSelectedPlanId(null)}
        />
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Pending Approvals">
      <PendingApprovalsList onViewPlan={(planId) => setSelectedPlanId(planId)} />
    </ContentLayout>
  );
};

export default PlanApprovalsRoute;

