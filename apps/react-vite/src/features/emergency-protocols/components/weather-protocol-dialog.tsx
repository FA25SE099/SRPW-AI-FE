import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUploadFiles } from '../api/get-pest-protocols';
import { Upload, X } from 'lucide-react';

type WeatherProtocolDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: any) => void;
    isLoading: boolean;
    newWeatherProtocol: {
        name: string;
        description: string;
        source: string;
        sourceLink: string;
        imageLinks: string[];
        notes: string;
        isActive: boolean;
    };
    setNewWeatherProtocol: (data: any) => void;
};

export const WeatherProtocolDialog = ({
    isOpen,
    onClose,
    onCreate,
    isLoading,
    newWeatherProtocol,
    setNewWeatherProtocol,
}: WeatherProtocolDialogProps) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const uploadFilesMutation = useUploadFiles();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        try {
            const result = await uploadFilesMutation.mutateAsync(selectedFiles);
            const newLinks = result.files.map(f => f.url);
            setNewWeatherProtocol({
                ...newWeatherProtocol,
                imageLinks: [...newWeatherProtocol.imageLinks, ...newLinks],
            });
            setSelectedFiles([]);
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const removeImageLink = (index: number) => {
        const updatedLinks = newWeatherProtocol.imageLinks.filter((_, i) => i !== index);
        setNewWeatherProtocol({ ...newWeatherProtocol, imageLinks: updatedLinks });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50" onClick={onClose} />
                <div className="relative z-10 w-full max-w-2xl rounded-lg bg-white shadow-xl p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-bold mb-4">Create Weather Protocol</h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            onCreate(newWeatherProtocol);
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <Label>Name *</Label>
                            <Input
                                value={newWeatherProtocol.name}
                                onChange={(e) =>
                                    setNewWeatherProtocol({ ...newWeatherProtocol, name: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div>
                            <Label>Description *</Label>
                            <textarea
                                value={newWeatherProtocol.description}
                                onChange={(e) =>
                                    setNewWeatherProtocol({ ...newWeatherProtocol, description: e.target.value })
                                }
                                rows={3}
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <Label>Source *</Label>
                            <Input
                                value={newWeatherProtocol.source}
                                onChange={(e) =>
                                    setNewWeatherProtocol({ ...newWeatherProtocol, source: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div>
                            <Label>Source Link</Label>
                            <Input
                                value={newWeatherProtocol.sourceLink}
                                onChange={(e) =>
                                    setNewWeatherProtocol({ ...newWeatherProtocol, sourceLink: e.target.value })
                                }
                            />
                        </div>

                        {/* Image Upload Section */}
                        <div>
                            <Label>Images</Label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleUpload}
                                        disabled={selectedFiles.length === 0 || uploadFilesMutation.isPending}
                                        size="sm"
                                    >
                                        <Upload className="h-4 w-4 mr-1" />
                                        {uploadFilesMutation.isPending ? 'Uploading...' : 'Upload'}
                                    </Button>
                                </div>

                                {selectedFiles.length > 0 && (
                                    <p className="text-xs text-gray-600">
                                        {selectedFiles.length} file(s) selected
                                    </p>
                                )}

                                {/* Display uploaded images */}
                                {newWeatherProtocol.imageLinks.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {newWeatherProtocol.imageLinks.map((link, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={link}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImageLink(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label>Notes</Label>
                            <textarea
                                value={newWeatherProtocol.notes}
                                onChange={(e) =>
                                    setNewWeatherProtocol({ ...newWeatherProtocol, notes: e.target.value })
                                }
                                rows={2}
                                className="w-full rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={newWeatherProtocol.isActive}
                                onChange={(e) =>
                                    setNewWeatherProtocol({ ...newWeatherProtocol, isActive: e.target.checked })
                                }
                                id="weather-active"
                            />
                            <label htmlFor="weather-active">Active</label>
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Creating...' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};