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
import { useAgronomyExperts } from '../api/get-agronomy-experts';
import { useCreateAgronomyExpert } from '../api/create-role';

export const AgronomyExpertsPanel = () => {
    const { addNotification } = useNotifications();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [phoneSearch, setPhoneSearch] = useState('');
    const [freeOrAssigned, setFreeOrAssigned] = useState<boolean | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newExpert, setNewExpert] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
    });

    const { data, isLoading, error } = useAgronomyExperts({
        params: {
            search,
            phoneNumber: phoneSearch,
            freeOrAssigned,
            currentPage: page,
            pageSize,
        },
    });

    const { refetch } = useAgronomyExperts({
        params: {
            search,
            phoneNumber: phoneSearch,
            freeOrAssigned,
            currentPage: page,
            pageSize,
        },
    });

    const createMutation = useCreateAgronomyExpert({
        mutationConfig: {
            onSuccess: () => {
                addNotification?.({
                    type: 'success',
                    title: 'Success',
                    message: 'Agronomy Expert created',
                });
                setNewExpert({ fullName: '', email: '', phoneNumber: '' });
                setIsCreateOpen(false);
                refetch(); // Refetch the experts list
            },
            onError: (err: any) =>
                addNotification?.({
                    type: 'error',
                    title: 'Error',
                    message: err?.message || 'Failed to create expert',
                }),
        },
    });

    const experts = data?.data || [];
    const totalPages = data?.totalPages || 1;
    const hasNext = data?.hasNext || false;
    const hasPrevious = data?.hasPrevious || false;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Agronomy Experts</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage agronomy experts and their assignments
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Expert
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Expert</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input
                                    value={newExpert.fullName}
                                    onChange={(e) =>
                                        setNewExpert({ ...newExpert, fullName: e.target.value })
                                    }
                                    placeholder="Enter full name"
                                    autoComplete="name"
                                    name="create-expert-fullname"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input
                                    type="email"
                                    value={newExpert.email}
                                    onChange={(e) =>
                                        setNewExpert({ ...newExpert, email: e.target.value })
                                    }
                                    placeholder="Enter email"
                                    autoComplete="email"
                                    name="create-expert-email"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number *</Label>
                                <Input
                                    value={newExpert.phoneNumber}
                                    onChange={(e) =>
                                        setNewExpert({ ...newExpert, phoneNumber: e.target.value })
                                    }
                                    placeholder="Enter phone number"
                                    autoComplete="tel"
                                    name="create-expert-telephone"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => createMutation.mutate(newExpert)}
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
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoComplete="off"
                                name="filter-search-text"
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
                            name="filter-phone-query"
                            data-lpignore="true"
                            data-form-type="other"
                            onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                            readOnly
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant={freeOrAssigned === null ? 'default' : 'outline'}
                                onClick={() => setFreeOrAssigned(null)}
                            >
                                All
                            </Button>
                            <Button
                                size="sm"
                                variant={freeOrAssigned === true ? 'default' : 'outline'}
                                onClick={() => setFreeOrAssigned(true)}
                            >
                                Free
                            </Button>
                            <Button
                                size="sm"
                                variant={freeOrAssigned === false ? 'default' : 'outline'}
                                onClick={() => setFreeOrAssigned(false)}
                            >
                                Assigned
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading experts...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">
                        Error loading experts: {(error as Error).message}
                    </div>
                ) : experts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No experts found</div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Cluster</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Assigned Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {experts.map((expert: any) => (
                                <tr key={expert.expertId} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm">{expert.expertName}</td>
                                    <td className="px-4 py-3 text-sm">{expert.email}</td>
                                    <td className="px-4 py-3 text-sm">{expert.expertPhoneNumber}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${expert.clusterId
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {expert.clusterId ? 'Assigned' : 'Free'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{expert.clusterName || '-'}</td>
                                    <td className="px-4 py-3 text-sm">
                                        {expert.assignedDate
                                            ? new Date(expert.assignedDate).toLocaleDateString()
                                            : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {experts.length > 0 && (
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
        </div>
    );
};