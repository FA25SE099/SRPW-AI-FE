import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api-client';
import { ContentLayout } from '@/components/layouts';

type User = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  lastActivityAt: string | null;
};

const USER_ROLES = [
  { value: '', label: 'All Roles' },
  { value: 'Admin', label: 'Admin' },
  { value: 'ClusterManager', label: 'Cluster Manager' },
  { value: 'Supervisor', label: 'Supervisor' },
  { value: 'Farmer', label: 'Farmer' },
  { value: 'AgronomyExpert', label: 'Agronomy Expert' },
  { value: 'UavVendor', label: 'UAV Vendor' },
];

enum SortBy {
  NameAscending = 'NameAscending',
  NameDescending = 'NameDescending',
}

const AdminUsersRoute = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchEmailAndName, setSearchEmailAndName] = useState('');
  const [searchPhoneNumber, setSearchPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.NameAscending);

  // Query to fetch users
  const {
    data: usersResp,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'users',
      currentPage,
      pageSize,
      searchEmailAndName,
      searchPhoneNumber,
      selectedRole,
      isActiveFilter,
      sortBy,
    ],
    queryFn: async () =>
      api.post('/Admin/users', {
        currentPage,
        pageSize,
        searchEmailAndName,
        searchPhoneNumber,
        role: selectedRole,
        isActive: isActiveFilter,
        sortBy,
      }),
  });

  const users: User[] = usersResp?.data || [];
  const totalPages = usersResp?.data?.totalPages || 1;
  const hasNext = usersResp?.data?.hasNext || false;
  const hasPrevious = usersResp?.data?.hasPrevious || false;
  const totalCount = usersResp?.data?.totalCount || 0;

  const toggleSort = () => {
    setSortBy((prev) =>
      prev === SortBy.NameAscending
        ? SortBy.NameDescending
        : SortBy.NameAscending
    );
    setCurrentPage(1);
  };

  return (
    <ContentLayout title="Users Management">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              All Users
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage and view all system users
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="relative md:col-span-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name or email"
                value={searchEmailAndName}
                onChange={(e) => {
                  setSearchEmailAndName(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>

            <div className="relative md:col-span-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by phone number"
                value={searchPhoneNumber}
                onChange={(e) => {
                  setSearchPhoneNumber(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>

            <div className="md:col-span-2">
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {USER_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 flex gap-2">
              <Button
                size="sm"
                variant={isActiveFilter === null ? 'default' : 'outline'}
                onClick={() => {
                  setIsActiveFilter(null);
                  setCurrentPage(1);
                }}
              >
                All Status
              </Button>
              <Button
                size="sm"
                variant={isActiveFilter === true ? 'default' : 'outline'}
                onClick={() => {
                  setIsActiveFilter(true);
                  setCurrentPage(1);
                }}
              >
                Active
              </Button>
              <Button
                size="sm"
                variant={isActiveFilter === false ? 'default' : 'outline'}
                onClick={() => {
                  setIsActiveFilter(false);
                  setCurrentPage(1);
                }}
              >
                Inactive
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading users...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Error loading users. Please try again.
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={toggleSort}
                          className="flex items-center gap-1 hover:text-gray-700"
                        >
                          Full Name
                          <ArrowUpDown className="h-3 w-3" />
                          <span className="text-xs normal-case text-gray-400">
                            ({sortBy === SortBy.NameAscending ? 'A-Z' : 'Z-A'})
                          </span>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verified
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Activity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </div>
                          {user.address && (
                            <div className="text-xs text-gray-500">
                              {user.address}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {user.phoneNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {user.lastActivityAt
                              ? new Date(
                                user.lastActivityAt,
                              ).toLocaleDateString()
                              : '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {users.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                      disabled={!hasPrevious || isLoading}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!hasNext || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Total: {totalCount} users
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ContentLayout>
  );
};

export default AdminUsersRoute;