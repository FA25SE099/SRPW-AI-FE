import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Eye } from 'lucide-react';
import { ContentLayout } from '@/components/layouts';
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
import { api } from '@/lib/api-client';

type Supervisor = {
  supervisorId: string;
  fullName: string;
  email: string;
  address?: string | null;
  phoneNumber: string;
  currentFarmerCount?: number;
  lastActivityAt?: string | null;
};

type ClusterManager = {
  clusterManagerId: string;
  clusterManagerName: string;
  clusterManagerPhoneNumber: string;
  email: string;
  clusterId: string | null;
  clusterName: string | null;
  assignedDate: string | null;
};

type AgronomyExpert = {
  expertId: string;
  expertName: string;
  expertPhoneNumber: string;
  email: string;
  clusterId: string | null;
  clusterName: string | null;
  assignedDate: string | null;
};

type UavVendor = {
  uavVendorId: string;
  uavVendorFullName: string | null;
  vendorName: string;
  uavVendorPhoneNumber: string;
  email: string;
};

type UavVendorDetail = {
  fullName: string | null;
  email: string;
  phoneNumber: string;
  vendorName: string;
  businessRegistrationNumber: string | null;
  serviceRatePerHa: number;
  fleetSize: number;
  serviceRadius: number;
  equipmentSpecs: string | null;
  operatingSchedule: string | null;
};

