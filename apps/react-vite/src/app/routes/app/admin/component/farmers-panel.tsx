import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useNotifications } from '@/components/ui/notifications';
import { useFarmers } from '../api/get-farmers';
import { useChangeFarmerStatus } from '../api/change-farmer-status';

export const FarmersPanel = () => {
    const { addNotification } = useNotifications();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [phoneSearch, setPhoneSearch] = useState('');
    const [farmerStatus, setFarmerStatus] = useState<'Normal' | 'Warned' | 'NotAllowed' | 'Resigned' | null>(null);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
    const [newStatus, setNewStatus] = useState<'Normal' | 'Warned' | 'NotAllowed' | 'Resigned'>('Normal');

    const { data, isLoading, error, refetch } = useFarmers({
        params: {
            search,
            phoneNumber: phoneSearch,
            farmerStatus,
            currentPage: page,
            pageSize,
        },
    });

    const changeStatusMutation = useChangeFarmerStatus({
        mutationConfig: {
            onSuccess: () => {
                addNotification?.({
                    type: 'success',
                    title: 'Success',
                    message: 'Farmer status changed successfully',
                });
                setIsStatusDialogOpen(false);
                setSelectedFarmer(null);
                setNewStatus('Normal');
                refetch();
            },
            onError: (err: any) =>
                addNotification?.({
                    type: 'error',
                    title: 'Error',
                    message: err?.message || 'Failed to change farmer status',
                }),
        },
    });

    const farmers = data?.data || [];
    const totalPages = data?.totalPages || 1;
    const hasNext = data?.hasNext || false;
    const hasPrevious = data?.hasPrevious || false;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Normal':
                return 'bg-green-100 text-green-800';
            case 'Warned':
                return 'bg-yellow-100 text-yellow-800';
            case 'NotAllowed':
                return 'bg-red-100 text-red-800';
            case 'Resigned':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleOpenStatusDialog = (farmer: any) => {
        setSelectedFarmer(farmer);
        setNewStatus(farmer.farmerStatus);
        setIsStatusDialogOpen(true);
    };

    const handleChangeStatus = () => {
        if (!selectedFarmer) return;

        changeStatusMutation.mutate({
            farmerId: selectedFarmer.farmerId,
            newStatus,
        });
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Farmers</h2>
            </div>

            {/* Search and Filter */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>Search Name/Email/Farm Code</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                className="pl-9"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoComplete="off"
                                name="filter-farmer-search-text"
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
                            name="filter-farmer-phone-query"
                            data-lpignore="true"
                            data-form-type="other"
                            onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                            readOnly
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <select
                            className="w-full h-10 px-3 rounded-md border border-gray-300"
                            value={farmerStatus || ''}
                            onChange={(e) => setFarmerStatus(e.target.value as any || null)}
                        >
                            <option value="">All Status</option>
                            <option value="Normal">Normal</option>
                            <option value="Warned">Warned</option>
                            <option value="NotAllowed">Not Allowed</option>
                            <option value="Resigned">Resigned</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading farmers...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">
                        Error loading farmers: {(error as Error).message}
                    </div>
                ) : farmers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No farmers found</div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Farm Code</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Cluster</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Plots</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Verified</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {farmers.map((farmer: any) => (
                                <tr key={farmer.farmerId} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium">{farmer.farmCode}</td>
                                    <td className="px-4 py-3 text-sm">{farmer.fullName}</td>
                                    <td className="px-4 py-3 text-sm">{farmer.email}</td>
                                    <td className="px-4 py-3 text-sm">{farmer.phoneNumber}</td>
                                    <td className="px-4 py-3 text-sm">{farmer.clusterName || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm">{farmer.plotCount}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <Badge className={getStatusColor(farmer.farmerStatus)}>
                                            {farmer.farmerStatus}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {farmer.isVerified ? (
                                            <Badge className="bg-green-100 text-green-800">Yes</Badge>
                                        ) : (
                                            <Badge className="bg-gray-100 text-gray-800">No</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenStatusDialog(farmer)}
                                        >
                                            Change Status
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {farmers.length > 0 && (
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

            {/* Change Status Dialog */}
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Farmer Status</DialogTitle>
                    </DialogHeader>
                    {selectedFarmer && (
                        <div className="space-y-4 pt-4">
                            <div className="p-3 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-600">Farmer</p>
                                <p className="font-medium">{selectedFarmer.fullName}</p>
                                <p className="text-sm text-gray-600">Current Status: {selectedFarmer.farmerStatus}</p>
                            </div>

                            <div className="space-y-2">
                                <Label>New Status *</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-gray-300"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as any)}
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="Warned">Warned</option>
                                    <option value="NotAllowed">Not Allowed</option>
                                    <option value="Resigned">Resigned</option>
                                </select>
                                <p className="text-xs text-gray-500">
                                    {newStatus === 'Normal' && 'Farmer is normal and can be grouped'}
                                    {newStatus === 'Warned' && 'Farmer has been warned due to lateness or other issues'}
                                    {newStatus === 'NotAllowed' && 'Farmer is temporarily not allowed to be grouped'}
                                    {newStatus === 'Resigned' && 'Farmer has resigned but has a chance to keep cooperating'}
                                </p>
                            </div>

                            {['NotAllowed', 'Resigned'].includes(newStatus) && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="text-sm text-yellow-800">
                                        ⚠️ Warning: All active supervisor assignments will be deactivated when changing to this status.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsStatusDialogOpen(false)}
                                    disabled={changeStatusMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleChangeStatus}
                                    disabled={changeStatusMutation.isPending}
                                >
                                    {changeStatusMutation.isPending ? 'Changing...' : 'Change Status'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};