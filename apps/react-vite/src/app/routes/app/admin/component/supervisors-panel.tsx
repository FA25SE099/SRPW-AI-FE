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
          title: 'Thành công',
          message: `Tạo giám sát viên thành công${createdId ? ` (id: ${createdId})` : ''}`,
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
          title: 'Lỗi',
          message: err?.message || 'Không thể tạo giám sát viên',
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
        <h2 className="text-2xl font-bold">Giám sát viên</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo giám sát viên
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo giám sát viên mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Họ và tên *</Label>
                <Input
                  value={newSupervisor.fullName}
                  onChange={(e) =>
                    setNewSupervisor({
                      ...newSupervisor,
                      fullName: e.target.value,
                    })
                  }
                  placeholder="Nhập họ và tên"
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
                    setNewSupervisor({
                      ...newSupervisor,
                      email: e.target.value,
                    })
                  }
                  placeholder="Nhập email"
                  autoComplete="email"
                  name="create-supervisor-email"
                />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại *</Label>
                <Input
                  value={newSupervisor.phoneNumber}
                  onChange={(e) =>
                    setNewSupervisor({
                      ...newSupervisor,
                      phoneNumber: e.target.value,
                    })
                  }
                  placeholder="Nhập số điện thoại"
                  autoComplete="tel"
                  name="create-supervisor-telephone"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={() => createMutation.mutate(newSupervisor)}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Đang tạo...' : 'Tạo'}
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
            <Label>Tìm kiếm tên hoặc email</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Tìm theo tên hoặc email..."
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
            <Label>Số điện thoại</Label>
            <Input
              placeholder="Tìm theo số điện thoại..."
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
            <Label>Tìm kiếm nâng cao</Label>
            <Input
              placeholder="Tìm kiếm nâng cao..."
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
          <div className="p-8 text-center text-gray-500">
            Đang tải giám sát viên...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Lỗi khi tải giám sát viên: {(error as Error).message}
          </div>
        ) : supervisors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không tìm thấy giám sát viên
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Tên
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Số điện thoại
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Cụm
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {supervisors.map((supervisor: any) => (
                <tr key={supervisor.supervisorId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{supervisor.fullName}</td>
                  <td className="px-4 py-3 text-sm">{supervisor.email}</td>
                  <td className="px-4 py-3 text-sm">
                    {supervisor.phoneNumber}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {supervisor.clusterName}
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
            Trang {page} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={!hasPrevious}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
