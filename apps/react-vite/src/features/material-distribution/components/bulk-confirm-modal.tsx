import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Upload, X, ImageIcon, Package, Images } from 'lucide-react';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BulkConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribution: FarmerDistribution | null;
  supervisorId: string;
}

type ImageUploadMode = 'shared' | 'individual';

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
  const [uploadMode, setUploadMode] = useState<ImageUploadMode>('shared');

  // Shared images for all distributions
  const [sharedImages, setSharedImages] = useState<File[]>([]);

  // Individual images per distribution (distributionId -> File[])
  const [individualImages, setIndividualImages] = useState<Record<string, File[]>>({});

  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);

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
    setSharedImages([]);
    setIndividualImages({});
    setUploading(false);
    setUploadMode('shared');
    onClose();
  };

  const handleDrag = (e: React.DragEvent, distributionId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
      if (distributionId) setActiveDropZone(distributionId);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
      setActiveDropZone(null);
    }
  };

  const handleDrop = (e: React.DragEvent, distributionId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setActiveDropZone(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );

      if (distributionId) {
        // Add to individual images
        setIndividualImages((prev) => ({
          ...prev,
          [distributionId]: [...(prev[distributionId] || []), ...files].slice(0, 5),
        }));
      } else {
        // Add to shared images
        setSharedImages((prev) => [...prev, ...files].slice(0, 5));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, distributionId?: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter((file) =>
        file.type.startsWith('image/')
      );

      if (distributionId) {
        // Add to individual images
        setIndividualImages((prev) => ({
          ...prev,
          [distributionId]: [...(prev[distributionId] || []), ...files].slice(0, 5),
        }));
      } else {
        // Add to shared images
        setSharedImages((prev) => [...prev, ...files].slice(0, 5));
      }
    }
  };

  const removeSharedImage = (index: number) => {
    setSharedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeIndividualImage = (distributionId: string, index: number) => {
    setIndividualImages((prev) => ({
      ...prev,
      [distributionId]: (prev[distributionId] || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!distribution) {
      return;
    }

    // Validation based on upload mode
    if (uploadMode === 'shared' && sharedImages.length === 0) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please upload at least one proof of distribution photo',
      });
      return;
    }

    if (uploadMode === 'individual') {
      const hasIndividualImages = Object.keys(individualImages).some(
        (key) => individualImages[key] && individualImages[key].length > 0
      );

      if (!hasIndividualImages && sharedImages.length === 0) {
        addNotification({
          type: 'error',
          title: 'Validation Error',
          message: 'Please upload at least one photo (either shared or individual per material)',
        });
        return;
      }
    }

    setUploading(true);

    try {
      let sharedImageUrls: string[] = [];
      const distributionImageUrls: Record<string, string[]> = {};

      // Upload shared images if any
      if (sharedImages.length > 0) {
        const uploadResult = await uploadFiles(sharedImages);
        sharedImageUrls = uploadResult.files.map((f) => f.url);
      }

      // Upload individual images if any
      if (uploadMode === 'individual' && Object.keys(individualImages).length > 0) {
        for (const [distributionId, files] of Object.entries(individualImages)) {
          if (files && files.length > 0) {
            const uploadResult = await uploadFiles(files);
            distributionImageUrls[distributionId] = uploadResult.files.map((f) => f.url);
          }
        }
      }

      // Prepare request based on what we have
      const request: any = {
        plotCultivationId: distribution.plotCultivationId,
        supervisorId: supervisorId,
        actualDistributionDate: new Date(actualDate).toISOString(),
        notes: notes.trim() || undefined,
      };

      // Add shared images if available
      if (sharedImageUrls.length > 0) {
        request.imageUrls = sharedImageUrls;
      }

      // Add individual images if available
      if (Object.keys(distributionImageUrls).length > 0) {
        request.distributionImages = distributionImageUrls;
      }

      // Bulk confirm all distributions
      await confirmMutation.mutateAsync(request);
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

  const getTotalImageCount = () => {
    const sharedCount = sharedImages.length;
    const individualCount = Object.values(individualImages).reduce(
      (sum, files) => sum + (files?.length || 0),
      0
    );
    return sharedCount + individualCount;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

          {/* Image Upload Tabs */}
          <div className="space-y-3">
            <Label>
              Proof of Distribution (Photos) <span className="text-red-500">*</span>
            </Label>

            <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as ImageUploadMode)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="shared" className="flex items-center gap-2">
                  <Images className="h-4 w-4" />
                  Shared Photos
                </TabsTrigger>
                <TabsTrigger value="individual" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Individual Photos
                </TabsTrigger>
              </TabsList>

              {/* Shared Images Tab */}
              <TabsContent value="shared" className="space-y-4">
                {/* <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    📸 Upload photos that will be attached to <strong>all {distribution.totalMaterialCount} materials</strong>
                  </p>
                </div> */}

                <div
                  className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${dragActive && !activeDropZone
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                  onDragEnter={(e) => handleDrag(e)}
                  onDragLeave={(e) => handleDrag(e)}
                  onDragOver={(e) => handleDrag(e)}
                  onDrop={(e) => handleDrop(e)}
                  onClick={() =>
                    document.getElementById('shared-image-upload')?.click()
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
                    onChange={(e) => handleFileChange(e)}
                    className="hidden"
                    id="shared-image-upload"
                    disabled={uploading}
                  />
                  <div className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-50">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm font-medium">Select Images</span>
                  </div>
                </div>

                {/* Shared Image Preview */}
                {sharedImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Selected Images ({sharedImages.length}/5)
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {sharedImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Shared ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeSharedImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Individual Images Tab */}
              <TabsContent value="individual" className="space-y-4">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-900">
                    ✨ <strong>NEW!</strong> Upload specific photos for each material. Great for showing individual items clearly.
                  </p>
                </div>

                {/* Optional shared images for fallback */}
                <div className="space-y-2">
                  <Label className="text-sm">
                    Fallback Photos (Optional)
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">
                    These will be used for materials without specific photos
                  </p>
                  <div
                    className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors ${dragActive && !activeDropZone
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                    onDragEnter={(e) => handleDrag(e)}
                    onDragLeave={(e) => handleDrag(e)}
                    onDragOver={(e) => handleDrag(e)}
                    onDrop={(e) => handleDrop(e)}
                    onClick={() =>
                      document.getElementById('fallback-image-upload')?.click()
                    }
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange(e)}
                      className="hidden"
                      id="fallback-image-upload"
                      disabled={uploading}
                    />
                    <div className="inline-flex items-center gap-2 text-sm">
                      <Upload className="h-4 w-4" />
                      <span>Add Fallback Images ({sharedImages.length}/5)</span>
                    </div>
                  </div>

                  {sharedImages.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {sharedImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Fallback ${index + 1}`}
                            className="w-full h-16 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeSharedImage(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Materials with Individual Upload */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <Label className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Upload Photos for Each Material:
                  </Label>

                  {distribution.materials.map((material, index) => {
                    const materialImages = individualImages[material.distributionId] || [];
                    return (
                      <div
                        key={material.distributionId}
                        className="p-4 bg-white rounded-lg border border-gray-200 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {index + 1}. {material.materialName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {material.quantity} {material.unit}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-gray-500">
                            {materialImages.length}/5 photos
                          </span>
                        </div>

                        <div
                          className={`cursor-pointer rounded border-2 border-dashed p-3 text-center transition-colors ${dragActive && activeDropZone === material.distributionId
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                          onDragEnter={(e) => handleDrag(e, material.distributionId)}
                          onDragLeave={(e) => handleDrag(e, material.distributionId)}
                          onDragOver={(e) => handleDrag(e, material.distributionId)}
                          onDrop={(e) => handleDrop(e, material.distributionId)}
                          onClick={() =>
                            document.getElementById(`material-upload-${material.distributionId}`)?.click()
                          }
                        >
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFileChange(e, material.distributionId)}
                            className="hidden"
                            id={`material-upload-${material.distributionId}`}
                            disabled={uploading}
                          />
                          <div className="inline-flex items-center gap-2 text-xs">
                            <Upload className="h-3 w-3" />
                            <span>Drop or click to upload</span>
                          </div>
                        </div>

                        {/* Individual Material Images Preview */}
                        {materialImages.length > 0 && (
                          <div className="grid grid-cols-5 gap-2">
                            {materialImages.map((file, imgIndex) => (
                              <div key={imgIndex} className="relative group">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`${material.materialName} ${imgIndex + 1}`}
                                  className="w-full h-16 object-cover rounded border"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeIndividualImage(material.distributionId, imgIndex)
                                  }
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>

            <p className="text-xs text-gray-500">
              Total images selected: {getTotalImageCount()}
            </p>
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
              disabled={uploading || confirmMutation.isPending || getTotalImageCount() === 0}
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
