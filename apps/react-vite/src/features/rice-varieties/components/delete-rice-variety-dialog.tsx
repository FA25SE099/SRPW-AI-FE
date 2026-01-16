import { AlertTriangle, Trash2 } from 'lucide-react';

import { useDeleteRiceVariety } from '../api/delete-rice-variety';
import { RiceVariety } from '@/types/api';
import { Button } from '@/components/ui/button';
import { SimpleDialog } from '@/components/ui/dialog';

type DeleteRiceVarietyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  variety: RiceVariety | null;
};

export const DeleteRiceVarietyDialog = ({
  isOpen,
  onClose,
  variety,
}: DeleteRiceVarietyDialogProps) => {
  const deleteMutation = useDeleteRiceVariety({
    mutationConfig: {
      onSuccess: () => {
        onClose();
      },
    },
  });

  const handleDelete = () => {
    if (!variety) return;
    deleteMutation.mutate(variety.id);
  };

  const isLoading = deleteMutation.isPending;

  return (
    <SimpleDialog isOpen={isOpen} onClose={onClose} title="Xóa Giống Lúa">
      <div className="space-y-4">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Cảnh Báo</h3>
              <p className="mt-1 text-sm text-red-700">
                Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn giống lúa và tất cả dữ liệu mùa vụ liên quan.
              </p>
            </div>
          </div>
        </div>

        {variety && (
          <div className="rounded-lg border bg-gray-50 p-4">
            <h4 className="font-medium text-gray-900">Giống lúa sẽ bị xóa:</h4>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p><strong>Tên:</strong> {variety.varietyName}</p>
              <p><strong>Danh Mục:</strong> {variety.categoryName}</p>
              <p><strong>Thời Gian Sinh Trưởng:</strong> {variety.baseGrowthDurationDays} ngày</p>
              <p><strong>Năng Suất Cơ Bản:</strong> {variety.baseYieldPerHectare} tấn/ha</p>
              {variety.description && (
                <p><strong>Mô Tả:</strong> {variety.description}</p>
              )}
            </div>
          </div>
        )}

        <p className="text-sm text-gray-600">
          Bạn có chắc chắn muốn xóa giống lúa này? Điều này sẽ xóa nó khỏi tất cả các bản ghi liên quan và liên kết mùa vụ.
        </p>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            isLoading={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
            icon={<Trash2 className="h-4 w-4" />}
          >
            Xóa Giống Lúa
          </Button>
        </div>
      </div>
    </SimpleDialog>
  );
};
