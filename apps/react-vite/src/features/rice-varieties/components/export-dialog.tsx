import { useState } from 'react';
import { Download, X } from 'lucide-react';

import { useDownloadRiceVarieties } from '../api/download-rice-varieties';
import { RiceVarietyCategory } from '@/types/api';
import { Button } from '@/components/ui/button';
import { SimpleDialog } from '@/components/ui/dialog';

type ExportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: RiceVarietyCategory[];
};

export const ExportDialog = ({
  isOpen,
  onClose,
  categories,
}: ExportDialogProps) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(true);

  const downloadMutation = useDownloadRiceVarieties({
    mutationConfig: {
      onSuccess: () => {
        onClose();
      },
    },
  });

  const handleExport = () => {
    const today = new Date().toISOString();
    downloadMutation.mutate({
      inputDate: today,
      categoryId: selectedCategoryId || undefined,
      isActive: isActiveFilter,
    });
  };

  const isLoading = downloadMutation.isPending;

  return (
    <SimpleDialog isOpen={isOpen} onClose={onClose} title="Xuất Giống Lúa">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Chọn bộ lọc để xuất giống lúa ra Excel.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Bộ Lọc Danh Mục
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="">Tất Cả Danh Mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Bộ Lọc Trạng Thái
            </label>
            <select
              value={isActiveFilter === undefined ? '' : isActiveFilter.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setIsActiveFilter(value === '' ? undefined : value === 'true');
              }}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="">Tất Cả Trạng Thái</option>
              <option value="true">Chỉ Đang Hoạt Động</option>
              <option value="false">Chỉ Không Hoạt Động</option>
            </select>
          </div>
        </div>

        <div className="rounded-md bg-blue-50 p-3">
          <p className="text-sm text-blue-700">
            <strong>Xuất sẽ bao gồm:</strong>
            <br />
            • {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.categoryName || 'Danh mục đã chọn' : 'Tất cả danh mục'}
            <br />
            • {isActiveFilter === undefined ? 'Tất cả trạng thái' : isActiveFilter ? 'Chỉ đang hoạt động' : 'Chỉ không hoạt động'}
            <br />
            • Tất cả chi tiết giống (tên, danh mục, thời gian sinh trưởng, năng suất, v.v.)
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleExport}
            isLoading={isLoading}
            icon={<Download className="h-4 w-4" />}
          >
            Xuất Ra Excel
          </Button>
        </div>
      </div>
    </SimpleDialog>
  );
};
