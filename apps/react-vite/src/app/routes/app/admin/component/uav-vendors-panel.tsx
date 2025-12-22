import { useState, useEffect } from 'react';
import { Plus, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useNotifications } from '@/components/ui/notifications';
import { useUavVendors } from '../api/get-uav-vendors';
import { useUavVendorDetail } from '../api/get-uav-vendor-detail';
import { useCreateUavVendor, useUpdateUavVendor } from '../api/create-role';
import type { UavVendorDetail } from '../api/get-uav-vendor-detail';

export const UavVendorsPanel = () => {
    const { addNotification } = useNotifications();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [nameEmailSearch, setNameEmailSearch] = useState('');
    const [phoneSearch, setPhoneSearch] = useState('');
    const [groupClusterSearch, setGroupClusterSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
    const [isVendorDetailOpen, setIsVendorDetailOpen] = useState(false);
    const [isEditingVendor, setIsEditingVendor] = useState(false);
    const [editVendor, setEditVendor] = useState<(UavVendorDetail & { uavVendorId: string }) | null>(null);
    const [newVendor, setNewVendor] = useState({
        fullName: '',
        vendorName: '',
        email: '',
        phoneNumber: '',
        businessRegistrationNumber: '',
        serviceRatePerHa: 0,
        fleetSize: 0,
        serviceRadius: 0,
        equipmentSpecs: '{}',
        operatingSchedule: '{}',
    });

    const { data, isLoading, error, refetch } = useUavVendors({
        params: {
            nameEmailSearch,
            phoneNumber: phoneSearch,
            groupClusterSearch,
            currentPage: page,
            pageSize,
        },
    });

    const { data: vendorDetailResp, isLoading: loadingVendorDetail, error: vendorDetailError, refetch: refetchDetail } = useUavVendorDetail({
        vendorId: selectedVendorId,
    });

    const createMutation = useCreateUavVendor({
        mutationConfig: {
            onSuccess: (res: any) => {
                const createdId = res?.data ?? res;
                addNotification?.({
                    type: 'success',
                    title: 'Success',
                    message: `UAV Vendor created${createdId ? ` (id: ${createdId})` : ''}`,
                });
                setNewVendor({
                    fullName: '',
                    vendorName: '',
                    email: '',
                    phoneNumber: '',
                    businessRegistrationNumber: '',
                    serviceRatePerHa: 0,
                    fleetSize: 0,
                    serviceRadius: 0,
                    equipmentSpecs: '{}',
                    operatingSchedule: '{}',
                });
                setIsCreateOpen(false);
                refetch(); // Refetch the vendors list
            },
            onError: (err: any) =>
                addNotification?.({
                    type: 'error',
                    title: 'Error',
                    message: err?.message || 'Failed to create vendor',
                }),
        },
    });

    const updateMutation = useUpdateUavVendor({
        mutationConfig: {
            onSuccess: () => {
                addNotification?.({
                    type: 'success',
                    title: 'Success',
                    message: 'UAV Vendor updated successfully',
                });
                setIsEditingVendor(false);
                refetch(); // Refetch the vendors list
                refetchDetail(); // Refetch the vendor details
            },
            onError: (err: any) =>
                addNotification?.({
                    type: 'error',
                    title: 'Error',
                    message: err?.message || 'Failed to update vendor',
                }),
        },
    });

    useEffect(() => {
        if (vendorDetailResp && selectedVendorId && !editVendor) {
            let detail: UavVendorDetail | null = null;

            // Check multiple possible structures to match backup logic
            if ((vendorDetailResp as any).data?.data) {
                detail = (vendorDetailResp as any).data.data;
            } else if (vendorDetailResp.data) {
                detail = vendorDetailResp.data;
            } else {
                detail = vendorDetailResp as any;
            }

            if (detail) {
                setEditVendor({
                    uavVendorId: selectedVendorId,
                    fullName: detail.fullName || '',
                    email: detail.email || '',
                    phoneNumber: detail.phoneNumber || '',
                    vendorName: detail.vendorName || '',
                    businessRegistrationNumber: detail.businessRegistrationNumber || '',
                    serviceRatePerHa: detail.serviceRatePerHa || 0,
                    fleetSize: detail.fleetSize || 0,
                    serviceRadius: detail.serviceRadius || 0,
                    equipmentSpecs: detail.equipmentSpecs || '{}',
                    operatingSchedule: detail.operatingSchedule || '{}',
                });
            }
        }
    }, [vendorDetailResp, selectedVendorId, editVendor]);

    const vendors = data?.data || [];
    const totalPages = data?.totalPages || 1;
    const hasNext = data?.hasNext || false;
    const hasPrevious = data?.hasPrevious || false;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">UAV Vendors</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage UAV vendors and their services
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create UAV Vendor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create UAV Vendor</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    value={newVendor.fullName}
                                    onChange={(e) =>
                                        setNewVendor({ ...newVendor, fullName: e.target.value })
                                    }
                                    autoComplete="name"
                                    name="create-vendor-fullname"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Vendor Name</Label>
                                <Input
                                    value={newVendor.vendorName}
                                    onChange={(e) =>
                                        setNewVendor({ ...newVendor, vendorName: e.target.value })
                                    }
                                    autoComplete="organization"
                                    name="create-vendor-name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={newVendor.email}
                                        onChange={(e) =>
                                            setNewVendor({ ...newVendor, email: e.target.value })
                                        }
                                        autoComplete="email"
                                        name="create-vendor-email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={newVendor.phoneNumber}
                                        onChange={(e) =>
                                            setNewVendor({ ...newVendor, phoneNumber: e.target.value })
                                        }
                                        autoComplete="tel"
                                        name="create-vendor-phone"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Business Registration #</Label>
                                <Input
                                    value={newVendor.businessRegistrationNumber}
                                    onChange={(e) =>
                                        setNewVendor({ ...newVendor, businessRegistrationNumber: e.target.value })
                                    }
                                    autoComplete="off"
                                    name="create-vendor-reg"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-2">
                                    <Label>Service Rate per ha</Label>
                                    <Input
                                        type="number"
                                        value={newVendor.serviceRatePerHa}
                                        onChange={(e) =>
                                            setNewVendor({ ...newVendor, serviceRatePerHa: Number(e.target.value) })
                                        }
                                        autoComplete="off"
                                        name="create-vendor-rate"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fleet Size</Label>
                                    <Input
                                        type="number"
                                        value={newVendor.fleetSize}
                                        onChange={(e) =>
                                            setNewVendor({ ...newVendor, fleetSize: Number(e.target.value) })
                                        }
                                        autoComplete="off"
                                        name="create-vendor-fleet"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Service Radius</Label>
                                    <Input
                                        type="number"
                                        value={newVendor.serviceRadius}
                                        onChange={(e) =>
                                            setNewVendor({ ...newVendor, serviceRadius: Number(e.target.value) })
                                        }
                                        autoComplete="off"
                                        name="create-vendor-radius"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Equipment Specs (JSON)</Label>
                                <textarea
                                    className="w-full border rounded p-2"
                                    rows={3}
                                    value={newVendor.equipmentSpecs}
                                    onChange={(e) =>
                                        setNewVendor({ ...newVendor, equipmentSpecs: e.target.value })
                                    }
                                    autoComplete="off"
                                    name="create-vendor-specs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Operating Schedule (JSON)</Label>
                                <textarea
                                    className="w-full border rounded p-2"
                                    rows={2}
                                    value={newVendor.operatingSchedule}
                                    onChange={(e) =>
                                        setNewVendor({ ...newVendor, operatingSchedule: e.target.value })
                                    }
                                    autoComplete="off"
                                    name="create-vendor-schedule"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => createMutation.mutate(newVendor)}
                                    disabled={createMutation.isPending}
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Search Name or Email</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                className="pl-9"
                                placeholder="Search..."
                                value={nameEmailSearch}
                                onChange={(e) => setNameEmailSearch(e.target.value)}
                                autoComplete="off"
                                name="filter-vendor-search-text"
                                data-lpignore="true"
                                data-form-type="other"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                            placeholder="Search by phone..."
                            value={phoneSearch}
                            onChange={(e) => setPhoneSearch(e.target.value)}
                            autoComplete="off"
                            name="filter-vendor-phone-query"
                            data-lpignore="true"
                            data-form-type="other"
                            onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                            readOnly
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Group/Cluster</Label>
                        <Input
                            placeholder="Search by group/cluster..."
                            value={groupClusterSearch}
                            onChange={(e) => setGroupClusterSearch(e.target.value)}
                            autoComplete="off"
                            name="filter-vendor-group-query"
                            data-lpignore="true"
                            data-form-type="other"
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading vendors...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">
                        Error loading vendors: {(error as Error).message}
                    </div>
                ) : vendors.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No vendors found</div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Vendor Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Full Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {vendors.map((vendor: any) => (
                                <tr key={vendor.uavVendorId} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium">{vendor.vendorName || '-'}</td>
                                    <td className="px-4 py-3 text-sm">{vendor.uavVendorFullName || '-'}</td>
                                    <td className="px-4 py-3 text-sm">{vendor.email}</td>
                                    <td className="px-4 py-3 text-sm">{vendor.uavVendorPhoneNumber}</td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedVendorId(vendor.uavVendorId);
                                                setIsVendorDetailOpen(true);
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {vendors.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                        Page {page} of {totalPages} ({data?.totalCount} total)
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p - 1)}
                            disabled={!hasPrevious}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!hasNext}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Vendor Detail/Edit Dialog */}
            <Dialog
                open={isVendorDetailOpen}
                onOpenChange={(open) => {
                    setIsVendorDetailOpen(open);
                    if (!open) {
                        setSelectedVendorId(null);
                        setEditVendor(null);
                        setIsEditingVendor(false);
                    }
                }}
            >
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditingVendor ? 'Edit UAV Vendor' : 'UAV Vendor Details'}
                        </DialogTitle>
                    </DialogHeader>
                    {loadingVendorDetail ? (
                        <div className="p-4 text-center">Loading vendor details...</div>
                    ) : vendorDetailError ? (
                        <div className="p-4 text-center text-red-600">
                            Error loading vendor details
                        </div>
                    ) : !editVendor ? (
                        <div className="p-4 text-center text-red-600">
                            Failed to load vendor details
                        </div>
                    ) : isEditingVendor ? (
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    value={editVendor.fullName || ''}
                                    onChange={(e) =>
                                        setEditVendor({ ...editVendor, fullName: e.target.value })
                                    }
                                    autoComplete="name"
                                    name="edit-vendor-fullname"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Vendor Name</Label>
                                <Input
                                    value={editVendor.vendorName}
                                    onChange={(e) =>
                                        setEditVendor({ ...editVendor, vendorName: e.target.value })
                                    }
                                    autoComplete="organization"
                                    name="edit-vendor-name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={editVendor.email}
                                        onChange={(e) =>
                                            setEditVendor({ ...editVendor, email: e.target.value })
                                        }
                                        autoComplete="email"
                                        name="edit-vendor-email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={editVendor.phoneNumber}
                                        onChange={(e) =>
                                            setEditVendor({ ...editVendor, phoneNumber: e.target.value })
                                        }
                                        autoComplete="tel"
                                        name="edit-vendor-phone"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Business Registration #</Label>
                                <Input
                                    value={editVendor.businessRegistrationNumber || ''}
                                    onChange={(e) =>
                                        setEditVendor({ ...editVendor, businessRegistrationNumber: e.target.value })
                                    }
                                    autoComplete="off"
                                    name="edit-vendor-reg"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-2">
                                    <Label>Service Rate per ha</Label>
                                    <Input
                                        type="number"
                                        value={editVendor.serviceRatePerHa}
                                        onChange={(e) =>
                                            setEditVendor({ ...editVendor, serviceRatePerHa: Number(e.target.value) })
                                        }
                                        autoComplete="off"
                                        name="edit-vendor-rate"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fleet Size</Label>
                                    <Input
                                        type="number"
                                        value={editVendor.fleetSize}
                                        onChange={(e) =>
                                            setEditVendor({ ...editVendor, fleetSize: Number(e.target.value) })
                                        }
                                        autoComplete="off"
                                        name="edit-vendor-fleet"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Service Radius</Label>
                                    <Input
                                        type="number"
                                        value={editVendor.serviceRadius}
                                        onChange={(e) =>
                                            setEditVendor({ ...editVendor, serviceRadius: Number(e.target.value) })
                                        }
                                        autoComplete="off"
                                        name="edit-vendor-radius"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Equipment Specs (JSON)</Label>
                                <textarea
                                    className="w-full border rounded p-2 min-h-[80px]"
                                    value={editVendor.equipmentSpecs || ''}
                                    onChange={(e) =>
                                        setEditVendor({ ...editVendor, equipmentSpecs: e.target.value })
                                    }
                                    autoComplete="off"
                                    name="edit-vendor-specs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Operating Schedule (JSON)</Label>
                                <textarea
                                    className="w-full border rounded p-2 min-h-[60px]"
                                    value={editVendor.operatingSchedule || ''}
                                    onChange={(e) =>
                                        setEditVendor({ ...editVendor, operatingSchedule: e.target.value })
                                    }
                                    autoComplete="off"
                                    name="edit-vendor-schedule"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditingVendor(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => updateMutation.mutate({
                                        ...editVendor,
                                        fullName: editVendor.fullName || '',
                                        businessRegistrationNumber: editVendor.businessRegistrationNumber || '',
                                        equipmentSpecs: editVendor.equipmentSpecs || '{}',
                                        operatingSchedule: editVendor.operatingSchedule || '{}',
                                    })}
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-600">Full Name</Label>
                                    <div className="mt-1">{editVendor.fullName || '-'}</div>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Vendor Name</Label>
                                    <div className="mt-1">{editVendor.vendorName || '-'}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-600">Email</Label>
                                    <div className="mt-1">{editVendor.email || '-'}</div>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Phone</Label>
                                    <div className="mt-1">{editVendor.phoneNumber || '-'}</div>
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-600">Business Registration #</Label>
                                <div className="mt-1">{editVendor.businessRegistrationNumber || '-'}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-gray-600">Service Rate per ha</Label>
                                    <div className="mt-1">{editVendor.serviceRatePerHa}</div>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Fleet Size</Label>
                                    <div className="mt-1">{editVendor.fleetSize}</div>
                                </div>
                                <div>
                                    <Label className="text-gray-600">Service Radius</Label>
                                    <div className="mt-1">{editVendor.serviceRadius}</div>
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-600">Equipment Specs</Label>
                                <div className="mt-1 p-2 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
                                    {editVendor.equipmentSpecs || '-'}
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-600">Operating Schedule</Label>
                                <div className="mt-1 p-2 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
                                    {editVendor.operatingSchedule || '-'}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsVendorDetailOpen(false)}
                                >
                                    Close
                                </Button>
                                <Button onClick={() => setIsEditingVendor(true)}>
                                    Edit
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};