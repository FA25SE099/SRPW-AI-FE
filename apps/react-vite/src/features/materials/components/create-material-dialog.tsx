import { useState } from 'react';
import { Plus } from 'lucide-react';

import { useCreateMaterial } from '../api/create-material';
import { MaterialType } from '@/types/api';
import { Button } from '@/components/ui/button';
import { SimpleDialog } from '@/components/ui/dialog';

type CreateMaterialDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const CreateMaterialDialog = ({
  isOpen,
  onClose,
}: CreateMaterialDialogProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<MaterialType>(MaterialType.Fertilizer);
  const [ammountPerMaterial, setAmmountPerMaterial] = useState<number>(0);
  const [unit, setUnit] = useState('');
  const [pricePerMaterial, setPricePerMaterial] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isPartition, setIsPartition] = useState(false);

  const createMutation = useCreateMaterial({
    mutationConfig: {
      onSuccess: () => {
        // Reset form
        setName('');
        setType(MaterialType.Fertilizer);
        setAmmountPerMaterial(0);
        setUnit('');
        setPricePerMaterial(0);
        setDescription('');
        setManufacturer('');
        setIsActive(true);
        setIsPartition(false);
        onClose();
      },
    },
  });

  const handleCreate = () => {
    if (!name || !unit) return;

    createMutation.mutate({
      name,
      type,
      ammountPerMaterial,
      unit,
      pricePerMaterial,
      description: description || undefined,
      manufacturer: manufacturer || undefined,
      isActive,
      isPartition,
      priceValidFrom: new Date().toISOString(),
    });
  };

  const isLoading = createMutation.isPending;

  return (
    <SimpleDialog isOpen={isOpen} onClose={onClose} title="Tạo Vật Liệu Mới" maxWidth="2xl">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Thêm vật liệu mới (phân bón hoặc thuốc trừ sâu) vào kho.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tên Vật Liệu *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="VD: Phân NPK 16-16-8"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Loại *
            </label>
            <select
              value={type}
              onChange={(e) => setType(Number(e.target.value) as MaterialType)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value={MaterialType.Fertilizer}>Phân Bón</option>
              <option value={MaterialType.Pesticide}>Thuốc Trừ Sâu</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Số Lượng *
            </label>
            <input
              type="number"
              value={ammountPerMaterial}
              onChange={(e) => setAmmountPerMaterial(Number(e.target.value))}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="VD: 50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Đơn Vị *
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="VD: kg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Giá (VND) *
            </label>
            <input
              type="number"
              value={pricePerMaterial}
              onChange={(e) => setPricePerMaterial(Number(e.target.value))}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="VD: 450000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Nhà Sản Xuất
          </label>
          <input
            type="text"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="VD: Phân bón Phú Mỹ"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Mô Tả
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Mô tả và ghi chú..."
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

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPartition"
            checked={isPartition}
            onChange={(e) => setIsPartition(e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isPartition" className="text-sm font-medium text-gray-700">
            Có thể chia nhỏ (bán với số lượng nhỏ hơn)
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name || !unit || isLoading}
            isLoading={isLoading}
            icon={<Plus className="h-4 w-4" />}
          >
            Tạo Vật Liệu
          </Button>
        </div>
      </div>
    </SimpleDialog>
  );
};
