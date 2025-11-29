import { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { EmergencyPlansList } from '@/features/production-plans/components';
import { ProductionPlanDetail } from '@/features/production-plans/components';
import { ResolveEmergencyDialog } from '@/features/production-plans/components/resolve-emergency-dialog';

const EmergencyRoute = () => {
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [solvingPlan, setSolvingPlan] = useState<{ id: string; name: string } | null>(null);

    const handleSolveEmergency = (planId: string, planName: string) => {
        setSolvingPlan({ id: planId, name: planName });
    };

    if (selectedPlanId) {
        return (
            <ContentLayout title="Emergency Plan Details">
                <ProductionPlanDetail
                    planId={selectedPlanId}
                    onBack={() => setSelectedPlanId(null)}
                />
            </ContentLayout>
        );
    }

    return (
        <>
            <ContentLayout title="Emergency Plans">
                <EmergencyPlansList
                    onViewPlan={(planId) => setSelectedPlanId(planId)}
                    onSolveEmergency={handleSolveEmergency}
                />
            </ContentLayout>

            {solvingPlan && (
                <ResolveEmergencyDialog
                    isOpen={!!solvingPlan}
                    onClose={() => setSolvingPlan(null)}
                    planId={solvingPlan.id}
                    planName={solvingPlan.name}
                />
            )}
        </>
    );
};

export default EmergencyRoute;
