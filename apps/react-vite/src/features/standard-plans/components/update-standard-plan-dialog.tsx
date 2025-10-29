import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

import { useUpdateStandardPlan } from '../api/update-standard-plan';
import { StandardPlan } from '@/types/api';
import { Button } from '@/components/ui/button';
import { SimpleDialog } from '@/components/ui/dialog';

type UpdateStandardPlanDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  plan: StandardPlan | null;
};

export const UpdateStandardPlanDialog = ({
  isOpen,
  onClose,
  plan,
}: UpdateStandardPlanDialogProps) => {
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [totalDurationDays, setTotalDurationDays] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (plan) {
      setPlanName(plan.name);
      setDescription(plan.description || '');
      setTotalDurationDays(plan.totalDuration);
      setIsActive(plan.isActive);
    }
  }, [plan]);

  const updateMutation = useUpdateStandardPlan({
    mutationConfig: {
      onSuccess: () => {
        onClose();
      },
    },
  });

  const handleUpdate = () => {
    if (!plan || !planName || totalDurationDays <= 0) return;

    updateMutation.mutate({
      standardPlanId: plan.id,
      planName,
      description: description || undefined,
      totalDurationDays,
      isActive,
    });
  };

  const isLoading = updateMutation.isPending;

  return (
    <SimpleDialog isOpen={isOpen} onClose={onClose} title="Update Standard Plan" maxWidth="2xl">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Update the standard plan information. Note: This will not modify the stages and tasks.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Plan Name *
            </label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="e.g., Kế hoạch canh tác giống ngắn ngày"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Plan description and notes..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Total Duration (Days) *
            </label>
            <input
              type="number"
              min="1"
              value={totalDurationDays}
              onChange={(e) => setTotalDurationDays(Number(e.target.value))}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="e.g., 95"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!planName || totalDurationDays <= 0 || isLoading}
            isLoading={isLoading}
            icon={<Save className="h-4 w-4" />}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </SimpleDialog>
  );
};

