import { AlertTriangle, Trash2 } from 'lucide-react';

import { useDeleteMaterial } from '../api/delete-material';
import { Material } from '@/types/api';
import { Button } from '@/components/ui/button';
import { SimpleDialog } from '@/components/ui/dialog';

type DeleteMaterialDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
};

export const DeleteMaterialDialog = ({
  isOpen,
  onClose,
  material,
}: DeleteMaterialDialogProps) => {
  const deleteMutation = useDeleteMaterial({
    mutationConfig: {
      onSuccess: () => {
        onClose();
      },
    },
  });

  const handleDelete = () => {
    if (!material) return;
    deleteMutation.mutate(material.materialId);
  };

  const isLoading = deleteMutation.isPending;

  return (
    <SimpleDialog isOpen={isOpen} onClose={onClose} title="Delete Material">
      <div className="space-y-4">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Warning</h3>
              <p className="mt-1 text-sm text-red-700">
                This action cannot be undone. This will permanently delete the material from the system.
              </p>
            </div>
          </div>
        </div>

        {material && (
          <div className="rounded-lg border bg-gray-50 p-4">
            <h4 className="font-medium text-gray-900">Material to delete:</h4>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p><strong>Name:</strong> {material.name}</p>
              <p><strong>Type:</strong> {material.type === 0 ? 'Fertilizer' : 'Pesticide'}</p>
              <p><strong>Quantity:</strong> {material.showout || 'N/A'}</p>
              <p><strong>Price:</strong> {material.pricePerMaterial != null ? `${material.pricePerMaterial.toLocaleString('vi-VN')} VND` : 'N/A'}</p>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-600">
          Are you sure you want to delete this material? This will remove it from all related records.
        </p>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            isLoading={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
            icon={<Trash2 className="h-4 w-4" />}
          >
            Delete Material
          </Button>
        </div>
      </div>
    </SimpleDialog>
  );
};
