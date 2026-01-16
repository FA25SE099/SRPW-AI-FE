import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

import { useImportUpsertMaterials } from '../api/import-upsert-materials';
import { Button } from '@/components/ui/button';
import { SimpleDialog } from '@/components/ui/dialog';

type ImportMaterialsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ImportMaterialsDialog = ({
  isOpen,
  onClose,
}: ImportMaterialsDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importUpsertMutation = useImportUpsertMaterials({
    mutationConfig: {
      onSuccess: () => {
        setSelectedFile(null);
        onClose();
      },
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = () => {
    if (!selectedFile) return;

    const importDate = new Date().toISOString();
    const params = { excelFile: selectedFile, importDate };

    importUpsertMutation.mutate(params);
  };

  const isLoading = importUpsertMutation.isPending;

  return (
    <SimpleDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Nhập Vật Liệu Từ Excel"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Tải lên tệp Excel để nhập vật liệu (tạo mới hoặc cập nhật hiện có).
        </p>

        {/* File Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tệp Excel
          </label>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              icon={<Upload className="h-4 w-4" />}
            >
              Chọn Tệp
            </Button>
            {selectedFile && (
              <div className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-700">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || isLoading}
            isLoading={isLoading}
          >
            Nhập Vật Liệu
          </Button>
        </div>
      </div>
    </SimpleDialog>
  );
};