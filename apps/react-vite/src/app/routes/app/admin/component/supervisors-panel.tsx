import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
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
import { useSupervisors } from '../api/get-supervisors';
import { useCreateSupervisor } from '../api/create-role';

export const SupervisorsPanel = () => {
    const { addNotification } = useNotifications();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchNameEmail, setSearchNameEmail] = useState('');
    const [phoneSearch, setPhoneSearch] = useState('');
    const [advancedSearch, setAdvancedSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newSupervisor, setNewSupervisor] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        maxFarmerCapacity: 100,
    });

    const { data, isLoading, error, refetch } = useSupervisors({
        params: {
            searchNameOrEmail: searchNameEmail,
            searchPhoneNumber: phoneSearch,
            advancedSearch,
            currentPage: page,
            pageSize,
        },
    });

    const createMutation = useCreateSupervisor({
        mutationConfig: {
            onSuccess: (res: any) => {
                const createdId = res?.data ?? res;
                addNotification?.({
                    type: 'success',
                    title: 'Success',
                    message: `Supervisor created${createdId ? ` (id: ${createdId})` : ''}`,
                });
                setNewSupervisor({
                    fullName: '',
                    email: '',
                    phoneNumber: '',
                    maxFarmerCapacity: 100,
                });
                setIsCreateOpen(false);
                refetch(); // Refetch the supervisors list
            },
            onError: (err: any) =>
                addNotification?.({
                    type: 'error',
                    title: 'Error',
                    message: err?.message || 'Failed to create supervisor',
                }),
        },
    });

    const supervisors = data?.data || [];
    const totalPages = data?.totalPages || 1;
    const hasNext = data?.hasNext || false;
    const hasPrevious = data?.hasPrevious || false;

    return (
        <div className="space-y-4">
            {/* Header with Create Button */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Supervisors</h2>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Supervisor
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Supervisor</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input
                                    value={newSupervisor.fullName}
                                    onChange={(e) =>
                                        setNewSupervisor({ ...newSupervisor, fullName: e.target.value })
                                    }
                                    placeholder="Enter full name"
                                    autoComplete="name"
                                    name="create-supervisor-fullname"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input
                                    type="email"
                                    value={newSupervisor.email}
                                    onChange={(e) =>
                                        setNewSupervisor({ ...newSupervisor, email: e.target.value })
                                    }
                                    placeholder="Enter email"
                                    autoComplete="email"
                                    name="create-supervisor-email"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number *</Label>
                                <Input
                                    value={newSupervisor.phoneNumber}
                                    onChange={(e) =>
                                        setNewSupervisor({ ...newSupervisor, phoneNumber: e.target.value })
                                    }
                                    placeholder="Enter phone number"
                                    autoComplete="tel"
                                    name="create-supervisor-telephone"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Farmer Capacity *</Label>
                                <Input
                                    type="number"
                                    value={newSupervisor.maxFarmerCapacity}
                                    onChange={(e) =>
                                        setNewSupervisor({
                                            ...newSupervisor,
                                            maxFarmerCapacity: parseInt(e.target.value, 10) || 0,
                                        })
                                    }
                                    placeholder="Enter max farmer capacity"
                                    autoComplete="off"
                                    name="create-supervisor-capacity"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => createMutation.mutate(newSupervisor)}
                                    disabled={createMutation.isPending}
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Search Name or Email</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                className="pl-9"
                                placeholder="Search by name or email..."
                                value={searchNameEmail}
                                onChange={(e) => setSearchNameEmail(e.target.value)}
                                autoComplete="off"
                                name="filter-supervisor-search-text"
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
                            name="filter-supervisor-phone-query"
                            data-lpignore="true"
                            data-form-type="other"
                            onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                            readOnly
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Advanced Search</Label>
                        <Input
                            placeholder="Advanced search..."
                            value={advancedSearch}
                            onChange={(e) => setAdvancedSearch(e.target.value)}
                            autoComplete="off"
                            name="filter-supervisor-advanced-query"
                            data-lpignore="true"
                            data-form-type="other"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading supervisors...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">
                        Error loading supervisors: {(error as Error).message}
                    </div>
                ) : supervisors.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No supervisors found</div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Farmer Count</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Last Activity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {supervisors.map((supervisor: any) => (
                                <tr key={supervisor.supervisorId} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm">{supervisor.fullName}</td>
                                    <td className="px-4 py-3 text-sm">{supervisor.email}</td>
                                    <td className="px-4 py-3 text-sm">{supervisor.phoneNumber}</td>
                                    <td className="px-4 py-3 text-sm">{supervisor.currentFarmerCount || 0}</td>
                                    <td className="px-4 py-3 text-sm">
                                        {supervisor.lastActivityAt
                                            ? new Date(supervisor.lastActivityAt).toLocaleDateString()
                                            : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {supervisors.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                        Page {page} of {totalPages}
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
        </div>
    );
};