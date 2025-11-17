import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notifications';
import { useSubmitProductionPlan } from '../api/submit-production-plan';
import { SimpleDialog } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Send, AlertCircle } from 'lucide-react';

type SubmitPlanButtonProps = {
  planId: string;
  planName: string;
  supervisorId: string;
  disabled?: boolean;
  onSuccess?: () => void;
};

export const SubmitPlanButton = ({
  planId,
  planName,
  supervisorId,
  disabled,
  onSuccess,
}: SubmitPlanButtonProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { addNotification } = useNotifications();

  const submitMutation = useSubmitProductionPlan({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Plan Submitted',
          message: 'Production plan has been submitted for expert approval',
        });
        setShowConfirmDialog(false);
        onSuccess?.();
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Submission Failed',
          message: error.message || 'Failed to submit production plan',
        });
      },
    },
  });

  const handleSubmit = () => {
    submitMutation.mutate({
      planId,
      supervisorId,
    });
  };

  return (
    <>
      <Button
        onClick={() => setShowConfirmDialog(true)}
        disabled={disabled || submitMutation.isPending}
        icon={<Send className="h-4 w-4" />}
      >
        Submit for Approval
      </Button>

      <SimpleDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Submit Production Plan"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900">Confirm Submission</h4>
                <p className="text-sm text-blue-800 mt-1">
                  You are about to submit <span className="font-medium">{planName}</span> for expert approval.
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  Once submitted, you will not be able to edit the plan unless it is rejected by the expert.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={submitMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              icon={submitMutation.isPending ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Plan'}
            </Button>
          </div>
        </div>
      </SimpleDialog>
    </>
  );
};

