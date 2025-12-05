import { useState, useEffect } from 'react';
import { Save, Upload, X, Image as ImageIcon } from 'lucide-react';

import { useUpdateMaterial, useUploadMaterialImages } from '../api/update-material';
import { Material } from '@/types/api';
import { Button } from '@/components/ui/button';
import { SimpleDialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  const [description, setDescription] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [imgUrls, setImgUrls] = useState<string[]>([]);
  const [isPartition, setIsPartition] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadImagesMutation = useUploadMaterialImages();

  useEffect(() => {
    if (material) {
      setName(material.name);
      setDescription(material.description || '');
      setManufacturer(material.manufacturer || '');
      setImgUrls(material.imgUrls || []);
      setIsPartition(material.isPartition || false);
    }
  }, [material]);

  const updateMutation = useUpdateMaterial({
    mutationConfig: {
      onSuccess: () => {
        onClose();
      },
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      await handleUpload(files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      await handleUpload(files);
    }
  };

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      const result = await uploadImagesMutation.mutateAsync(files);
      const newUrls = result.files.map((f) => f.url);
      setImgUrls([...imgUrls, ...newUrls]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setImgUrls(imgUrls.filter((_, i) => i !== index));
  };

  const handleUpdate = () => {
    if (!material || !name) return;

    updateMutation.mutate({
      materialId: material.materialId,
      name,
      type: material.type,
      ammountPerMaterial: material.ammountPerMaterial,
      unit: material.unit,
      pricePerMaterial: material.pricePerMaterial,
      description: description || undefined,
      manufacturer: manufacturer || undefined,
      isActive: material.isActive,
      isPartition,
      imgUrls,
    });
  };

  const isLoading = updateMutation.isPending;

  return (
    <SimpleDialog isOpen={isOpen} onClose={onClose} title="Edit Material" maxWidth="2xl">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Update material name, manufacturer, description, and images.
        </p>

        <div className="space-y-2">
          <Label>Material Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            placeholder="e.g., NPK Fertilizer 16-16-8"
          />
        </div>

        <div className="space-y-2">
          <Label>Manufacturer</Label>
          <Input
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            disabled={isLoading}
            placeholder="e.g., Phân bón Phú Mỹ"
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="Description and notes..."
          />
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
            Can be partitioned (sold in smaller quantities)
          </label>
        </div>

        {/* Image Upload Section */}
        <div>
          <Label>Images</Label>
          <div className="space-y-4">
            {/* Drag and Drop Upload Area */}
            <div
              className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${dragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() =>
                document.getElementById('material-image-upload')?.click()
              }
            >
              <ImageIcon className="mx-auto mb-3 size-10 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                Drag and drop your images here, or click to browse
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="material-image-upload"
                disabled={uploadImagesMutation.isPending}
              />
              <div className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-50">
                <Upload className="size-4" />
                <span className="text-sm font-medium">Select Images</span>
              </div>
              {uploadImagesMutation.isPending && (
                <p className="mt-2 text-xs text-primary">Uploading...</p>
              )}
            </div>

            {/* Display uploaded images in table format */}
            {imgUrls.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Preview
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        File
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {imgUrls.map((url, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="size-12 rounded border object-cover"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            Image {index + 1}
                          </div>
                          <div className="text-xs text-gray-500">
                            {url.split('/').pop()?.substring(0, 30)}...
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                          >
                            <X className="size-3" />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!name || isLoading}
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