const RolesManager = () => {
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  // active role (default landing list is supervisors)
  const [activeRole, setActiveRole] = useState<
    'supervisors' | 'managers' | 'experts' | 'vendors'
  >('supervisors');

  // pagination
  const [supervisorPage, setSupervisorPage] = useState(1);
  const [managerPage, setManagerPage] = useState(1);
  const [expertPage, setExpertPage] = useState(1);
  const [vendorPage, setVendorPage] = useState(1);
  const [pageSize] = useState(10);

  // Supervisors search + create
  const [supervisorsSearchNameEmail, setSupervisorsSearchNameEmail] =
    useState('');
  const [supervisorsPhoneSearch, setSupervisorsPhoneSearch] = useState('');
  const [supervisorsAdvancedSearch, setSupervisorsAdvancedSearch] =
    useState('');
  const [isCreateSupervisorOpen, setIsCreateSupervisorOpen] = useState(false);
  const [newSupervisor, setNewSupervisor] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    maxFarmerCapacity: 100,
  });

  // Managers search + create
  const [managersSearch, setManagersSearch] = useState('');
  const [managersPhoneSearch, setManagersPhoneSearch] = useState('');
  const [managersFreeOrAssigned, setManagersFreeOrAssigned] = useState<
    boolean | null
  >(null);
  const [isCreateManagerOpen, setIsCreateManagerOpen] = useState(false);
  const [newManager, setNewManager] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });

  // Experts search + create
  const [expertsSearch, setExpertsSearch] = useState('');
  const [expertsPhoneSearch, setExpertsPhoneSearch] = useState('');
  const [expertsFreeOrAssigned, setExpertsFreeOrAssigned] = useState<
    boolean | null
  >(null);
  const [isCreateExpertOpen, setIsCreateExpertOpen] = useState(false);
  const [newExpert, setNewExpert] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });

  // Vendors search + create + detail/edit
  const [vendorsNameEmailSearch, setVendorsNameEmailSearch] = useState('');
  const [vendorsGroupClusterSearch, setVendorsGroupClusterSearch] =
    useState('');
  const [vendorsPhoneSearch, setVendorsPhoneSearch] = useState('');
  const [isCreateVendorOpen, setIsCreateVendorOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [isVendorDetailOpen, setIsVendorDetailOpen] = useState(false);
  const [isEditingVendor, setIsEditingVendor] = useState(false);
  const [editVendor, setEditVendor] = useState<UavVendorDetail & { uavVendorId: string } | null>(null);
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

  // Queries
  const {
    data: supervisorsResp,
    isLoading: loadingSupervisors,
    error: supervisorsError,
  } = useQuery({
    queryKey: [
      'supervisors',
      supervisorPage,
      pageSize,
      supervisorsSearchNameEmail,
      supervisorsPhoneSearch,
      supervisorsAdvancedSearch,
    ],
    queryFn: async () =>
      api.post('/Supervisor/get-all-supervisor-admin', {
        searchNameOrEmail: supervisorsSearchNameEmail,
        searchPhoneNumber: supervisorsPhoneSearch,
        advancedSearch: supervisorsAdvancedSearch,
        currentPage: supervisorPage,
        pageSize,
      }),
    enabled: activeRole === 'supervisors',
  });

  const {
    data: managersResp,
    isLoading: loadingManagers,
    error: managersError,
  } = useQuery({
    queryKey: [
      'cluster-managers',
      managerPage,
      pageSize,
      managersSearch,
      managersPhoneSearch,
      managersFreeOrAssigned,
    ],
    queryFn: async () =>
      api.post('/ClusterManager/get-all', {
        currentPage: managerPage,
        pageSize,
        search: managersSearch,
        phoneNumber: managersPhoneSearch,
        freeOrAssigned: managersFreeOrAssigned,
      }),
    enabled: activeRole === 'managers',
  });

  const {
    data: expertsResp,
    isLoading: loadingExperts,
    error: expertsError,
  } = useQuery({
    queryKey: [
      'agronomy-experts',
      expertPage,
      pageSize,
      expertsSearch,
      expertsPhoneSearch,
      expertsFreeOrAssigned,
    ],
    queryFn: async () =>
      api.post('/AgronomyExpert/get-all', {
        currentPage: expertPage,
        pageSize,
        search: expertsSearch,
        phoneNumber: expertsPhoneSearch,
        freeOrAssigned: expertsFreeOrAssigned,
      }),
    enabled: activeRole === 'experts',
  });

  const {
    data: vendorsResp,
    isLoading: loadingVendors,
    error: vendorsError,
  } = useQuery({
    queryKey: [
      'uav-vendors',
      vendorPage,
      pageSize,
      vendorsNameEmailSearch,
      vendorsGroupClusterSearch,
      vendorsPhoneSearch,
    ],
    queryFn: async () =>
      api.post('/UavVendor/get-all', {
        currentPage: vendorPage,
        pageSize,
        nameEmailSearch: vendorsNameEmailSearch,
        groupClusterSearch: vendorsGroupClusterSearch,
        phoneNumber: vendorsPhoneSearch,
      }),
    enabled: activeRole === 'vendors',
  });

  // Query for vendor detail
  const {
    data: vendorDetailResp,
    isLoading: loadingVendorDetail,
    error: vendorDetailError,
  } = useQuery({
    queryKey: ['uav-vendor-detail', selectedVendorId],
    queryFn: async () => {
      console.log('Fetching vendor detail for:', selectedVendorId);
      const formData = new FormData();
      formData.append('UavVendorId', selectedVendorId!);

      try {
        const response = await api.post('/UavVendor/get-by-id', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Vendor detail response:', response);
        return response;
      } catch (error) {
        console.error('Error fetching vendor detail:', error);
        throw error;
      }
    },
    enabled: !!selectedVendorId,
  });

  // Mutations
  const createSupervisorMutation = useMutation({
    mutationFn: (payload: typeof newSupervisor) =>
      api.post('/Supervisor', payload),
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
      setIsCreateSupervisorOpen(false);
      queryClient.invalidateQueries({ queryKey: ['supervisors'] });
    },
    onError: (err: any) =>
      addNotification?.({
        type: 'error',
        title: 'Error',
        message: err?.message || 'Failed to create supervisor',
      }),
  });

  const createManagerMutation = useMutation({
    mutationFn: (payload: typeof newManager) =>
      api.post('/ClusterManager', payload),
    onSuccess: () => {
      addNotification?.({
        type: 'success',
        title: 'Success',
        message: 'Cluster Manager created',
      });
      setNewManager({ fullName: '', email: '', phoneNumber: '' });
      setIsCreateManagerOpen(false);
      queryClient.invalidateQueries({ queryKey: ['cluster-managers'] });
    },
    onError: (err: any) =>
      addNotification?.({
        type: 'error',
        title: 'Error',
        message: err?.message || 'Failed to create manager',
      }),
  });

  const createExpertMutation = useMutation({
    mutationFn: (payload: typeof newExpert) =>
      api.post('/AgronomyExpert', payload),
    onSuccess: () => {
      addNotification?.({
        type: 'success',
        title: 'Success',
        message: 'Agronomy Expert created',
      });
      setNewExpert({ fullName: '', email: '', phoneNumber: '' });
      setIsCreateExpertOpen(false);
      queryClient.invalidateQueries({ queryKey: ['agronomy-experts'] });
    },
    onError: (err: any) =>
      addNotification?.({
        type: 'error',
        title: 'Error',
        message: err?.message || 'Failed to create expert',
      }),
  });

  const createVendorMutation = useMutation({
    mutationFn: (payload: any) => api.post('/UavVendor', payload),
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
      setIsCreateVendorOpen(false);
      queryClient.invalidateQueries({ queryKey: ['uav-vendors'] });
    },
    onError: (err: any) =>
      addNotification?.({
        type: 'error',
        title: 'Error',
        message: err?.message || 'Failed to create vendor',
      }),
  });

  // Update the updateVendorMutation
  const updateVendorMutation = useMutation({
    mutationFn: (payload: any) => api.put('/UavVendor', payload),
    onSuccess: () => {
      addNotification?.({
        type: 'success',
        title: 'Success',
        message: 'UAV Vendor updated successfully',
      });
      // Don't close the dialog, just switch back to view mode
      setIsEditingVendor(false);
      // Refresh the vendor list and detail
      queryClient.invalidateQueries({ queryKey: ['uav-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['uav-vendor-detail', selectedVendorId] });
    },
    onError: (err: any) =>
      addNotification?.({
        type: 'error',
        title: 'Error',
        message: err?.message || 'Failed to update vendor',
      }),
  });

  // helpers
  const supervisors: Supervisor[] = supervisorsResp?.data || [];
  const supervisorTotalPages = supervisorsResp?.totalPages || 1;
  const supervisorHasNext = supervisorsResp?.hasNext || false;
  const supervisorHasPrevious = supervisorsResp?.hasPrevious || false;

  const managers: ClusterManager[] = managersResp?.data || [];
  const managerTotalPages = managersResp?.totalPages || 1;
  const managerHasNext = managersResp?.hasNext || false;
  const managerHasPrevious = managersResp?.hasPrevious || false;

  const experts: AgronomyExpert[] = expertsResp?.data || [];
  const expertTotalPages = expertsResp?.totalPages || 1;
  const expertHasNext = expertsResp?.hasNext || false;
  const expertHasPrevious = expertsResp?.hasPrevious || false;

  const vendors: UavVendor[] = vendorsResp?.data || [];
  const vendorTotalPages = vendorsResp?.totalPages || 1;
  const vendorHasNext = vendorsResp?.hasNext || false;
  const vendorHasPrevious = vendorsResp?.hasPrevious || false;

  // Update the useEffect that loads vendor detail
  React.useEffect(() => {
    console.log('useEffect triggered', { vendorDetailResp, selectedVendorId, vendorDetailError });

    if (vendorDetailResp && selectedVendorId && !editVendor) {
      console.log('Full vendor detail response:', vendorDetailResp);

      // Try different response structures
      let detail: UavVendorDetail | null = null;

      // Check multiple possible structures
      if (vendorDetailResp.data?.data) {
        detail = vendorDetailResp.data.data;
        console.log('Found detail at data.data');
      } else if (vendorDetailResp.data) {
        detail = vendorDetailResp.data;
        console.log('Found detail at data');
      } else if (vendorDetailResp) {
        detail = vendorDetailResp as any;
        console.log('Using response directly');
      }

      console.log('Extracted detail:', detail);

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
      } else {
        console.error('Could not extract vendor detail from response');
      }
    }

    if (vendorDetailError) {
      console.error('Vendor detail query error:', vendorDetailError);
    }
  }, [vendorDetailResp, selectedVendorId, vendorDetailError]);

  return (
    <ContentLayout title="Management Roles">
      <div className="space-y-6">
        {/* Role Selection Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            className={`border rounded-lg p-6 text-left hover:shadow-md transition-shadow ${activeRole === 'supervisors'
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'bg-white'
              }`}
            onClick={() => setActiveRole('supervisors')}
          >
            <div className="font-semibold text-lg">Supervisors</div>
            <div className="text-sm text-gray-500 mt-1">
              Create and manage supervisors
            </div>
          </button>

          <button
            className={`border rounded-lg p-6 text-left hover:shadow-md transition-shadow ${activeRole === 'managers'
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'bg-white'
              }`}
            onClick={() => setActiveRole('managers')}
          >
            <div className="font-semibold text-lg">Cluster Managers</div>
            <div className="text-sm text-gray-500 mt-1">
              Create and assign managers
            </div>
          </button>

          <button
            className={`border rounded-lg p-6 text-left hover:shadow-md transition-shadow ${activeRole === 'experts'
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'bg-white'
              }`}
            onClick={() => setActiveRole('experts')}
          >
            <div className="font-semibold text-lg">Agronomy Experts</div>
            <div className="text-sm text-gray-500 mt-1">
              Create and assign experts
            </div>
          </button>

          <button
            className={`border rounded-lg p-6 text-left hover:shadow-md transition-shadow ${activeRole === 'vendors'
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'bg-white'
              }`}
            onClick={() => setActiveRole('vendors')}
          >
            <div className="font-semibold text-lg">UAV Vendors</div>
            <div className="text-sm text-gray-500 mt-1">
              Create and manage UAV vendors
            </div>
          </button>
        </div>

        {/* Supervisors Panel */}
        {activeRole === 'supervisors' && (
          <div className="space-y-4">
            {/* Header with Create Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Supervisors
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Manage field supervisors and their capacities
                </p>
              </div>
              <Dialog
                open={isCreateSupervisorOpen}
                onOpenChange={setIsCreateSupervisorOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    Create Supervisor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Supervisor</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      createSupervisorMutation.mutate(newSupervisor);
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>Full name *</Label>
                      <Input
                        value={newSupervisor.fullName}
                        onChange={(e) =>
                          setNewSupervisor({
                            ...newSupervisor,
                            fullName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone *</Label>
                        <Input
                          value={newSupervisor.phoneNumber}
                          onChange={(e) =>
                            setNewSupervisor({
                              ...newSupervisor,
                              phoneNumber: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Max farmer capacity</Label>
                      <Input
                        type="number"
                        value={newSupervisor.maxFarmerCapacity}
                        onChange={(e) =>
                          setNewSupervisor({
                            ...newSupervisor,
                            maxFarmerCapacity: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateSupervisorOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createSupervisorMutation.isPending}
                      >
                        {createSupervisorMutation.isPending
                          ? 'Creating...'
                          : 'Create Supervisor'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name or email"
                    value={supervisorsSearchNameEmail}
                    onChange={(e) =>
                      setSupervisorsSearchNameEmail(e.target.value)
                    }
                    className="pl-9"
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by phone number"
                    value={supervisorsPhoneSearch}
                    onChange={(e) => setSupervisorsPhoneSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Advanced search"
                    value={supervisorsAdvancedSearch}
                    onChange={(e) =>
                      setSupervisorsAdvancedSearch(e.target.value)
                    }
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              {loadingSupervisors ? (
                <div className="p-8 text-center text-gray-500">
                  Loading supervisors...
                </div>
              ) : supervisors.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-lg font-medium">No supervisors found</p>
                  <p className="text-sm mt-2">
                    Create your first supervisor to get started
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Full Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Farmer Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Activity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {supervisors.map((supervisor) => (
                        <tr
                          key={supervisor.supervisorId}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {supervisor.fullName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {supervisor.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {supervisor.phoneNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {supervisor.currentFarmerCount || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {supervisor.lastActivityAt
                                ? new Date(
                                  supervisor.lastActivityAt,
                                ).toLocaleDateString()
                                : '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination for Supervisors */}
            {supervisors.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSupervisorPage((p) => Math.max(1, p - 1))}
                    disabled={!supervisorHasPrevious || loadingSupervisors}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {supervisorPage} of {supervisorTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSupervisorPage((p) => p + 1)}
                    disabled={!supervisorHasNext || loadingSupervisors}
                  >
                    Next
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Total: {supervisorsResp?.totalCount || 0} supervisors
                </div>
              </div>
            )}
          </div>
        )}

        {/* Managers Panel */}
        {activeRole === 'managers' && (
          <div className="space-y-4">
            {/* Header with Create Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Cluster Managers
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Manage cluster managers and their assignments
                </p>
              </div>
              <Dialog
                open={isCreateManagerOpen}
                onOpenChange={setIsCreateManagerOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    Create Manager
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Manager</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      createManagerMutation.mutate(newManager);
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>Full name *</Label>
                      <Input
                        value={newManager.fullName}
                        onChange={(e) =>
                          setNewManager({
                            ...newManager,
                            fullName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={newManager.email}
                        onChange={(e) =>
                          setNewManager({
                            ...newManager,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone *</Label>
                      <Input
                        value={newManager.phoneNumber}
                        onChange={(e) =>
                          setNewManager({
                            ...newManager,
                            phoneNumber: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateManagerOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createManagerMutation.isPending}
                      >
                        {createManagerMutation.isPending
                          ? 'Creating...'
                          : 'Create Manager'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name or email"
                    value={managersSearch}
                    onChange={(e) => setManagersSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by phone number"
                    value={managersPhoneSearch}
                    onChange={(e) => setManagersPhoneSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={
                      managersFreeOrAssigned === null ? 'default' : 'outline'
                    }
                    onClick={() => setManagersFreeOrAssigned(null)}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      managersFreeOrAssigned === true ? 'default' : 'outline'
                    }
                    onClick={() => setManagersFreeOrAssigned(true)}
                  >
                    Free
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      managersFreeOrAssigned === false ? 'default' : 'outline'
                    }
                    onClick={() => setManagersFreeOrAssigned(false)}
                  >
                    Assigned
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              {loadingManagers ? (
                <div className="p-8 text-center text-gray-500">
                  Loading managers...
                </div>
              ) : managers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-lg font-medium">No managers found</p>
                  <p className="text-sm mt-2">
                    Create your first cluster manager to get started
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cluster Name
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {managers.map((manager) => (
                        <tr
                          key={manager.clusterManagerId}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {manager.clusterManagerName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {manager.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {manager.clusterManagerPhoneNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${manager.assignedDate
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                              {manager.assignedDate ? 'Assigned' : 'Free'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {manager.assignedDate
                                ? new Date(
                                  manager.assignedDate,
                                ).toLocaleDateString()
                                : '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {manager.clusterName}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination for Managers */}
            {managers.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setManagerPage((p) => Math.max(1, p - 1))}
                    disabled={!managerHasPrevious || loadingManagers}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {managerPage} of {managerTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setManagerPage((p) => p + 1)}
                    disabled={!managerHasNext || loadingManagers}
                  >
                    Next
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Total: {managersResp?.totalCount || 0} managers
                </div>
              </div>
            )}
          </div>
        )}

        {/* Experts Panel */}
        {activeRole === 'experts' && (
          <div className="space-y-4">
            {/* Header with Create Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Agronomy Experts
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Manage agronomy experts and their assignments
                </p>
              </div>
              <Dialog
                open={isCreateExpertOpen}
                onOpenChange={setIsCreateExpertOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    Create Expert
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Expert</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      createExpertMutation.mutate(newExpert);
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>Full name *</Label>
                      <Input
                        value={newExpert.fullName}
                        onChange={(e) =>
                          setNewExpert({
                            ...newExpert,
                            fullName: e.target.value,
                          })
                        }
                        required
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
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone *</Label>
                      <Input
                        value={newExpert.phoneNumber}
                        onChange={(e) =>
                          setNewExpert({
                            ...newExpert,
                            phoneNumber: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateExpertOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createExpertMutation.isPending}
                      >
                        {createExpertMutation.isPending
                          ? 'Creating...'
                          : 'Create Expert'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name or email"
                    value={expertsSearch}
                    onChange={(e) => setExpertsSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by phone number"
                    value={expertsPhoneSearch}
                    onChange={(e) => setExpertsPhoneSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={
                      expertsFreeOrAssigned === null ? 'default' : 'outline'
                    }
                    onClick={() => setExpertsFreeOrAssigned(null)}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      expertsFreeOrAssigned === true ? 'default' : 'outline'
                    }
                    onClick={() => setExpertsFreeOrAssigned(true)}
                  >
                    Free
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      expertsFreeOrAssigned === false ? 'default' : 'outline'
                    }
                    onClick={() => setExpertsFreeOrAssigned(false)}
                  >
                    Assigned
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              {loadingExperts ? (
                <div className="p-8 text-center text-gray-500">
                  Loading experts...
                </div>
              ) : experts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-lg font-medium">No experts found</p>
                  <p className="text-sm mt-2">
                    Create your first agronomy expert to get started
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cluster Name
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {experts.map((expert) => (
                        <tr key={expert.expertId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {expert.expertName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {expert.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {expert.expertPhoneNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${expert.clusterId
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                              {expert.clusterId ? 'Assigned' : 'Free'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {expert.assignedDate
                                ? new Date(
                                  expert.assignedDate,
                                ).toLocaleDateString()
                                : '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {expert.clusterName}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination for Experts */}
            {experts.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpertPage((p) => Math.max(1, p - 1))}
                    disabled={!expertHasPrevious || loadingExperts}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {expertPage} of {expertTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpertPage((p) => p + 1)}
                    disabled={!expertHasNext || loadingExperts}
                  >
                    Next
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Total: {expertsResp?.totalCount || 0} experts
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vendors Panel */}
        {activeRole === 'vendors' && (
          <div className="space-y-4">
            {/* Header with Create Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  UAV Vendors
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Manage UAV vendors and their services
                </p>
              </div>
              <Dialog
                open={isCreateVendorOpen}
                onOpenChange={setIsCreateVendorOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    Create UAV Vendor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create UAV Vendor</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const payload = {
                        fullName: newVendor.fullName,
                        email: newVendor.email,
                        phoneNumber: newVendor.phoneNumber,
                        vendorName: newVendor.vendorName,
                        businessRegistrationNumber:
                          newVendor.businessRegistrationNumber,
                        serviceRatePerHa:
                          Number(newVendor.serviceRatePerHa) || 0,
                        fleetSize: Number(newVendor.fleetSize) || 0,
                        serviceRadius: Number(newVendor.serviceRadius) || 0,
                        equipmentSpecs:
                          typeof newVendor.equipmentSpecs === 'string'
                            ? newVendor.equipmentSpecs
                            : JSON.stringify(newVendor.equipmentSpecs),
                        operatingSchedule:
                          typeof newVendor.operatingSchedule === 'string'
                            ? newVendor.operatingSchedule
                            : JSON.stringify(newVendor.operatingSchedule),
                      };
                      createVendorMutation.mutate(payload);
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>Full name</Label>
                      <Input
                        value={newVendor.fullName}
                        onChange={(e) =>
                          setNewVendor({
                            ...newVendor,
                            fullName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vendor name</Label>
                      <Input
                        value={newVendor.vendorName}
                        onChange={(e) =>
                          setNewVendor({
                            ...newVendor,
                            vendorName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newVendor.email}
                          onChange={(e) =>
                            setNewVendor({
                              ...newVendor,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={newVendor.phoneNumber}
                          onChange={(e) =>
                            setNewVendor({
                              ...newVendor,
                              phoneNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Business registration #</Label>
                      <Input
                        value={newVendor.businessRegistrationNumber}
                        onChange={(e) =>
                          setNewVendor({
                            ...newVendor,
                            businessRegistrationNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <Label>Service rate per ha</Label>
                        <Input
                          type="number"
                          value={newVendor.serviceRatePerHa}
                          onChange={(e) =>
                            setNewVendor({
                              ...newVendor,
                              serviceRatePerHa: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fleet size</Label>
                        <Input
                          type="number"
                          value={newVendor.fleetSize}
                          onChange={(e) =>
                            setNewVendor({
                              ...newVendor,
                              fleetSize: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Service radius</Label>
                        <Input
                          type="number"
                          value={newVendor.serviceRadius}
                          onChange={(e) =>
                            setNewVendor({
                              ...newVendor,
                              serviceRadius: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Equipment specs (JSON string)</Label>
                      <textarea
                        className="w-full border rounded p-2"
                        rows={3}
                        value={newVendor.equipmentSpecs}
                        onChange={(e) =>
                          setNewVendor({
                            ...newVendor,
                            equipmentSpecs: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Operating schedule (JSON string)</Label>
                      <textarea
                        className="w-full border rounded p-2"
                        rows={2}
                        value={newVendor.operatingSchedule}
                        onChange={(e) =>
                          setNewVendor({
                            ...newVendor,
                            operatingSchedule: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={createVendorMutation.isLoading}
                      >
                        {createVendorMutation.isLoading
                          ? 'Creating...'
                          : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name or email"
                    value={vendorsNameEmailSearch}
                    onChange={(e) => setVendorsNameEmailSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by phone number"
                    value={vendorsPhoneSearch}
                    onChange={(e) => setVendorsPhoneSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by group/cluster"
                    value={vendorsGroupClusterSearch}
                    onChange={(e) =>
                      setVendorsGroupClusterSearch(e.target.value)
                    }
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              {loadingVendors ? (
                <div className="p-8 text-center text-gray-500">
                  Loading vendors...
                </div>
              ) : vendors.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-lg font-medium">No vendors found</p>
                  <p className="text-sm mt-2">
                    Create your first UAV vendor to get started
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vendor Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Full Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone Number
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {vendors.map((vendor) => (
                          <tr
                            key={vendor.uavVendorId}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {vendor.vendorName || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {vendor.uavVendorFullName || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {vendor.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {vendor.uavVendorPhoneNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                  </div>
                </>
              )}
            </div>

            {/* Pagination for Vendors */}
            {vendors.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVendorPage((p) => Math.max(1, p - 1))}
                    disabled={!vendorHasPrevious || loadingVendors}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {vendorPage} of {vendorTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVendorPage((p) => p + 1)}
                    disabled={!vendorHasNext || loadingVendors}
                  >
                    Next
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Total: {vendorsResp?.totalCount || 0} vendors
                </div>
              </div>
            )}

            {/* Vendor Detail/Edit Dialog - keep existing code */}
            <Dialog open={isVendorDetailOpen} onOpenChange={(open) => {
              setIsVendorDetailOpen(open);
              if (!open) {
                setSelectedVendorId(null);
                setEditVendor(null);
                setIsEditingVendor(false);
              }
            }}>
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
                    Error loading vendor details: {(vendorDetailError as any)?.message || 'Unknown error'}
                    <br />
                    <Button
                      className="mt-2"
                      onClick={() => setIsVendorDetailOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                ) : !editVendor ? (
                  <div className="p-4 text-center text-red-600">
                    Failed to load vendor details. Please check console for errors.
                    <br />
                    <Button
                      className="mt-2"
                      onClick={() => setIsVendorDetailOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                ) : isEditingVendor ? (
                  // Edit Form
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const payload = {
                        uavVendorId: editVendor.uavVendorId,
                        fullName: editVendor.fullName,
                        email: editVendor.email,
                        phoneNumber: editVendor.phoneNumber,
                        vendorName: editVendor.vendorName,
                        businessRegistrationNumber: editVendor.businessRegistrationNumber,
                        serviceRatePerHa: Number(editVendor.serviceRatePerHa) || 0,
                        fleetSize: Number(editVendor.fleetSize) || 0,
                        serviceRadius: Number(editVendor.serviceRadius) || 0,
                        equipmentSpecs: editVendor.equipmentSpecs,
                        operatingSchedule: editVendor.operatingSchedule,
                      };
                      console.log('Updating vendor with payload:', payload);
                      updateVendorMutation.mutate(payload);
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>Full name</Label>
                      <Input
                        value={editVendor.fullName || ''}
                        onChange={(e) =>
                          setEditVendor({
                            ...editVendor,
                            fullName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vendor name</Label>
                      <Input
                        value={editVendor.vendorName}
                        onChange={(e) =>
                          setEditVendor({
                            ...editVendor,
                            vendorName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={editVendor.email}
                          onChange={(e) =>
                            setEditVendor({
                              ...editVendor,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={editVendor.phoneNumber}
                          onChange={(e) =>
                            setEditVendor({
                              ...editVendor,
                              phoneNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Business registration #</Label>
                      <Input
                        value={editVendor.businessRegistrationNumber || ''}
                        onChange={(e) =>
                          setEditVendor({
                            ...editVendor,
                            businessRegistrationNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <Label>Service rate per ha</Label>
                        <Input
                          type="number"
                          value={editVendor.serviceRatePerHa}
                          onChange={(e) =>
                            setEditVendor({
                              ...editVendor,
                              serviceRatePerHa: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fleet size</Label>
                        <Input
                          type="number"
                          value={editVendor.fleetSize}
                          onChange={(e) =>
                            setEditVendor({
                              ...editVendor,
                              fleetSize: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Service radius</Label>
                        <Input
                          type="number"
                          value={editVendor.serviceRadius}
                          onChange={(e) =>
                            setEditVendor({
                              ...editVendor,
                              serviceRadius: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Equipment specs (JSON string)</Label>
                      <textarea
                        className="w-full border rounded p-2 min-h-[80px]"
                        value={editVendor.equipmentSpecs || ''}
                        onChange={(e) =>
                          setEditVendor({
                            ...editVendor,
                            equipmentSpecs: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Operating schedule (JSON string)</Label>
                      <textarea
                        className="w-full border rounded p-2 min-h-[60px]"
                        value={editVendor.operatingSchedule || ''}
                        onChange={(e) =>
                          setEditVendor({
                            ...editVendor,
                            operatingSchedule: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditingVendor(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateVendorMutation.isPending}
                      >
                        {updateVendorMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  // View Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600">Full name</Label>
                        <div className="mt-1">{editVendor.fullName || '-'}</div>
                      </div>
                      <div>
                        <Label className="text-gray-600">Vendor name</Label>
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
                      <Label className="text-gray-600">Business registration #</Label>
                      <div className="mt-1">{editVendor.businessRegistrationNumber || '-'}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-gray-600">Service rate per ha</Label>
                        <div className="mt-1">{editVendor.serviceRatePerHa}</div>
                      </div>
                      <div>
                        <Label className="text-gray-600">Fleet size</Label>
                        <div className="mt-1">{editVendor.fleetSize}</div>
                      </div>
                      <div>
                        <Label className="text-gray-600">Service radius</Label>
                        <div className="mt-1">{editVendor.serviceRadius}</div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Equipment specs</Label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
                        {editVendor.equipmentSpecs || '-'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-600">Operating schedule</Label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
                        {editVendor.operatingSchedule || '-'}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsVendorDetailOpen(false)}
                      >
                        Close
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setIsEditingVendor(true)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default RolesManager;
