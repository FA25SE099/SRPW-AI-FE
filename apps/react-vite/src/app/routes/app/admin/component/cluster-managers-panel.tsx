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
import { useClusterManagers } from '../api/get-cluster-managers';
import { useCreateClusterManager } from '../api/create-role';

export const ClusterManagersPanel = () => {
  const { addNotification } = useNotifications();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [freeOrAssigned, setFreeOrAssigned] = useState<boolean | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newManager, setNewManager] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });

  const { data, isLoading, error, refetch } = useClusterManagers({
    params: {
      search,
      phoneNumber: phoneSearch,
      freeOrAssigned,
      currentPage: page,
      pageSize,
    },
  });

  const createMutation = useCreateClusterManager({
    mutationConfig: {
      onSuccess: () => {
        addNotification?.({
          type: 'success',
          title: 'Thành công',
          message: 'Tạo quản lý cụm thành công',
        });
        setNewManager({ fullName: '', email: '', phoneNumber: '' });
        setIsCreateOpen(false);
        refetch(); // Refetch the managers list
      },
      onError: (err: any) =>
        addNotification?.({
          type: 'error',
          title: 'Lỗi',
          message: err?.message || 'Không thể tạo quản lý cụm',
        }),
    },
  });

  const managers = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const hasNext = data?.hasNext || false;
  const hasPrevious = data?.hasPrevious || false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Quản lý cụm</h2>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý các quản lý cụm và phân công công việc
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo quản lý
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo quản lý mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={newManager.fullName}
                  onChange={(e) =>
                    setNewManager({ ...newManager, fullName: e.target.value })
                  }
                  placeholder="Enter full name"
                  autoComplete="name"
                  name="create-manager-fullname"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newManager.email}
                  onChange={(e) =>
                    setNewManager({ ...newManager, email: e.target.value })
                  }
                  placeholder="Enter email"
                  autoComplete="email"
                  name="create-manager-email"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  value={newManager.phoneNumber}
                  onChange={(e) =>
                    setNewManager({
                      ...newManager,
                      phoneNumber: e.target.value,
                    })
                  }
                  placeholder="Enter phone number"
                  autoComplete="tel"
                  name="create-manager-telephone"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createMutation.mutate(newManager)}
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
                name="filter-manager-search-text"
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
              name="filter-manager-phone-query"
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
          <div className="p-8 text-center text-gray-500">
            Loading managers...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Error loading managers: {(error as Error).message}
          </div>
        ) : managers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No managers found</div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Cluster
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Assigned Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {managers.map((manager: any) => (
                <tr key={manager.clusterManagerId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {manager.clusterManagerName}
                  </td>
                  <td className="px-4 py-3 text-sm">{manager.email}</td>
                  <td className="px-4 py-3 text-sm">
                    {manager.clusterManagerPhoneNumber}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        manager.assignedDate
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {manager.assignedDate ? 'Assigned' : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {manager.clusterName || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {manager.assignedDate
                      ? new Date(manager.assignedDate).toLocaleDateString()
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {managers.length > 0 && (
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
