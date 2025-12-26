import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Upload, X, ImageIcon, Package } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/components/ui/notifications';
import { useBulkConfirmDistribution } from '../api';
import { uploadFiles } from '@/features/emergency-protocols/api/get-pest-protocols';
import { FarmerDistribution } from '../types';

interface BulkConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribution: FarmerDistribution | null;
  supervisorId: string;
}

export const BulkConfirmModal = ({
  isOpen,
  onClose,
  distribution,
  supervisorId,
}: BulkConfirmModalProps) => {
  const { addNotification } = useNotifications();
  const [actualDate, setActualDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const confirmMutation = useBulkConfirmDistribution({
    mutationConfig: {
      onSuccess: (response) => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: `Successfully confirmed ${response.totalDistributionsConfirmed} material distribution(s)!`,
        });
        handleClose();
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Error',
          message: error?.message || 'Failed to confirm distributions',
        });
      },
    },
  });

  const handleClose = () => {
    setActualDate(format(new Date(), 'yyyy-MM-dd'));
    setNotes('');
    setImages([]);
    setUploading(false);
    onClose();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      setImages((prev) => [...prev, ...files].slice(0, 5)); // Max 5 images
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter((file) =>
        file.type.startsWith('image/')
      );
      setImages((prev) => [...prev, ...files].slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!distribution || images.length === 0) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please upload at least one proof of distribution photo',
      });
      return;
    }

    setUploading(true);

    try {
      // Upload images first
      const uploadResult = await uploadFiles(images);
      const imageUrls = uploadResult.files.map((f) => f.url);

      // Bulk confirm all distributions for this farmer
      await confirmMutation.mutateAsync({
        plotCultivationId: distribution.plotCultivationId,
        supervisorId: supervisorId,
        actualDistributionDate: new Date(actualDate).toISOString(),
        notes: notes.trim() || undefined,
        imageUrls: imageUrls,
      });
    } catch (error) {
      console.error('Error confirming distributions:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to upload images or confirm distributions',
      });
    } finally {
      setUploading(false);
    }
  };

  if (!distribution) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Material Distribution</DialogTitle>
          <DialogDescription>
            Confirm that you have distributed all materials to {distribution.farmerName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Distribution Summary */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Farmer:</span>
              <span className="text-sm font-medium">{distribution.farmerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Plot:</span>
              <span className="text-sm font-medium">{distribution.plotName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Phone:</span>
              <span className="text-sm font-medium">{distribution.farmerPhone}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-semibold text-gray-700">Total Materials:</span>
              <span className="text-sm font-bold text-blue-600">
                {distribution.totalMaterialCount} item(s)
              </span>
            </div>
          </div>

          {/* Materials List */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Materials to be confirmed:
            </Label>
            <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-lg border">
              {distribution.materials.map((material, index) => (
                <div
                  key={material.distributionId}
                  className="flex items-center justify-between p-2 bg-white rounded border"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {index + 1}. {material.materialName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {material.quantity} {material.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actual Distribution Date */}
          <div className="space-y-2">
            <Label htmlFor="actualDate">
              Actual Distribution Date <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="actualDate"
                type="date"
                value={actualDate}
                onChange={(e) => setActualDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                required
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">
              When did you actually distribute the materials?
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>
              Proof of Distribution (Photos) <span className="text-red-500">*</span>
            </Label>
            <div
              className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() =>
                document.getElementById('bulk-distribution-image-upload')?.click()
              }
            >
              <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                Drag and drop your images here, or click to browse
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="bulk-distribution-image-upload"
                disabled={uploading}
              />
              <div className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-50">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium">Select Images</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Upload photos showing all materials delivered (max 5 images, required)
            </p>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {images.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about the distribution..."
              rows={4}
              maxLength={500}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 text-right">
              {notes.length}/500 characters
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploading || confirmMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || confirmMutation.isPending || images.length === 0}
            >
              {uploading || confirmMutation.isPending
                ? 'Confirming...'
                : `Confirm All ${distribution.totalMaterialCount} Material(s)`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

