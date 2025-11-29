import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useUploadFiles } from '../api/get-pest-protocols';

type WeatherProtocolDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  protocol: {
    id?: string;
    name: string;
    description: string;
    source: string;
    sourceLink: string;
    imageLinks: string[];
    notes: string;
    isActive: boolean;
  };
  setProtocol: (data: any) => void;
  isEditMode?: boolean;
};

export const WeatherProtocolDialog = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  protocol,
  setProtocol,
  isEditMode = false,
}: WeatherProtocolDialogProps) => {
  const [dragActive, setDragActive] = useState(false);
  const uploadFilesMutation = useUploadFiles();

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
      const result = await uploadFilesMutation.mutateAsync(files);
      const newLinks = result.files.map((f) => f.url);
      setProtocol({
        ...protocol,
        imageLinks: [...protocol.imageLinks, ...newLinks],
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images. Please try again.');
    }
  };

  const removeImageLink = (index: number) => {
    const updatedLinks = protocol.imageLinks.filter((_, i) => i !== index);
    setProtocol({ ...protocol, imageLinks: updatedLinks });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
          <h3 className="mb-4 text-lg font-bold">
            {isEditMode ? 'Edit Weather Protocol' : 'Create Weather Protocol'}
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(protocol);
            }}
            className="space-y-4"
          >
            <div>
              <Label>Name *</Label>
              <Input
                value={protocol.name}
                onChange={(e) =>
                  setProtocol({
                    ...protocol,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Label>Source *</Label>
              <Input
                value={protocol.source}
                onChange={(e) =>
                  setProtocol({
                    ...protocol,
                    source: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Label>Source Link</Label>
              <Input
                value={protocol.sourceLink}
                onChange={(e) =>
                  setProtocol({
                    ...protocol,
                    sourceLink: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Description *</Label>
              <textarea
                value={protocol.description}
                onChange={(e) =>
                  setProtocol({
                    ...protocol,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <Label>Images</Label>
              <div className="space-y-4">
                {/* Drag and Drop Upload Area - Always visible */}
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
                    document.getElementById('weather-image-upload')?.click()
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
                    id="weather-image-upload"
                    disabled={uploadFilesMutation.isPending}
                  />
                  <div className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-50">
                    <Upload className="size-4" />
                    <span className="text-sm font-medium">Select Images</span>
                  </div>
                  {uploadFilesMutation.isPending && (
                    <p className="mt-2 text-xs text-primary">Uploading...</p>
                  )}
                </div>

                {/* Display uploaded images in table format */}
                {protocol.imageLinks.length > 0 && (
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
                        {protocol.imageLinks.map((link, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <img
                                src={link}
                                alt={`Preview ${index + 1}`}
                                className="size-12 rounded border object-cover"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">
                                Image {index + 1}
                              </div>
                              <div className="text-xs text-gray-500">
                                {link.split('/').pop()?.substring(0, 30)}...
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => removeImageLink(index)}
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

            <div>
              <Label>Notes</Label>
              <textarea
                value={protocol.notes}
                onChange={(e) =>
                  setProtocol({
                    ...protocol,
                    notes: e.target.value,
                  })
                }
                rows={2}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={protocol.isActive}
                onChange={(e) =>
                  setProtocol({
                    ...protocol,
                    isActive: e.target.checked,
                  })
                }
                id="weather-active"
              />
              <label htmlFor="weather-active">Active</label>
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isEditMode
                    ? 'Saving...'
                    : 'Creating...'
                  : isEditMode
                    ? 'Save'
                    : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
