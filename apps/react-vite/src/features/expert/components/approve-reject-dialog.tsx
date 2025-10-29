import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useApproveRejectPlan } from '../api/approve-reject-plan';

type ApproveRejectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  farmerName: string;
  cropType: string;
  issue: string;
  onSuccess?: () => void;
};

const approveRejectFormSchema = z.object({
  notes: z.string().max(1000, 'Notes must be less than 1000 characters'),
});

type ApproveRejectFormInput = z.infer<typeof approveRejectFormSchema>;

export const ApproveRejectDialog = ({
  open,
  onOpenChange,
  planId,
  farmerName,
  cropType,
  issue,
  onSuccess,
}: ApproveRejectDialogProps) => {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const form = useForm<ApproveRejectFormInput>({
    resolver: zodResolver(approveRejectFormSchema),
    defaultValues: {
      notes: '',
    },
  });

  const { mutate: approveRejectPlan, isPending } = useApproveRejectPlan({
    mutationConfig: {
      onSuccess: () => {
        onSuccess?.();
        onOpenChange(false);
        form.reset();
        setAction(null);
      },
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setAction(null);
    }
  }, [open, form]);

  const handleSubmit = (data: ApproveRejectFormInput) => {
    if (!action) return;

    approveRejectPlan({
      data: {
        planId,
        approved: action === 'approve',
        notes: data.notes,
      },
    });
  };

  const handleApprove = () => {
    setAction('approve');
    form.handleSubmit(handleSubmit)();
  };

  const handleReject = () => {
    const currentNotes = form.getValues('notes');
    // If submitting without opening reject mode, validate notes
    if (!currentNotes) {
      setAction('reject');
      return;
    }
    setAction('reject');
    form.handleSubmit(handleSubmit)();
  };

  const isRejectMode = action === 'reject';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === 'approve' ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Approve Plan
              </>
            ) : action === 'reject' ? (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                Reject Plan
              </>
            ) : (
              'Review Plan'
            )}
          </DialogTitle>
          <DialogDescription>
            {action === null
              ? 'Select an action for this plan'
              : action === 'approve'
                ? 'Are you sure you want to approve this plan?'
                : 'Please provide a reason for rejection (required)'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Farmer:</span>{' '}
                <span className="text-sm">{farmerName}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Crop:</span>{' '}
                <span className="text-sm">{cropType}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Issue:</span>{' '}
                <span className="text-sm">{issue}</span>
              </div>
            </div>
          </div>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {action === 'reject' ? 'Rejection Notes' : 'Notes (Optional)'}
                    </FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        placeholder={
                          action === 'reject'
                            ? 'Please explain why this plan is being rejected...'
                            : 'Add any comments or notes...'
                        }
                        rows={4}
                        required={action === 'reject'}
                        disabled={action === null || isPending}
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </FormControl>
                    {action !== null && (
                      <FormDescription>
                        {action === 'reject'
                          ? 'Rejection notes are required'
                          : 'Optional notes about this approval'}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </FormProvider>
        </div>

        <DialogFooter className="flex-row gap-2 sm:flex-row">
          {action === null ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAction('reject')}
                disabled={isPending}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Reject
              </Button>
              <Button
                type="button"
                onClick={() => setAction('approve')}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAction(null)}
                disabled={isPending}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={isRejectMode ? handleReject : handleApprove}
                disabled={isPending || (isRejectMode && !form.getValues('notes'))}
                className={
                  isRejectMode
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }
              >
                {isPending
                  ? 'Processing...'
                  : isRejectMode
                    ? 'Confirm Rejection'
                    : 'Confirm Approval'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

