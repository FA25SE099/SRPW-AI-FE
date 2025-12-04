import { UserPlus } from 'lucide-react';
import { useCreateFarmer, createFarmerInputSchema } from '../api/create-farmer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form/form';
import { Input } from '@/components/ui/form/input';
import { useNotifications } from '@/components/ui/notifications';

type CreateFarmerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CreateFarmerDialog = ({ open, onOpenChange }: CreateFarmerDialogProps) => {
  const { addNotification } = useNotifications();

  const createMutation = useCreateFarmer({
    mutationConfig: {
      onSuccess: (data) => {
        addNotification({
          type: 'success',
          title: 'Farmer Created',
          message: `Successfully created farmer: ${data.fullName}`,
        });
        onOpenChange(false);
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: error.message || 'Failed to create farmer',
        });
      },
    },
  });

  const handleClose = () => {
    if (!createMutation.isPending) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Farmer</DialogTitle>
          <DialogDescription>
            Add a new farmer to your cluster by filling out the information below
          </DialogDescription>
        </DialogHeader>

        <Form
          onSubmit={async (values) => {
            createMutation.mutate({
              ...values,
              isVerified: false,
            });
          }}
          schema={createFarmerInputSchema}
        >
          {({ register, formState }) => (
            <>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="Enter farmer's full name"
                  error={formState.errors['fullName']}
                  registration={register('fullName')}
                />

                <Input
                  label="Phone Number"
                  placeholder="Enter phone number (e.g., 0901234567)"
                  error={formState.errors['phoneNumber']}
                  registration={register('phoneNumber')}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter email address (optional)"
                  error={formState.errors['email']}
                  registration={register('email')}
                />

                <Input
                  label="Farm Code"
                  placeholder="Enter farm code (e.g., FARM001)"
                  error={formState.errors['farmCode']}
                  registration={register('farmCode')}
                />

                <Input
                  label="Address"
                  placeholder="Enter full address"
                  error={formState.errors['address']}
                  registration={register('address')}
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  isLoading={createMutation.isPending}
                  icon={<UserPlus className="size-4" />}
                  className="gap-2"
                >
                  Create Farmer
                </Button>
              </div>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
};

