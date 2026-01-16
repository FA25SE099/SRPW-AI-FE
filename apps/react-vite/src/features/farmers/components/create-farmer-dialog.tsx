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
          title: 'Tạo Nông Dân Thành Công',
          message: `Đã tạo thành công nông dân: ${data.fullName}`,
        });
        onOpenChange(false);
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Tạo Thất Bại',
          message: error.message || 'Tạo nông dân thất bại',
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
          <DialogTitle>Tạo Nông Dân Mới</DialogTitle>
          <DialogDescription>
            Thêm nông dân mới vào cụm của bạn bằng cách điền thông tin bên dưới
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
                  label="Họ Và Tên"
                  placeholder="Nhập họ và tên đầy đủ"
                  error={formState.errors['fullName']}
                  registration={register('fullName')}
                />

                <Input
                  label="Số Điện Thoại"
                  placeholder="Nhập số điện thoại (ví dụ: 0901234567)"
                  error={formState.errors['phoneNumber']}
                  registration={register('phoneNumber')}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="Nhập địa chỉ email (tùy chọn)"
                  error={formState.errors['email']}
                  registration={register('email')}
                />

                <Input
                  label="Mã Nông Dân"
                  placeholder="Nhập mã nông dân (ví dụ: FARM001)"
                  error={formState.errors['farmCode']}
                  registration={register('farmCode')}
                />

                <Input
                  label="Địa Chỉ"
                  placeholder="Nhập địa chỉ đầy đủ"
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
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  isLoading={createMutation.isPending}
                  icon={<UserPlus className="size-4" />}
                  className="gap-2"
                >
                  Tạo Nông Dân
                </Button>
              </div>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
};

