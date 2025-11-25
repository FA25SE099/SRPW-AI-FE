import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUploadFiles } from '../api/get-pest-protocols';
import { Upload, X } from 'lucide-react';

type PestProtocolDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: any) => void;
    isLoading: boolean;
    newPestProtocol: {
        name: string;
        description: string;
        type: string;
        imageLinks: string[];
        notes: string;
        isActive: boolean;
    };
    setNewPestProtocol: (data: any) => void;
};

export const PestProtocolDialog = ({
    isOpen,
    onClose,
    onCreate,
    isLoading,
    newPestProtocol,
    setNewPestProtocol,
}: PestProtocolDialogProps) => {
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
            const newLinks = result.files.map((f) => f.url);
            setNewPestProtocol({
                ...newPestProtocol,
                imageLinks: [...newPestProtocol.imageLinks, ...newLinks],
            });
            setSelectedFiles([]);
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const removeImageLink = (index: number) => {
        const updatedLinks = newPestProtocol.imageLinks.filter((_, i) => i !== index);
        setNewPestProtocol({ ...newPestProtocol, imageLinks: updatedLinks });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50" onClick={onClose} />
                <div className="relative z-10 w-full max-w-2xl rounded-lg bg-white shadow-xl p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-bold mb-4">Create Pest Protocol</h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            onCreate(newPestProtocol);
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <Label>Name *</Label>
                            <Input
                                value={newPestProtocol.name}
                                onChange={(e) => setNewPestProtocol({ ...newPestProtocol, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label>Description *</Label>
                            <textarea
                                value={newPestProtocol.description}
                                onChange={(e) =>
                                    setNewPestProtocol({ ...newPestProtocol, description: e.target.value })
                                }
                                rows={3}
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <Label>Type *</Label>
                            <Input
                                value={newPestProtocol.type}
                                onChange={(e) => setNewPestProtocol({ ...newPestProtocol, type: e.target.value })}
                                required
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
                                {newPestProtocol.imageLinks.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {newPestProtocol.imageLinks.map((link, index) => (
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
                                value={newPestProtocol.notes}
                                onChange={(e) => setNewPestProtocol({ ...newPestProtocol, notes: e.target.value })}
                                rows={2}
                                className="w-full rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={newPestProtocol.isActive}
                                onChange={(e) =>
                                    setNewPestProtocol({ ...newPestProtocol, isActive: e.target.checked })
                                }
                                id="pest-active"
                            />
                            <label htmlFor="pest-active">Active</label>
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