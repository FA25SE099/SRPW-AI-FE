import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

import { useUpdateMaterial } from '../api/update-material';
import { Material, MaterialType } from '@/types/api';
import { Button } from '@/components/ui/button';
import { SimpleDialog } from '@/components/ui/dialog';

type EditMaterialDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
};

export const EditMaterialDialog = ({
  isOpen,
  onClose,
  material,
}: EditMaterialDialogProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<MaterialType>(MaterialType.Fertilizer);
  const [ammountPerMaterial, setAmmountPerMaterial] = useState<number>(0);
  const [unit, setUnit] = useState('');
  const [pricePerMaterial, setPricePerMaterial] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (material) {
      setName(material.name);
      setType(material.type);
      setAmmountPerMaterial(material.ammountPerMaterial);
      setUnit(material.unit);
      setPricePerMaterial(material.pricePerMaterial);
      setDescription(material.description || '');
      setManufacturer(material.manufacturer || '');
      setIsActive(material.isActive);
    }
  }, [material]);

  const updateMutation = useUpdateMaterial({
    mutationConfig: {
      onSuccess: () => {
        onClose();
      },
    },
  });

  const handleUpdate = () => {
    if (!material || !name || !unit) return;

    updateMutation.mutate({
      materialId: material.materialId,
      name,
      type,
      ammountPerMaterial,
      unit,
      pricePerMaterial,
      description: description || undefined,
      manufacturer: manufacturer || undefined,
      isActive,
      priceValidFrom: new Date().toISOString(),
    });
  };

  const isLoading = updateMutation.isPending;

  return (
    <SimpleDialog isOpen={isOpen} onClose={onClose} title="Edit Material" maxWidth="2xl">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Update material information and pricing.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Material Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="e.g., NPK Fertilizer 16-16-8"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(Number(e.target.value) as MaterialType)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value={MaterialType.Fertilizer}>Fertilizer</option>
              <option value={MaterialType.Pesticide}>Pesticide</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Amount *
            </label>
            <input
              type="number"
              value={ammountPerMaterial}
              onChange={(e) => setAmmountPerMaterial(Number(e.target.value))}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="e.g., 50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Unit *
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="e.g., kg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Price (VND) *
            </label>
            <input
              type="number"
              value={pricePerMaterial}
              onChange={(e) => setPricePerMaterial(Number(e.target.value))}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="e.g., 450000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Manufacturer
          </label>
          <input
            type="text"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="e.g., Phân bón Phú Mỹ"
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
            placeholder="Description and notes..."
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

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!name || !unit || isLoading}
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
