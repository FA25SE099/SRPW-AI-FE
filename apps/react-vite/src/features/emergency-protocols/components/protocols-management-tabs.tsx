import { useState } from 'react';
import { Plus, Search, Edit, Eye, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePestProtocols, useCreatePestProtocol, useUploadFiles } from '../api/get-pest-protocols';
import { useWeatherProtocols, useCreateWeatherProtocol } from '../api/get-weather-protocols';
import { useUpdatePestProtocol } from '../api/update-pest-protocol';
import { useUpdateWeatherProtocol } from '../api/update-weather-protocol';
import { useNotifications } from '@/components/ui/notifications';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type ActiveTab = 'pest' | 'weather';

export const ProtocolsManagementTabs = () => {
    const { addNotification } = useNotifications();
    const [activeTab, setActiveTab] = useState<ActiveTab>('pest');

    // Pest Protocol States
    const [pestPage, setPestPage] = useState(1);
    const [pestSearch, setPestSearch] = useState('');
    const [isPestCreateOpen, setIsPestCreateOpen] = useState(false);
    const [isPestDetailOpen, setIsPestDetailOpen] = useState(false);
    const [isPestEditing, setIsPestEditing] = useState(false);
    const [pestForm, setPestForm] = useState({
        id: '',
        name: '',
        description: '',
        type: '',
        imageLinks: [] as string[],
        notes: '',
        isActive: true,
    });
    const [selectedPestFiles, setSelectedPestFiles] = useState<File[]>([]);
    const [viewingPestProtocol, setViewingPestProtocol] = useState<any>(null);

    // Weather Protocol States
    const [weatherPage, setWeatherPage] = useState(1);
    const [weatherSearch, setWeatherSearch] = useState('');
    const [isWeatherCreateOpen, setIsWeatherCreateOpen] = useState(false);
    const [isWeatherDetailOpen, setIsWeatherDetailOpen] = useState(false);
    const [isWeatherEditing, setIsWeatherEditing] = useState(false);
    const [weatherForm, setWeatherForm] = useState({
        id: '',
        name: '',
        description: '',
        source: '',
        sourceLink: '',
        imageLinks: [] as string[],
        notes: '',
        isActive: true,
    });
    const [selectedWeatherFiles, setSelectedWeatherFiles] = useState<File[]>([]);
    const [viewingWeatherProtocol, setViewingWeatherProtocol] = useState<any>(null);

    const pageSize = 10;

    // Queries
    const { data: pestData, isLoading: pestLoading } = usePestProtocols({
        params: { currentPage: pestPage, pageSize, searchName: pestSearch, isActive: true },
    });

    const { data: weatherData, isLoading: weatherLoading } = useWeatherProtocols({
        params: { currentPage: weatherPage, pageSize, searchName: weatherSearch, isActive: true },
    });

    // Mutations
    const uploadFilesMutation = useUploadFiles();

    const createPestMutation = useCreatePestProtocol({
        mutationConfig: {
            onSuccess: () => {
                addNotification({ type: 'success', title: 'Success', message: 'Pest protocol created' });
                setIsPestCreateOpen(false);
                resetPestForm();
            },
            onError: (err: any) => {
                addNotification({ type: 'error', title: 'Error', message: err?.message || 'Failed to create' });
            },
        },
    });

    const updatePestMutation = useUpdatePestProtocol({
        mutationConfig: {
            onSuccess: () => {
                addNotification({
                    type: 'success',
                    title: 'Success',
                    message: 'Pest protocol updated successfully',
                });
                setViewingPestProtocol(null);
                // This will refetch the pest protocols list
            },
        },
    });

    const createWeatherMutation = useCreateWeatherProtocol({
        mutationConfig: {
            onSuccess: () => {
                addNotification({ type: 'success', title: 'Success', message: 'Weather protocol created' });
                setIsWeatherCreateOpen(false);
                resetWeatherForm();
            },
            onError: (err: any) => {
                addNotification({ type: 'error', title: 'Error', message: err?.message || 'Failed to create' });
            },
        },
    });

    const updateWeatherMutation = useUpdateWeatherProtocol({
        mutationConfig: {
            onSuccess: () => {
                addNotification({
                    type: 'success',
                    title: 'Success',
                    message: 'Weather protocol updated successfully',
                });
                setViewingWeatherProtocol(null);
                // This will refetch the weather protocols list
            },
        },
    });

    const pestProtocols = pestData?.data || [];
    const weatherProtocols = weatherData?.data || [];

    const resetPestForm = () => {
        setPestForm({ id: '', name: '', description: '', type: '', imageLinks: [], notes: '', isActive: true });
        setSelectedPestFiles([]);
    };

    const resetWeatherForm = () => {
        setWeatherForm({ id: '', name: '', description: '', source: '', sourceLink: '', imageLinks: [], notes: '', isActive: true });
        setSelectedWeatherFiles([]);
    };

    const handlePestFileUpload = async () => {
        if (selectedPestFiles.length === 0) return;
        try {
            const result = await uploadFilesMutation.mutateAsync(selectedPestFiles);
            const newLinks = result.files.map((f) => f.url);
            setPestForm({ ...pestForm, imageLinks: [...pestForm.imageLinks, ...newLinks] });
            setSelectedPestFiles([]);
        } catch (error) {
            console.error('Upload failed:', error);
            addNotification({ type: 'error', title: 'Error', message: 'Failed to upload files' });
        }
    };

    const handleWeatherFileUpload = async () => {
        if (selectedWeatherFiles.length === 0) return;
        try {
            const result = await uploadFilesMutation.mutateAsync(selectedWeatherFiles);
            const newLinks = result.files.map((f) => f.url);
            setWeatherForm({ ...weatherForm, imageLinks: [...weatherForm.imageLinks, ...newLinks] });
            setSelectedWeatherFiles([]);
        } catch (error) {
            console.error('Upload failed:', error);
            addNotification({ type: 'error', title: 'Error', message: 'Failed to upload files' });
        }
    };

    const handleViewPest = (pest: any) => {
        setPestForm({
            id: pest.id,
            name: pest.name,
            description: pest.description,
            type: pest.type,
            imageLinks: pest.imageLinks || [],
            notes: pest.notes || '',
            isActive: pest.isActive,
        });
        setIsPestDetailOpen(true);
        setIsPestEditing(false);
    };

    const handleViewWeather = (weather: any) => {
        setWeatherForm({
            id: weather.id,
            name: weather.name,
            description: weather.description,
            source: weather.source,
            sourceLink: weather.sourceLink || '',
            imageLinks: weather.imageLinks || [],
            notes: weather.notes || '',
            isActive: weather.isActive,
        });
        setIsWeatherDetailOpen(true);
        setIsWeatherEditing(false);
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('pest')}
                        className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'pest'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Pest Protocols
                    </button>
                    <button
                        onClick={() => setActiveTab('weather')}
                        className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'weather'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Weather Protocols
                    </button>
                </nav>
            </div>

            {/* Pest Protocols Tab */}
            {activeTab === 'pest' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search pest protocols..."
                                value={pestSearch}
                                onChange={(e) => setPestSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={() => setIsPestCreateOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Pest Protocol
                        </Button>
                    </div>

                    <div className="rounded-lg border bg-white overflow-hidden">
                        {pestLoading ? (
                            <div className="p-8 text-center">
                                <Spinner size="lg" />
                            </div>
                        ) : pestProtocols.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No pest protocols found</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {pestProtocols.map((protocol: any) => (
                                    <div key={protocol.id} className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex justify-between">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{protocol.name}</div>
                                                <div className="mt-1 text-sm text-gray-600">{protocol.type}</div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full ${protocol.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {protocol.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-700">
                                            {protocol.description}
                                        </div>
                                        <div className="flex gap-2 pt-4 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => setViewingPestProtocol(protocol)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Detail
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleViewPest(protocol)}
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {pestData && pestData.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Page {pestPage} of {pestData.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pestData.hasPrevious}
                                    onClick={() => setPestPage(pestPage - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pestData.hasNext}
                                    onClick={() => setPestPage(pestPage + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Pest Create Dialog */}
                    <Dialog open={isPestCreateOpen} onOpenChange={setIsPestCreateOpen}>
                        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create Pest Protocol</DialogTitle>
                            </DialogHeader>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const { id, ...data } = pestForm;
                                    createPestMutation.mutate(data);
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <Label>Name *</Label>
                                    <Input
                                        value={pestForm.name}
                                        onChange={(e) => setPestForm({ ...pestForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Type *</Label>
                                    <Input
                                        value={pestForm.type}
                                        onChange={(e) => setPestForm({ ...pestForm, type: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Description *</Label>
                                    <textarea
                                        value={pestForm.description}
                                        onChange={(e) => setPestForm({ ...pestForm, description: e.target.value })}
                                        rows={3}
                                        className="w-full rounded-md border px-3 py-2 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Images</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => setSelectedPestFiles(e.target.files ? Array.from(e.target.files) : [])}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handlePestFileUpload}
                                            disabled={selectedPestFiles.length === 0 || uploadFilesMutation.isPending}
                                            size="sm"
                                        >
                                            <Upload className="h-4 w-4 mr-1" />
                                            {uploadFilesMutation.isPending ? 'Uploading...' : 'Upload'}
                                        </Button>
                                    </div>
                                    {selectedPestFiles.length > 0 && (
                                        <p className="text-xs text-gray-600 mt-1">
                                            {selectedPestFiles.length} file(s) selected
                                        </p>
                                    )}
                                    {pestForm.imageLinks.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            {pestForm.imageLinks.map((link, idx) => (
                                                <div key={idx} className="relative group">
                                                    <img src={link} alt="" className="w-full h-24 object-cover rounded border" />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPestForm({
                                                                ...pestForm,
                                                                imageLinks: pestForm.imageLinks.filter((_, i) => i !== idx),
                                                            })
                                                        }
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label>Notes</Label>
                                    <textarea
                                        value={pestForm.notes}
                                        onChange={(e) => setPestForm({ ...pestForm, notes: e.target.value })}
                                        rows={2}
                                        className="w-full rounded-md border px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={pestForm.isActive}
                                        onChange={(e) => setPestForm({ ...pestForm, isActive: e.target.checked })}
                                        id="pest-active"
                                    />
                                    <label htmlFor="pest-active">Active</label>
                                </div>
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button type="button" variant="outline" onClick={() => setIsPestCreateOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createPestMutation.isPending}>
                                        {createPestMutation.isPending ? 'Creating...' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Pest Detail/Edit Dialog */}
                    <Dialog
                        open={isPestDetailOpen}
                        onOpenChange={(open) => {
                            setIsPestDetailOpen(open);
                            if (!open) {
                                setIsPestEditing(false);
                                resetPestForm();
                            }
                        }}
                    >
                        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{isPestEditing ? 'Edit Pest Protocol' : 'Pest Protocol Details'}</DialogTitle>
                            </DialogHeader>
                            {isPestEditing ? (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        updatePestMutation.mutate(pestForm);
                                    }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <Label>Name *</Label>
                                        <Input
                                            value={pestForm.name}
                                            onChange={(e) => setPestForm({ ...pestForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Type *</Label>
                                        <Input
                                            value={pestForm.type}
                                            onChange={(e) => setPestForm({ ...pestForm, type: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Description *</Label>
                                        <textarea
                                            value={pestForm.description}
                                            onChange={(e) => setPestForm({ ...pestForm, description: e.target.value })}
                                            rows={3}
                                            className="w-full rounded-md border px-3 py-2 text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Images</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => setSelectedPestFiles(e.target.files ? Array.from(e.target.files) : [])}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handlePestFileUpload}
                                                disabled={selectedPestFiles.length === 0 || uploadFilesMutation.isPending}
                                                size="sm"
                                            >
                                                <Upload className="h-4 w-4 mr-1" />
                                                {uploadFilesMutation.isPending ? 'Uploading...' : 'Upload'}
                                            </Button>
                                        </div>
                                        {selectedPestFiles.length > 0 && (
                                            <p className="text-xs text-gray-600 mt-1">
                                                {selectedPestFiles.length} file(s) selected
                                            </p>
                                        )}
                                        {pestForm.imageLinks.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                {pestForm.imageLinks.map((link, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <img src={link} alt="" className="w-full h-24 object-cover rounded border" />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setPestForm({
                                                                    ...pestForm,
                                                                    imageLinks: pestForm.imageLinks.filter((_, i) => i !== idx),
                                                                })
                                                            }
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Notes</Label>
                                        <textarea
                                            value={pestForm.notes}
                                            onChange={(e) => setPestForm({ ...pestForm, notes: e.target.value })}
                                            rows={2}
                                            className="w-full rounded-md border px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={pestForm.isActive}
                                            onChange={(e) => setPestForm({ ...pestForm, isActive: e.target.checked })}
                                            id="pest-active-edit"
                                        />
                                        <label htmlFor="pest-active-edit">Active</label>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                        <Button type="button" variant="outline" onClick={() => setIsPestEditing(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={updatePestMutation.isPending}>
                                            {updatePestMutation.isPending ? 'Saving...' : 'Save'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-gray-600">Name</Label>
                                        <div className="mt-1 font-medium">{pestForm.name}</div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Type</Label>
                                        <div className="mt-1">{pestForm.type}</div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Description</Label>
                                        <div className="mt-1">{pestForm.description}</div>
                                    </div>
                                    {pestForm.imageLinks.length > 0 && (
                                        <div>
                                            <Label className="text-gray-600">Images</Label>
                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                {pestForm.imageLinks.map((link, idx) => (
                                                    <img key={idx} src={link} alt="" className="w-full h-24 object-cover rounded border" />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <Label className="text-gray-600">Notes</Label>
                                        <div className="mt-1">{pestForm.notes || '-'}</div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Status</Label>
                                        <div className="mt-1">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${pestForm.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {pestForm.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                        <Button variant="outline" onClick={() => setIsPestDetailOpen(false)}>
                                            Close
                                        </Button>
                                        <Button onClick={() => setIsPestEditing(true)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Viewing Pest Protocol Dialog */}
                    <Dialog
                        open={!!viewingPestProtocol}
                        onOpenChange={(open) => {
                            setViewingPestProtocol(open ? viewingPestProtocol : null);
                        }}
                    >
                        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Pest Protocol Details</DialogTitle>
                            </DialogHeader>
                            {viewingPestProtocol && (
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-gray-600">Name</Label>
                                        <div className="mt-1 font-medium">{viewingPestProtocol.name}</div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Type</Label>
                                        <div className="mt-1">{viewingPestProtocol.type}</div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Description</Label>
                                        <div className="mt-1">{viewingPestProtocol.description}</div>
                                    </div>
                                    {viewingPestProtocol.imageLinks.length > 0 && (
                                        <div>
                                            <Label className="text-gray-600">Images</Label>
                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                {viewingPestProtocol.imageLinks.map((link: string, idx: number) => (
                                                    <img key={idx} src={link} alt="" className="w-full h-24 object-cover rounded border" />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <Label className="text-gray-600">Notes</Label>
                                        <div className="mt-1">{viewingPestProtocol.notes || '-'}</div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Status</Label>
                                        <div className="mt-1">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${viewingPestProtocol.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {viewingPestProtocol.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                        <Button variant="outline" onClick={() => setViewingPestProtocol(null)}>
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {/* Weather Protocols Tab */}
            {activeTab === 'weather' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search weather protocols..."
                                value={weatherSearch}
                                onChange={(e) => setWeatherSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={() => setIsWeatherCreateOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Weather Protocol
                        </Button>
                    </div>

                    <div className="rounded-lg border bg-white overflow-hidden">
                        {weatherLoading ? (
                            <div className="p-8 text-center">
                                <Spinner size="lg" />
                            </div>
                        ) : weatherProtocols.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No weather protocols found</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {weatherProtocols.map((weather: any) => (
                                    <div key={weather.id} className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                                    {weather.name}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2">{weather.description}</p>
                                                {weather.source && (
                                                    <p className="text-xs text-gray-500">Source: {weather.source}</p>
                                                )}
                                            </div>
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${weather.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {weather.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        {weather.imageLinks && weather.imageLinks.length > 0 && (
                                            <div className="mb-4">
                                                <img
                                                    src={weather.imageLinks[0]}
                                                    alt={weather.name}
                                                    className="w-full h-32 object-cover rounded-md"
                                                />
                                            </div>
                                        )}

                                        {weather.notes && (
                                            <p className="text-sm text-gray-600 mb-4 italic">{weather.notes}</p>
                                        )}

                                        <div className="flex gap-2 pt-4 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleViewWeather(weather)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Detail
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {weatherData && weatherData.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Page {weatherPage} of {weatherData.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!weatherData.hasPrevious}
                                    onClick={() => setWeatherPage(weatherPage - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!weatherData.hasNext}
                                    onClick={() => setWeatherPage(weatherPage + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Weather Create Dialog */}
                    <Dialog open={isWeatherCreateOpen} onOpenChange={setIsWeatherCreateOpen}>
                        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create Weather Protocol</DialogTitle>
                            </DialogHeader>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const { id, ...data } = weatherForm;
                                    createWeatherMutation.mutate(data);
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <Label>Name *</Label>
                                    <Input
                                        value={weatherForm.name}
                                        onChange={(e) => setWeatherForm({ ...weatherForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Source *</Label>
                                    <Input
                                        value={weatherForm.source}
                                        onChange={(e) => setWeatherForm({ ...weatherForm, source: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Source Link</Label>
                                    <Input
                                        value={weatherForm.sourceLink}
                                        onChange={(e) => setWeatherForm({ ...weatherForm, sourceLink: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Description *</Label>
                                    <textarea
                                        value={weatherForm.description}
                                        onChange={(e) => setWeatherForm({ ...weatherForm, description: e.target.value })}
                                        rows={3}
                                        className="w-full rounded-md border px-3 py-2 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Images</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => setSelectedWeatherFiles(e.target.files ? Array.from(e.target.files) : [])}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleWeatherFileUpload}
                                            disabled={selectedWeatherFiles.length === 0 || uploadFilesMutation.isPending}
                                            size="sm"
                                        >
                                            <Upload className="h-4 w-4 mr-1" />
                                            {uploadFilesMutation.isPending ? 'Uploading...' : 'Upload'}
                                        </Button>
                                    </div>
                                    {selectedWeatherFiles.length > 0 && (
                                        <p className="text-xs text-gray-600 mt-1">
                                            {selectedWeatherFiles.length} file(s) selected
                                        </p>
                                    )}
                                    {weatherForm.imageLinks.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            {weatherForm.imageLinks.map((link, idx) => (
                                                <div key={idx} className="relative group">
                                                    <img src={link} alt="" className="w-full h-24 object-cover rounded border" />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setWeatherForm({
                                                                ...weatherForm,
                                                                imageLinks: weatherForm.imageLinks.filter((_, i) => i !== idx),
                                                            })
                                                        }
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label>Notes</Label>
                                    <textarea
                                        value={weatherForm.notes}
                                        onChange={(e) => setWeatherForm({ ...weatherForm, notes: e.target.value })}
                                        rows={2}
                                        className="w-full rounded-md border px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={weatherForm.isActive}
                                        onChange={(e) => setWeatherForm({ ...weatherForm, isActive: e.target.checked })}
                                        id="weather-active"
                                    />
                                    <label htmlFor="weather-active">Active</label>
                                </div>
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button type="button" variant="outline" onClick={() => setIsWeatherCreateOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createWeatherMutation.isPending}>
                                        {createWeatherMutation.isPending ? 'Creating...' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Weather Detail/Edit Dialog */}
                    <Dialog
                        open={isWeatherDetailOpen}
                        onOpenChange={(open) => {
                            setIsWeatherDetailOpen(open);
                            if (!open) {
                                setIsWeatherEditing(false);
                                resetWeatherForm();
                            }
                        }}
                    >
                        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{isWeatherEditing ? 'Edit Weather Protocol' : 'Weather Protocol Details'}</DialogTitle>
                            </DialogHeader>
                            {isWeatherEditing ? (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        updateWeatherMutation.mutate(weatherForm);
                                    }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <Label>Name *</Label>
                                        <Input
                                            value={weatherForm.name}
                                            onChange={(e) => setWeatherForm({ ...weatherForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Source *</Label>
                                        <Input
                                            value={weatherForm.source}
                                            onChange={(e) => setWeatherForm({ ...weatherForm, source: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Source Link</Label>
                                        <Input
                                            value={weatherForm.sourceLink}
                                            onChange={(e) => setWeatherForm({ ...weatherForm, sourceLink: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Description *</Label>
                                        <textarea
                                            value={weatherForm.description}
                                            onChange={(e) => setWeatherForm({ ...weatherForm, description: e.target.value })}
                                            rows={3}
                                            className="w-full rounded-md border px-3 py-2 text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Images</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => setSelectedWeatherFiles(e.target.files ? Array.from(e.target.files) : [])}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleWeatherFileUpload}
                                                disabled={selectedWeatherFiles.length === 0 || uploadFilesMutation.isPending}
                                                size="sm"
                                            >
                                                <Upload className="h-4 w-4 mr-1" />
                                                {uploadFilesMutation.isPending ? 'Uploading...' : 'Upload'}
                                            </Button>
                                        </div>
                                        {selectedWeatherFiles.length > 0 && (
                                            <p className="text-xs text-gray-600 mt-1">
                                                {selectedWeatherFiles.length} file(s) selected
                                            </p>
                                        )}
                                        {weatherForm.imageLinks.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                {weatherForm.imageLinks.map((link, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <img src={link} alt="" className="w-full h-24 object-cover rounded border" />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setWeatherForm({
                                                                    ...weatherForm,
                                                                    imageLinks: weatherForm.imageLinks.filter((_, i) => i !== idx),
                                                                })
                                                            }
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Notes</Label>
                                        <textarea
                                            value={weatherForm.notes}
                                            onChange={(e) => setWeatherForm({ ...weatherForm, notes: e.target.value })}
                                            rows={2}
                                            className="w-full rounded-md border px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={weatherForm.isActive}
                                            onChange={(e) => setWeatherForm({ ...weatherForm, isActive: e.target.checked })}
                                            id="weather-active-edit"
                                        />
                                        <label htmlFor="weather-active-edit">Active</label>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                        <Button type="button" variant="outline" onClick={() => setIsWeatherEditing(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={updateWeatherMutation.isPending}>
                                            {updateWeatherMutation.isPending ? 'Saving...' : 'Save'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-gray-600">Name</Label>
                                        <div className="mt-1 font-medium">{weatherForm.name}</div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Source</Label>
                                        <div className="mt-1">{weatherForm.source}</div>
                                    </div>
                                    {weatherForm.sourceLink && (
                                        <div>
                                            <Label className="text-gray-600">Source Link</Label>
                                            <div className="mt-1">
                                                <a href={weatherForm.sourceLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    {weatherForm.sourceLink}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <Label className="text-gray-600">Description</Label>
                                        <div className="mt-1">{weatherForm.description}</div>
                                    </div>
                                    {weatherForm.imageLinks.length > 0 && (
                                        <div>
                                            <Label className="text-gray-600">Images</Label>
                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                {weatherForm.imageLinks.map((link, idx) => (
                                                    <img key={idx} src={link} alt="" className="w-full h-24 object-cover rounded border" />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <Label className="text-gray-600">Notes</Label>
                                        <div className="mt-1">{weatherForm.notes || '-'}</div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Status</Label>
                                        <div className="mt-1">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${weatherForm.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {weatherForm.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                        <Button variant="outline" onClick={() => setIsWeatherDetailOpen(false)}>
                                            Close
                                        </Button>
                                        <Button onClick={() => setIsWeatherEditing(true)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Viewing Weather Protocol Dialog */}
                    <Dialog
                        open={!!viewingWeatherProtocol}
                        onOpenChange={(open) => {
                            setViewingWeatherProtocol(open ? viewingWeatherProtocol : null);
                        }}
                    >
                        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Weather Protocol Details</DialogTitle>
                            </DialogHeader>
                            {viewingWeatherProtocol && (
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-gray-600">Name</Label>
                                        <div className="mt-1 font-medium">{viewingWeatherProtocol.name}</div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Source</Label>
                                        <div className="mt-1">{viewingWeatherProtocol.source}</div>
                                    </div>
                                    {viewingWeatherProtocol.sourceLink && (
                                        <div>
                                            <Label className="text-gray-600">Source Link</Label>
                                            <div className="mt-1">
                                                <a href={viewingWeatherProtocol.sourceLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    {viewingWeatherProtocol.sourceLink}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <Label className="text-gray-600">Description</Label>
                                        <div className="mt-1">{viewingWeatherProtocol.description}</div>
                                    </div>
                                    {viewingWeatherProtocol.imageLinks.length > 0 && (
                                        <div>
                                            <Label className="text-gray-600">Images</Label>
                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                {viewingWeatherProtocol.imageLinks.map((link: string, idx: number) => (
                                                    <img key={idx} src={link} alt="" className="w-full h-24 object-cover rounded border" />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <Label className="text-gray-600">Notes</Label>
                                        <div className="mt-1">{viewingWeatherProtocol.notes || '-'}</div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">Status</Label>
                                        <div className="mt-1">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${viewingWeatherProtocol.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {viewingWeatherProtocol.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                        <Button variant="outline" onClick={() => setViewingWeatherProtocol(null)}>
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    );
};