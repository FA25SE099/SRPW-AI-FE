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
    <SimpleDialog isOpen={isOpen} onClose={onClose} title="Export Rice Varieties">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Choose filters for exporting rice varieties to Excel.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Category Filter
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              disabled={isLoading}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Status Filter
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
              <option value="">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>

        <div className="rounded-md bg-blue-50 p-3">
          <p className="text-sm text-blue-700">
            <strong>Export will include:</strong>
            <br />
            • {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.categoryName || 'Selected category' : 'All categories'}
            <br />
            • {isActiveFilter === undefined ? 'All statuses' : isActiveFilter ? 'Active only' : 'Inactive only'}
            <br />
            • All variety details (name, category, growth duration, yield, etc.)
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            isLoading={isLoading}
            icon={<Download className="h-4 w-4" />}
          >
            Export to Excel
          </Button>
        </div>
      </div>
    </SimpleDialog>
  );
};
