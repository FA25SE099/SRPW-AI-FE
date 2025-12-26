import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, Input } from '@/components/ui/form';
import { useDisclosure } from '@/hooks/use-disclosure';
import {
  changePasswordInputSchema,
  useChangePassword,
} from '../api/change-password';

export const ChangePasswordModal = () => {
  const { close, open, isOpen } = useDisclosure();
  const changePassword = useChangePassword({
    onSuccess: close,
  });

  return (
    <Dialog open={isOpen} onOpenChange={open}>
      <DialogTrigger asChild>
        <Button variant="outline">Change Password</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Update your password to keep your account secure.
          </DialogDescription>
        </DialogHeader>
        <Form
          onSubmit={(values) => {
            changePassword.mutate(values);
          }}
          schema={changePasswordInputSchema}
          options={{
            defaultValues: {
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            },
          }}
        >
          {({ register, formState }) => (
            <>
              <Input
                type="password"
                label="Current Password"
                placeholder="Enter your current password"
                error={formState.errors['currentPassword']}
                registration={register('currentPassword')}
              />
              <Input
                type="password"
                label="New Password"
                placeholder="Enter your new password"
                error={formState.errors['newPassword']}
                registration={register('newPassword')}
              />
              <Input
                type="password"
                label="Confirm New Password"
                placeholder="Confirm your new password"
                error={formState.errors['confirmPassword']}
                registration={register('confirmPassword')}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={close}
                  disabled={changePassword.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={changePassword.isPending}
                >
                  Change Password
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
};
