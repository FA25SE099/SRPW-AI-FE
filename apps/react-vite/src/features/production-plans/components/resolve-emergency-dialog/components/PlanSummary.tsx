import { AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { ProductionPlan } from '@/features/production-plans/types';

type PlanSummaryProps = {
    planDetails: ProductionPlan | undefined;
    isLoadingPlan: boolean;
};

export const PlanSummary = ({ planDetails, isLoadingPlan }: PlanSummaryProps) => {
    if (isLoadingPlan) {
        return (
            <div className="flex justify-center py-4">
                <Spinner size="md" />
            </div>
        );
    }

    if (!planDetails) return null;

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Current Emergency Plan
            </h3>
            <dl className="space-y-2 text-sm">
                <div>
                    <dt className="text-yellow-700 font-medium">Plan Name:</dt>
                    <dd className="text-gray-900">{planDetails.planName}</dd>
                </div>
                <div>
                    <dt className="text-yellow-700 font-medium">Total Area:</dt>
                    <dd className="text-gray-900">{planDetails.totalArea} ha</dd>
                </div>
                <div>
                    <dt className="text-yellow-700 font-medium">Cluster:</dt>
                    <dd className="text-gray-900">{planDetails.groupDetails.clusterName}</dd>
                </div>
                <div>
                    <dt className="text-yellow-700 font-medium">Estimated Cost:</dt>
                    <dd className="text-gray-900">
                        {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                        }).format(planDetails.estimatedTotalCost)}
                    </dd>
                </div>
                <div>
                    <dt className="text-yellow-700 font-medium">Current Stages:</dt>
                    <dd className="text-gray-900">{planDetails.stages.length} stages</dd>
                </div>
                <div>
                    <dt className="text-yellow-700 font-medium">Total Tasks:</dt>
                    <dd className="text-gray-900">
                        {planDetails.stages.reduce((sum, stage) => sum + stage.tasks.length, 0)} tasks
                    </dd>
                </div>
                <div>
                    <dt className="text-yellow-700 font-medium">Plots:</dt>
                    <dd className="text-gray-900">{planDetails.groupDetails.plots.length} plots</dd>
                </div>
            </dl>
        </div>
    );
};

