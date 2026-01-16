import { useState } from 'react';
import { Plus } from 'lucide-react';

import { useCreateRiceVariety } from '../api/create-rice-variety';
import { useCategories } from '../api/get-categories';
import { Button } from '@/components/ui/button';
import { SimpleDialog } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

type CreateRiceVarietyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const CreateRiceVarietyDialog = ({
  isOpen,
  onClose,
}: CreateRiceVarietyDialogProps) => {
  const [varietyName, setVarietyName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [baseGrowthDurationDays, setBaseGrowthDurationDays] = useState<number>(0);
  const [baseYieldPerHectare, setBaseYieldPerHectare] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [characteristics, setCharacteristics] = useState('');
  const [isActive, setIsActive] = useState(true);

  const categoriesQuery = useCategories();
  const createMutation = useCreateRiceVariety({
    mutationConfig: {
      onSuccess: () => {
        // Reset form
        setVarietyName('');
        setCategoryId('');
        setBaseGrowthDurationDays(0);
        setBaseYieldPerHectare(0);
        setDescription('');
        setCharacteristics('');
        setIsActive(true);
        onClose();
      },
    },
  });

  const handleCreate = () => {
    if (!varietyName || !categoryId) return;

    createMutation.mutate({
      varietyName,
      categoryId,
      baseGrowthDurationDays,
      baseYieldPerHectare,
      description: description || undefined,
      characteristics: characteristics || undefined,
      isActive,
    });
  };

  const isLoading = createMutation.isPending;
  const categories = categoriesQuery.data || [];

  return (
    <SimpleDialog isOpen={isOpen} onClose={onClose} title="Tạo Giống Lúa Mới" maxWidth="2xl">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Thêm giống lúa mới vào cơ sở dữ liệu.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tên Giống Lúa *
            </label>
            <input
              type="text"
              value={varietyName}
              onChange={(e) => setVarietyName(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="VD: ST25"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Danh Mục *
            </label>
            {categoriesQuery.isLoading ? (
              <div className="flex items-center justify-center py-2">
                <Spinner size="sm" />
              </div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="">Chọn danh mục...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Thời Gian Sinh Trưởng (Ngày) *
            </label>
            <input
              type="number"
              value={baseGrowthDurationDays}
              onChange={(e) => setBaseGrowthDurationDays(Number(e.target.value))}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="VD: 95"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Năng Suất Mỗi Hecta (Tấn) *
            </label>
            <input
              type="number"
              step="0.1"
              value={baseYieldPerHectare}
              onChange={(e) => setBaseYieldPerHectare(Number(e.target.value))}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="VD: 6.5"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Mô Tả
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Mô tả về giống lúa..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Đặc Tính
          </label>
          <textarea
            value={characteristics}
            onChange={(e) => setCharacteristics(e.target.value)}
            disabled={isLoading}
            rows={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Đặc tính chính của giống..."
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
            Đang Hoạt Động
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!varietyName || !categoryId || isLoading}
            isLoading={isLoading}
            icon={<Plus className="h-4 w-4" />}
          >
            Tạo Giống Lúa
          </Button>
        </div>
      </div>
    </SimpleDialog>
  );
};
