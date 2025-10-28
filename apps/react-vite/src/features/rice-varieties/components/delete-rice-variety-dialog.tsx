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
    <SimpleDialog isOpen={isOpen} onClose={onClose} title="Delete Rice Variety">
      <div className="space-y-4">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Warning</h3>
              <p className="mt-1 text-sm text-red-700">
                This action cannot be undone. This will permanently delete the rice variety and all associated season data.
              </p>
            </div>
          </div>
        </div>

        {variety && (
          <div className="rounded-lg border bg-gray-50 p-4">
            <h4 className="font-medium text-gray-900">Rice variety to delete:</h4>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p><strong>Name:</strong> {variety.varietyName}</p>
              <p><strong>Category:</strong> {variety.categoryName}</p>
              <p><strong>Growth Duration:</strong> {variety.baseGrowthDurationDays} days</p>
              <p><strong>Base Yield:</strong> {variety.baseYieldPerHectare} tons/ha</p>
              {variety.description && (
                <p><strong>Description:</strong> {variety.description}</p>
              )}
            </div>
          </div>
        )}

        <p className="text-sm text-gray-600">
          Are you sure you want to delete this rice variety? This will remove it from all related records and season associations.
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
            Delete Rice Variety
          </Button>
        </div>
      </div>
    </SimpleDialog>
  );
};
