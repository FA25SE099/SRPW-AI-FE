import { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { PendingApprovalsList, ProductionPlanDetail } from '@/features/production-plans/components';

const PlanApprovalsRoute = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  return (
    <>
      <ContentLayout title="Pending Approvals">
        <PendingApprovalsList onViewPlan={(planId: string) => setSelectedPlanId(planId)} />
      </ContentLayout>

      {selectedPlanId && (
        <ProductionPlanDetail
          isOpen={true}
          onClose={() => setSelectedPlanId(null)}
          groupId={selectedPlanId}
        />
      )}
    </>
  );
};

export default PlanApprovalsRoute;

