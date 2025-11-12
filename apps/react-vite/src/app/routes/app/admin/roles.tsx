import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  assignedDate: string | null;
};

type AgronomyExpert = {
  expertId: string;
  expertName: string;
  expertPhoneNumber: string;
  email: string;
  clusterId: string | null;
  assignedDate: string | null;
};

type UavVendor = {
  uavVendorId: string;
  uavVendorFullName: string | null;
  vendorName: string;
  uavVendorPhoneNumber: string;
  email: string;
};

const RolesManager = () => {
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  // active role (default landing list is supervisors)
  const [activeRole, setActiveRole] = useState<
    'supervisors' | 'managers' | 'experts' | 'vendors'
  >('supervisors');

  // pagination
  const [page] = useState(1);
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

  // Vendors search + create
  const [vendorsNameEmailSearch, setVendorsNameEmailSearch] = useState('');
  const [vendorsGroupClusterSearch, setVendorsGroupClusterSearch] =
    useState('');
  const [vendorsPhoneSearch, setVendorsPhoneSearch] = useState('');
  const [isCreateVendorOpen, setIsCreateVendorOpen] = useState(false);
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
      page,
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
        currentPage: page,
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
      page,
      pageSize,
      managersSearch,
      managersPhoneSearch,
      managersFreeOrAssigned,
    ],
    queryFn: async () =>
      api.post('/ClusterManager/get-all', {
        currentPage: page,
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
      page,
      pageSize,
      expertsSearch,
      expertsPhoneSearch,
      expertsFreeOrAssigned,
    ],
    queryFn: async () =>
      api.post('/AgronomyExpert/get-all', {
        currentPage: page,
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
      page,
      pageSize,
      vendorsNameEmailSearch,
      vendorsGroupClusterSearch,
      vendorsPhoneSearch,
    ],
    queryFn: async () =>
      api.post('/UavVendor/get-all', {
        currentPage: page,
        pageSize,
        nameEmailSearch: vendorsNameEmailSearch,
        groupClusterSearch: vendorsGroupClusterSearch,
        phoneNumber: vendorsPhoneSearch,
      }),
    enabled: activeRole === 'vendors',
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

  // helpers
  const supervisors: Supervisor[] = supervisorsResp?.data || [];
  const managers: ClusterManager[] = managersResp?.data || [];
  const experts: AgronomyExpert[] = expertsResp?.data || [];
  const vendors: UavVendor[] = vendorsResp?.data || [];

  return (
    <ContentLayout title="Management Roles">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            className={`border rounded p-6 text-left hover:shadow ${activeRole === 'supervisors' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveRole('supervisors')}
          >
            <div className="font-semibold">Supervisors</div>
            <div className="text-sm text-gray-500">
              Create and manage supervisors
            </div>
          </button>

          <button
            className={`border rounded p-6 text-left hover:shadow ${activeRole === 'managers' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveRole('managers')}
          >
            <div className="font-semibold">Cluster Managers</div>
            <div className="text-sm text-gray-500">
              Create and assign managers
            </div>
          </button>

          <button
            className={`border rounded p-6 text-left hover:shadow ${activeRole === 'experts' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveRole('experts')}
          >
            <div className="font-semibold">Agronomy Experts</div>
            <div className="text-sm text-gray-500">
              Create and assign experts
            </div>
          </button>

          <button
            className={`border rounded p-6 text-left hover:shadow ${activeRole === 'vendors' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveRole('vendors')}
          >
            <div className="font-semibold">UAV Vendors</div>
            <div className="text-sm text-gray-500">
              Create and manage UAV vendors
            </div>
          </button>
        </div>

        {/* Supervisors Panel */}
        {activeRole === 'supervisors' && (
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Supervisors</h3>
              <Dialog
                open={isCreateSupervisorOpen}
                onOpenChange={setIsCreateSupervisorOpen}
              >
                <DialogTrigger asChild>
                  <Button onClick={() => setIsCreateSupervisorOpen(true)}>
                    Create
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Supervisor</DialogTitle>
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
                    <div className="grid grid-cols-2 gap-2">
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
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={createSupervisorMutation.isLoading}
                      >
                        {createSupervisorMutation.isLoading
                          ? 'Creating...'
                          : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="Name or email"
                value={supervisorsSearchNameEmail}
                onChange={(e) => setSupervisorsSearchNameEmail(e.target.value)}
              />
              <Input
                placeholder="Phone number"
                value={supervisorsPhoneSearch}
                onChange={(e) => setSupervisorsPhoneSearch(e.target.value)}
              />
              <Input
                placeholder="Advanced search"
                value={supervisorsAdvancedSearch}
                onChange={(e) => setSupervisorsAdvancedSearch(e.target.value)}
              />
            </div>

            <div>
              {loadingSupervisors ? (
                <div>Loading...</div>
              ) : supervisors.length === 0 ? (
                <div>No supervisors</div>
              ) : (
                <ul className="space-y-2">
                  {supervisors.map((s) => (
                    <li key={s.supervisorId} className="border rounded p-3">
                      <div className="font-medium">{s.fullName}</div>
                      <div className="text-sm text-gray-600">
                        {s.email} • {s.phoneNumber}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {supervisorsError && (
                <div className="text-red-600 mt-2">
                  Error loading supervisors
                </div>
              )}
            </div>
          </div>
        )}

        {/* Managers Panel */}
        {activeRole === 'managers' && (
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Cluster Managers</h3>
              <Dialog
                open={isCreateManagerOpen}
                onOpenChange={setIsCreateManagerOpen}
              >
                <DialogTrigger asChild>
                  <Button onClick={() => setIsCreateManagerOpen(true)}>
                    Create
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Manager</DialogTitle>
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
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={createManagerMutation.isLoading}
                      >
                        {createManagerMutation.isLoading
                          ? 'Creating...'
                          : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="Name or email"
                value={managersSearch}
                onChange={(e) => setManagersSearch(e.target.value)}
              />
              <Input
                placeholder="Phone number"
                value={managersPhoneSearch}
                onChange={(e) => setManagersPhoneSearch(e.target.value)}
              />
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

            <div>
              {loadingManagers ? (
                <div>Loading...</div>
              ) : managers.length === 0 ? (
                <div>No managers</div>
              ) : (
                <ul className="space-y-2">
                  {managers.map((m) => (
                    <li key={m.clusterManagerId} className="border rounded p-3">
                      <div className="font-medium">{m.clusterManagerName}</div>
                      <div className="text-sm text-gray-600">
                        {m.email} • {m.clusterManagerPhoneNumber}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {managersError && (
                <div className="text-red-600 mt-2">Error loading managers</div>
              )}
            </div>
          </div>
        )}

        {/* Experts Panel */}
        {activeRole === 'experts' && (
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Agronomy Experts</h3>
              <Dialog
                open={isCreateExpertOpen}
                onOpenChange={setIsCreateExpertOpen}
              >
                <DialogTrigger asChild>
                  <Button onClick={() => setIsCreateExpertOpen(true)}>
                    Create
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Expert</DialogTitle>
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
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={createExpertMutation.isLoading}
                      >
                        {createExpertMutation.isLoading
                          ? 'Creating...'
                          : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="Name or email"
                value={expertsSearch}
                onChange={(e) => setExpertsSearch(e.target.value)}
              />
              <Input
                placeholder="Phone number"
                value={expertsPhoneSearch}
                onChange={(e) => setExpertsPhoneSearch(e.target.value)}
              />
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

            <div>
              {loadingExperts ? (
                <div>Loading...</div>
              ) : experts.length === 0 ? (
                <div>No experts</div>
              ) : (
                <ul className="space-y-2">
                  {experts.map((e) => (
                    <li key={e.expertId} className="border rounded p-3">
                      <div className="font-medium">{e.expertName}</div>
                      <div className="text-sm text-gray-600">
                        {e.email} • {e.expertPhoneNumber}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {expertsError && (
                <div className="text-red-600 mt-2">Error loading experts</div>
              )}
            </div>
          </div>
        )}

        {/* Vendors Panel */}
        {activeRole === 'vendors' && (
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">UAV Vendors</h3>
              <Dialog
                open={isCreateVendorOpen}
                onOpenChange={setIsCreateVendorOpen}
              >
                <DialogTrigger asChild>
                  <Button onClick={() => setIsCreateVendorOpen(true)}>
                    Create
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

            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="Name or email"
                value={vendorsNameEmailSearch}
                onChange={(e) => setVendorsNameEmailSearch(e.target.value)}
              />
              <Input
                placeholder="Group / Cluster"
                value={vendorsGroupClusterSearch}
                onChange={(e) => setVendorsGroupClusterSearch(e.target.value)}
              />
              <Input
                placeholder="Phone number"
                value={vendorsPhoneSearch}
                onChange={(e) => setVendorsPhoneSearch(e.target.value)}
              />
            </div>

            <div>
              {loadingVendors ? (
                <div>Loading...</div>
              ) : vendors.length === 0 ? (
                <div>No vendors</div>
              ) : (
                <ul className="space-y-2">
                  {vendors.map((v) => (
                    <li key={v.uavVendorId} className="border rounded p-3">
                      <div className="font-medium">
                        {v.uavVendorFullName || v.vendorName || v.email}
                      </div>
                      <div className="text-sm text-gray-600">
                        {v.email} • {v.uavVendorPhoneNumber}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {vendorsError && (
                <div className="text-red-600 mt-2">Error loading vendors</div>
              )}
            </div>
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default RolesManager;
