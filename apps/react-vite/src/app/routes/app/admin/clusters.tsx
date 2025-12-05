import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Users,
  UserCheck,
  Search,
  Check,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';

// Update the Cluster type to include emails
type Cluster = {
  clusterId: string;
  clusterName: string;
  clusterManagerId: string;
  agronomyExpertId: string | null;
  clusterManagerName: string;
  clusterManagerPhoneNumber: string;
  clusterManagerEmail: string;
  agronomyExpertName: string | null;
  agronomyExpertPhoneNumber: string | null;
  agronomyExpertEmail: string | null;
  area: number | null;
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

type CreateClusterDto = {
  clusterName: string;
  clusterManagerId: string;
  agronomyExpertId: string;
};

type CreateClusterManagerDto = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

type CreateAgronomyExpertDto = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

enum SortBy {
  NameAscending = 'NameAscending',
  NameDescending = 'NameDescending',
  DateCreatedAscending = 'DateCreatedAscending',
  DateCreatedDescending = 'DateCreatedDescending',
}

type UpdateClusterDto = {
  clusterId: string;
  clusterName: string;
  clusterManagerId: string;
  agronomyExpertId: string;
};

const AdminClustersRoute = () => {
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Cluster list state
  const [clusterPage, setClusterPage] = useState(1);
  const [clusterPageSize] = useState(5);
  const [clusterNameSearch, setClusterNameSearch] = useState('');
  const [managerExpertNameSearch, setManagerExpertNameSearch] = useState('');
  const [phoneNumberSearch, setPhoneNumberSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.NameAscending);

  // Create cluster dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [clusterName, setClusterName] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [selectedExpertId, setSelectedExpertId] = useState<string>('');
  const [selectedManagerName, setSelectedManagerName] = useState<string>('');
  const [selectedExpertName, setSelectedExpertName] = useState<string>('');

  // Edit cluster dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCluster, setEditingCluster] = useState<Cluster | null>(null);

  // Shared create manager/expert dialogs (used by both create and edit)
  const [isManagerDialogOpen, setIsManagerDialogOpen] = useState(false);
  const [isExpertDialogOpen, setIsExpertDialogOpen] = useState(false);

  // Shared manager/expert selection dialogs
  const [isManagerSelectOpen, setIsManagerSelectOpen] = useState(false);
  const [isExpertSelectOpen, setIsExpertSelectOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Track if we're in edit mode

  // Search and pagination for managers
  const [managerSearch, setManagerSearch] = useState('');
  const [managerPhoneSearch, setManagerPhoneSearch] = useState('');
  const [managerPage, setManagerPage] = useState(1);
  const [managerPageSize] = useState(10);
  const [managerFreeOrAssigned, setManagerFreeOrAssigned] = useState<
    boolean | null
  >(null);

  // Search and pagination for experts
  const [expertSearch, setExpertSearch] = useState('');
  const [expertPhoneSearch, setExpertPhoneSearch] = useState('');
  const [expertPage, setExpertPage] = useState(1);
  const [expertPageSize] = useState(10);
  const [expertFreeOrAssigned, setExpertFreeOrAssigned] = useState<
    boolean | null
  >(true);

  const [newManager, setNewManager] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });

  const [newExpert, setNewExpert] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });

  // Fetch clusters list
  const { data: clustersData, isLoading: isLoadingClusters } = useQuery({
    queryKey: [
      'clusters',
      clusterPage,
      clusterPageSize,
      clusterNameSearch,
      managerExpertNameSearch,
      phoneNumberSearch,
      sortBy,
    ],
    queryFn: async () => {
      const response = await api.post('/Cluster/Get-all', {
        currentPage: clusterPage,
        pageSize: clusterPageSize,
        clusterNameSearch,
        managerExpertNameSearch,
        phoneNumber: phoneNumberSearch,
        sortBy,
      });
      return response;
    },
  });

  // Fetch cluster managers
  const { data: managersData, isLoading: isLoadingManagers } = useQuery({
    queryKey: [
      'cluster-managers',
      managerPage,
      managerPageSize,
      managerSearch,
      managerPhoneSearch,
      managerFreeOrAssigned,
    ],
    queryFn: async () => {
      const response = await api.post('/ClusterManager/get-all', {
        currentPage: managerPage,
        pageSize: managerPageSize,
        freeOrAssigned: managerFreeOrAssigned,
        search: managerSearch,
        phoneNumber: managerPhoneSearch,
      });
      return response;
    },
    enabled: isManagerSelectOpen,
  });

  // Fetch agronomy experts
  const { data: expertsData, isLoading: isLoadingExperts } = useQuery({
    queryKey: [
      'agronomy-experts',
      expertPage,
      expertPageSize,
      expertSearch,
      expertPhoneSearch,
      expertFreeOrAssigned,
    ],
    queryFn: async () => {
      const response = await api.post('/AgronomyExpert/get-all', {
        currentPage: expertPage,
        pageSize: expertPageSize,
        freeOrAssigned: expertFreeOrAssigned,
        search: expertSearch,
        phoneNumber: expertPhoneSearch,
      });
      return response;
    },
    enabled: isExpertSelectOpen,
  });

  // Fetch managers for edit dialog
  const { data: editManagersData, isLoading: isLoadingEditManagers } = useQuery(
    {
      queryKey: [
        'edit-cluster-managers',
        managerPage,
        managerPageSize,
        managerSearch,
        managerPhoneSearch,
        managerFreeOrAssigned,
      ],
      queryFn: async () => {
        const response = await api.post('/ClusterManager/get-all', {
          currentPage: managerPage,
          pageSize: managerPageSize,
          freeOrAssigned: managerFreeOrAssigned,
          search: managerSearch,
          phoneNumber: managerPhoneSearch,
        });
        return response;
      },
      enabled: isManagerSelectOpen && isEditMode,
    },
  );

  // Fetch experts for edit dialog
  const { data: editExpertsData, isLoading: isLoadingEditExperts } = useQuery({
    queryKey: [
      'edit-agronomy-experts',
      expertPage,
      expertPageSize,
      expertSearch,
      expertPhoneSearch,
      expertFreeOrAssigned,
    ],
    queryFn: async () => {
      const response = await api.post('/AgronomyExpert/get-all', {
        currentPage: expertPage,
        pageSize: expertPageSize,
        freeOrAssigned: expertFreeOrAssigned,
        search: expertSearch,
        phoneNumber: expertPhoneSearch,
      });
      return response;
    },
    enabled: isExpertSelectOpen && isEditMode,
  });

  // Create cluster mutation
  const createClusterMutation = useMutation({
    mutationFn: (data: CreateClusterDto) => api.post('/Cluster', data),
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Cluster created successfully',
      });
      // Reset form
      setClusterName('');
      setSelectedManagerId('');
      setSelectedExpertId('');
      setSelectedManagerName('');
      setSelectedExpertName('');
      setIsCreateDialogOpen(false);
      setIsEditMode(false);
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
    },
    onError: (error: any) => {
      console.error('Create cluster error:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to create cluster',
      });
    },
  });

  // Create cluster manager mutation
  const createManagerMutation = useMutation({
    mutationFn: (data: CreateClusterManagerDto) =>
      api.post('/ClusterManager', data),
    onSuccess: async (response) => {
      console.log('Manager created, full response:', response);

      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Cluster Manager created successfully',
      });

      const newManagerId = response;
      console.log('New manager ID:', newManagerId);

      const managerFullName = newManager.fullName;
      const managerPhone = newManager.phoneNumber;

      console.log(
        'Setting manager - ID:',
        newManagerId,
        'Name:',
        managerFullName,
        'Phone:',
        managerPhone,
      );

      setSelectedManagerId(newManagerId.data);
      setSelectedManagerName(`${managerFullName} (${managerPhone})`);

      console.log(
        'After setting - selectedManagerId:',
        newManagerId,
        'selectedManagerName:',
        `${managerFullName} (${managerPhone})`,
      );

      setIsManagerDialogOpen(false);
      setNewManager({ fullName: '', email: '', phoneNumber: '' });
      queryClient.invalidateQueries({ queryKey: ['cluster-managers'] });
    },
    onError: (error: any) => {
      console.error('Create manager error:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message:
          error?.response?.data?.message || 'Failed to create cluster manager',
      });
    },
  });

  // Create agronomy expert mutation
  const createExpertMutation = useMutation({
    mutationFn: (data: CreateAgronomyExpertDto) =>
      api.post('/AgronomyExpert', data),
    onSuccess: async (response) => {
      console.log('Expert created, full response:', response);

      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Agronomy Expert created successfully',
      });

      const newExpertId = response;
      console.log('New expert ID:', newExpertId);

      const expertFullName = newExpert.fullName;
      const expertPhone = newExpert.phoneNumber;

      console.log(
        'Setting expert - ID:',
        newExpertId,
        'Name:',
        expertFullName,
        'Phone:',
        expertPhone,
      );

      setSelectedExpertId(newExpertId.data);
      setSelectedExpertName(`${expertFullName} (${expertPhone})`);

      console.log(
        'After setting - selectedExpertId:',
        newExpertId,
        'selectedExpertName:',
        `${expertFullName} (${expertPhone})`,
      );

      setIsExpertDialogOpen(false);
      setNewExpert({ fullName: '', email: '', phoneNumber: '' });
      queryClient.invalidateQueries({ queryKey: ['agronomy-experts'] });
    },
    onError: (error: any) => {
      console.error('Create expert error:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message:
          error?.response?.data?.message || 'Failed to create agronomy expert',
      });
    },
  });

  // Update cluster mutation
  const updateClusterMutation = useMutation({
    mutationFn: (data: UpdateClusterDto) =>
      api.put('/Cluster/Update-name-and-human-resource', data),
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Cluster updated successfully',
      });
      setIsEditDialogOpen(false);
      setEditingCluster(null);
      setIsEditMode(false);
      setClusterName('');
      setSelectedManagerId('');
      setSelectedExpertId('');
      setSelectedManagerName('');
      setSelectedExpertName('');
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
    },
    onError: (error: any) => {
      console.error('Update cluster error:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to update cluster',
      });
    },
  });

  const handleEditCluster = (cluster: Cluster) => {
    setEditingCluster(cluster);
    setClusterName(cluster.clusterName);
    setSelectedManagerId(cluster.clusterManagerId);
    setSelectedExpertId(cluster.agronomyExpertId || '');
    setSelectedManagerName(
      `${cluster.clusterManagerName} (${cluster.clusterManagerPhoneNumber})`,
    );
    setSelectedExpertName(
      cluster.agronomyExpertName
        ? `${cluster.agronomyExpertName} (${cluster.agronomyExpertPhoneNumber})`
        : '',
    );
    setIsEditMode(true);
    setIsEditDialogOpen(true);
  };

  const handleCreateCluster = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clusterName || !selectedManagerId || !selectedExpertId) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    createClusterMutation.mutate({
      clusterName,
      clusterManagerId: selectedManagerId,
      agronomyExpertId: selectedExpertId,
    });
  };

  const handleUpdateCluster = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !editingCluster ||
      !clusterName ||
      !selectedManagerId ||
      !selectedExpertId
    ) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    updateClusterMutation.mutate({
      clusterId: editingCluster.clusterId,
      clusterName: clusterName,
      clusterManagerId: selectedManagerId,
      agronomyExpertId: selectedExpertId,
    });
  };

  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false);
    setClusterName('');
    setSelectedManagerId('');
    setSelectedExpertId('');
    setSelectedManagerName('');
    setSelectedExpertName('');
    setIsEditMode(false);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingCluster(null);
    setIsEditMode(false);
    setClusterName('');
    setSelectedManagerId('');
    setSelectedExpertId('');
    setSelectedManagerName('');
    setSelectedExpertName('');
  };

  const handleSelectManager = (manager: ClusterManager) => {
    setSelectedManagerId(manager.clusterManagerId);
    setSelectedManagerName(
      `${manager.clusterManagerName} (${manager.clusterManagerPhoneNumber})`,
    );
    setIsManagerSelectOpen(false);
  };

  const handleSelectExpert = (expert: AgronomyExpert) => {
    setSelectedExpertId(expert.expertId);
    setSelectedExpertName(`${expert.expertName} (${expert.expertPhoneNumber})`);
    setIsExpertSelectOpen(false);
  };

  const handleCreateManager = (e: React.FormEvent) => {
    e.preventDefault();
    createManagerMutation.mutate(newManager);
  };

  const handleCreateExpert = (e: React.FormEvent) => {
    e.preventDefault();
    createExpertMutation.mutate(newExpert);
  };

  const managers: ClusterManager[] = managersData?.data || [];
  const experts: AgronomyExpert[] = expertsData?.data || [];
  const clusters: Cluster[] = clustersData?.data || [];

  const managerHasNext = managersData?.data.hasNext || false;
  const managerHasPrevious = managersData?.data.hasPrevious || false;
  const expertHasNext = expertsData?.data.hasNext || false;
  const expertHasPrevious = expertsData?.data.hasPrevious || false;
  const clusterHasNext = clustersData?.data.hasNext || false;
  const clusterHasPrevious = clustersData?.data.hasPrevious || false;

  return (
    <ContentLayout title="Cluster Management">
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Clusters</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage clusters, assign managers and agronomy experts
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setIsEditMode(false)}>
                Create Cluster
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Cluster</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateCluster} className="space-y-6">
                {/* Cluster Name */}
                <div className="space-y-2">
                  <Label htmlFor="clusterName">Cluster Name *</Label>
                  <Input
                    id="clusterName"
                    value={clusterName}
                    onChange={(e) => setClusterName(e.target.value)}
                    placeholder="Enter cluster name"
                    required
                  />
                </div>

                {/* Cluster Manager */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Cluster Manager *</Label>
                    <Dialog
                      open={isManagerDialogOpen}
                      onOpenChange={setIsManagerDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          Create New Cluster Manager
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Cluster Manager</DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={handleCreateManager}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="managerName">Full Name *</Label>
                            <Input
                              id="managerName"
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
                            <Label htmlFor="managerEmail">Email *</Label>
                            <Input
                              id="managerEmail"
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
                            <Label htmlFor="managerPhone">Phone Number *</Label>
                            <Input
                              id="managerPhone"
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
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={createManagerMutation.isPending}
                          >
                            {createManagerMutation.isPending
                              ? 'Creating...'
                              : 'Create Manager'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Dialog
                    open={isManagerSelectOpen}
                    onOpenChange={setIsManagerSelectOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                      >
                        {selectedManagerId ? (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{selectedManagerName}</span>
                          </div>
                        ) : (
                          'Select a cluster manager'
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Select Cluster Manager</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              placeholder="Search by name/email"
                              value={managerSearch}
                              onChange={(e) => {
                                setManagerSearch(e.target.value);
                                setManagerPage(1);
                              }}
                              className="pl-9"
                            />
                          </div>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              placeholder="Search by phone number"
                              value={managerPhoneSearch}
                              onChange={(e) => {
                                setManagerPhoneSearch(e.target.value);
                                setManagerPage(1);
                              }}
                              className="pl-9"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={
                              managerFreeOrAssigned === null
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => {
                              setManagerFreeOrAssigned(null);
                              setManagerPage(1);
                            }}
                          >
                            All
                          </Button>
                          <Button
                            type="button"
                            variant={
                              managerFreeOrAssigned === true
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => {
                              setManagerFreeOrAssigned(true);
                              setManagerPage(1);
                            }}
                          >
                            Free
                          </Button>
                          <Button
                            type="button"
                            variant={
                              managerFreeOrAssigned === false
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => {
                              setManagerFreeOrAssigned(false);
                              setManagerPage(1);
                            }}
                          >
                            Assigned
                          </Button>
                        </div>
                      </div>

                      <div className="border rounded-md max-h-[400px] overflow-y-auto">
                        {isLoadingManagers ? (
                          <div className="p-4 text-center text-gray-500">
                            Loading managers...
                          </div>
                        ) : managers.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No managers found
                          </div>
                        ) : (
                          <div className="divide-y">
                            {managers.map((manager) => (
                              <button
                                key={manager.clusterManagerId}
                                type="button"
                                onClick={() => handleSelectManager(manager)}
                                className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <Users className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                  <div className="text-left flex-1">
                                    <div className="font-medium">
                                      {manager.clusterManagerName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {manager.clusterManagerPhoneNumber}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                      {manager.email}
                                    </div>
                                  </div>
                                </div>
                                {selectedManagerId ===
                                  manager.clusterManagerId && (
                                    <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                  )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {managers.length > 0 && (
                        <div className="flex items-center justify-between text-sm border-t pt-4">
                          <span className="text-gray-600">
                            Page {managerPage} of{' '}
                            {managersData?.data?.totalPages || 1} (
                            {managersData?.data?.totalCount || 0} total)
                          </span>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setManagerPage((p) => Math.max(1, p - 1))
                              }
                              disabled={!managerHasPrevious}
                            >
                              Previous
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setManagerPage((p) => p + 1)}
                              disabled={!managerHasNext}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Agronomy Expert */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Agronomy Expert *</Label>
                    <Dialog
                      open={isExpertDialogOpen}
                      onOpenChange={setIsExpertDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          Create New Agronomy Expert
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Agronomy Expert</DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={handleCreateExpert}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="expertName">Full Name *</Label>
                            <Input
                              id="expertName"
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
                            <Label htmlFor="expertEmail">Email *</Label>
                            <Input
                              id="expertEmail"
                              type="email"
                              value={newExpert.email}
                              onChange={(e) =>
                                setNewExpert({
                                  ...newExpert,
                                  email: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="expertPhone">Phone Number *</Label>
                            <Input
                              id="expertPhone"
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
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={createExpertMutation.isPending}
                          >
                            {createExpertMutation.isPending
                              ? 'Creating...'
                              : 'Create Expert'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Dialog
                    open={isExpertSelectOpen}
                    onOpenChange={setIsExpertSelectOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                      >
                        {selectedExpertId ? (
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            <span>{selectedExpertName}</span>
                          </div>
                        ) : (
                          'Select an agronomy expert'
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Select Agronomy Expert</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              placeholder="Search by name/email"
                              value={expertSearch}
                              onChange={(e) => {
                                setExpertSearch(e.target.value);
                                setExpertPage(1);
                              }}
                              className="pl-9"
                            />
                          </div>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              placeholder="Search by phone number"
                              value={expertPhoneSearch}
                              onChange={(e) => {
                                setExpertPhoneSearch(e.target.value);
                                setExpertPage(1);
                              }}
                              className="pl-9"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={
                              expertFreeOrAssigned === null
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => {
                              setExpertFreeOrAssigned(null);
                              setExpertPage(1);
                            }}
                          >
                            All
                          </Button>
                          <Button
                            type="button"
                            variant={
                              expertFreeOrAssigned === true
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => {
                              setExpertFreeOrAssigned(true);
                              setExpertPage(1);
                            }}
                          >
                            Free
                          </Button>
                          <Button
                            type="button"
                            variant={
                              expertFreeOrAssigned === false
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => {
                              setExpertFreeOrAssigned(false);
                              setExpertPage(1);
                            }}
                          >
                            Assigned
                          </Button>
                        </div>
                      </div>

                      <div className="border rounded-md max-h-[400px] overflow-y-auto">
                        {isLoadingExperts ? (
                          <div className="p-4 text-center text-gray-500">
                            Loading experts...
                          </div>
                        ) : experts.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No experts found
                          </div>
                        ) : (
                          <div className="divide-y">
                            {experts.map((expert) => (
                              <button
                                key={expert.expertId}
                                type="button"
                                onClick={() => handleSelectExpert(expert)}
                                className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <UserCheck className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                  <div className="text-left flex-1">
                                    <div className="font-medium">
                                      {expert.expertName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {expert.expertPhoneNumber}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                      {expert.email}
                                    </div>
                                  </div>
                                </div>
                                {selectedExpertId === expert.expertId && (
                                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {experts.length > 0 && (
                        <div className="flex items-center justify-between text-sm border-t pt-4">
                          <span className="text-gray-600">
                            Page {expertPage} of {expertsData?.data.totalPages || 1}{' '}
                            ({expertsData?.data.totalCount || 0} total)
                          </span>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setExpertPage((p) => Math.max(1, p - 1))
                              }
                              disabled={!expertHasPrevious}
                            >
                              Previous
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setExpertPage((p) => p + 1)}
                              disabled={!expertHasNext}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCreateDialogClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createClusterMutation.isPending}
                  >
                    {createClusterMutation.isPending
                      ? 'Creating...'
                      : 'Create Cluster'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Cluster</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateCluster} className="space-y-6">
              {/* Cluster Name */}
              <div className="space-y-2">
                <Label htmlFor="editClusterName">Cluster Name *</Label>
                <Input
                  id="editClusterName"
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                  placeholder="Enter cluster name"
                  required
                />
              </div>

              {/* Cluster Manager */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Cluster Manager *</Label>
                  <Dialog
                    open={isManagerDialogOpen}
                    onOpenChange={setIsManagerDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        Create New Cluster Manager
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Cluster Manager</DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={handleCreateManager}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="editManagerName">Full Name *</Label>
                          <Input
                            id="editManagerName"
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
                          <Label htmlFor="editManagerEmail">Email *</Label>
                          <Input
                            id="editManagerEmail"
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
                          <Label htmlFor="editManagerPhone">
                            Phone Number *
                          </Label>
                          <Input
                            id="editManagerPhone"
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
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={createManagerMutation.isPending}
                        >
                          {createManagerMutation.isPending
                            ? 'Creating...'
                            : 'Create Manager'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Dialog
                  open={isManagerSelectOpen}
                  onOpenChange={setIsManagerSelectOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                    >
                      {selectedManagerId ? (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{selectedManagerName}</span>
                        </div>
                      ) : (
                        'Select a cluster manager'
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Select Cluster Manager</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Search by name/email"
                            value={managerSearch}
                            onChange={(e) => {
                              setManagerSearch(e.target.value);
                              setManagerPage(1);
                            }}
                            className="pl-9"
                          />
                        </div>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Search by phone number"
                            value={managerPhoneSearch}
                            onChange={(e) => {
                              setManagerPhoneSearch(e.target.value);
                              setManagerPage(1);
                            }}
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={
                            managerFreeOrAssigned === null
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => {
                            setManagerFreeOrAssigned(null);
                            setManagerPage(1);
                          }}
                        >
                          All
                        </Button>
                        <Button
                          type="button"
                          variant={
                            managerFreeOrAssigned === true
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => {
                            setManagerFreeOrAssigned(true);
                            setManagerPage(1);
                          }}
                        >
                          Free
                        </Button>
                        <Button
                          type="button"
                          variant={
                            managerFreeOrAssigned === false
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => {
                            setManagerFreeOrAssigned(false);
                            setManagerPage(1);
                          }}
                        >
                          Assigned
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-md max-h-[400px] overflow-y-auto">
                      {isLoadingManagers ? (
                        <div className="p-4 text-center text-gray-500">
                          Loading managers...
                        </div>
                      ) : managers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No managers found
                        </div>
                      ) : (
                        <div className="divide-y">
                          {managers.map((manager) => (
                            <button
                              key={manager.clusterManagerId}
                              type="button"
                              onClick={() => handleSelectManager(manager)}
                              className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <Users className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                <div className="text-left flex-1">
                                  <div className="font-medium">
                                    {manager.clusterManagerName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {manager.clusterManagerPhoneNumber}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {manager.email}
                                  </div>
                                </div>
                              </div>
                              {selectedManagerId ===
                                manager.clusterManagerId && (
                                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {managers.length > 0 && (
                      <div className="flex items-center justify-between text-sm border-t pt-4">
                        <span className="text-gray-600">
                          Page {managerPage} of {managersData?.data.totalPages || 1}{' '}
                          ({managersData?.data.totalCount || 0} total)
                        </span>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setManagerPage((p) => Math.max(1, p - 1))
                            }
                            disabled={!managerHasPrevious}
                          >
                            Previous
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setManagerPage((p) => p + 1)}
                            disabled={!managerHasNext}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              {/* Agronomy Expert */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Agronomy Expert *</Label>
                  <Dialog
                    open={isExpertDialogOpen}
                    onOpenChange={setIsExpertDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        Create New Agronomy Expert
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Agronomy Expert</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateExpert} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="expertName">Full Name *</Label>
                          <Input
                            id="expertName"
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
                          <Label htmlFor="expertEmail">Email *</Label>
                          <Input
                            id="expertEmail"
                            type="email"
                            value={newExpert.email}
                            onChange={(e) =>
                              setNewExpert({
                                ...newExpert,
                                email: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expertPhone">Phone Number *</Label>
                          <Input
                            id="expertPhone"
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
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={createExpertMutation.isPending}
                        >
                          {createExpertMutation.isPending
                            ? 'Creating...'
                            : 'Create Expert'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Dialog
                  open={isExpertSelectOpen}
                  onOpenChange={setIsExpertSelectOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                    >
                      {selectedExpertId ? (
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          <span>{selectedExpertName}</span>
                        </div>
                      ) : (
                        'Select an agronomy expert'
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Select Agronomy Expert</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Search by name/email"
                            value={expertSearch}
                            onChange={(e) => {
                              setExpertSearch(e.target.value);
                              setExpertPage(1);
                            }}
                            className="pl-9"
                          />
                        </div>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Search by phone number"
                            value={expertPhoneSearch}
                            onChange={(e) => {
                              setExpertPhoneSearch(e.target.value);
                              setExpertPage(1);
                            }}
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={
                            expertFreeOrAssigned === null
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => {
                            setExpertFreeOrAssigned(null);
                            setExpertPage(1);
                          }}
                        >
                          All
                        </Button>
                        <Button
                          type="button"
                          variant={
                            expertFreeOrAssigned === true
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => {
                            setExpertFreeOrAssigned(true);
                            setExpertPage(1);
                          }}
                        >
                          Free
                        </Button>
                        <Button
                          type="button"
                          variant={
                            expertFreeOrAssigned === false
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => {
                            setExpertFreeOrAssigned(false);
                            setExpertPage(1);
                          }}
                        >
                          Assigned
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-md max-h-[400px] overflow-y-auto">
                      {isLoadingExperts ? (
                        <div className="p-4 text-center text-gray-500">
                          Loading experts...
                        </div>
                      ) : experts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No experts found
                        </div>
                      ) : (
                        <div className="divide-y">
                          {experts.map((expert) => (
                            <button
                              key={expert.expertId}
                              type="button"
                              onClick={() => handleSelectExpert(expert)}
                              className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <UserCheck className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                <div className="text-left flex-1">
                                  <div className="font-medium">
                                    {expert.expertName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {expert.expertPhoneNumber}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {expert.email}
                                  </div>
                                </div>
                              </div>
                              {selectedExpertId === expert.expertId && (
                                <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {experts.length > 0 && (
                      <div className="flex items-center justify-between text-sm border-t pt-4">
                        <span className="text-gray-600">
                          Page {expertPage} of {expertsData?.data.totalPages || 1} (
                          {expertsData?.data.totalCount || 0} total)
                        </span>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setExpertPage((p) => Math.max(1, p - 1))
                            }
                            disabled={!expertHasPrevious}
                          >
                            Previous
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setExpertPage((p) => p + 1)}
                            disabled={!expertHasNext}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEditDialogClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateClusterMutation.isPending}
                >
                  {updateClusterMutation.isPending
                    ? 'Updating...'
                    : 'Update Cluster'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Search and Filter Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by cluster name"
                value={clusterNameSearch}
                onChange={(e) => {
                  setClusterNameSearch(e.target.value);
                  setClusterPage(1);
                }}
                className="pl-9"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by manager/expert name/email"
                value={managerExpertNameSearch}
                onChange={(e) => {
                  setManagerExpertNameSearch(e.target.value);
                  setClusterPage(1);
                }}
                className="pl-9"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by phone number"
                value={phoneNumberSearch}
                onChange={(e) => {
                  setPhoneNumberSearch(e.target.value);
                  setClusterPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value as SortBy);
                setClusterPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SortBy.NameAscending}>Name (A-Z)</SelectItem>
                <SelectItem value={SortBy.NameDescending}>
                  Name (Z-A)
                </SelectItem>
                <SelectItem value={SortBy.DateCreatedAscending}>
                  Date (Oldest)
                </SelectItem>
                <SelectItem value={SortBy.DateCreatedDescending}>
                  Date (Newest)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clusters List */}
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          {isLoadingClusters ? (
            <div className="p-8 text-center text-gray-500">
              Loading clusters...
            </div>
          ) : clusters.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium">No clusters found</p>
              <p className="text-sm mt-2">
                Create your first cluster to get started
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cluster Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Manager
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agronomy Expert
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Area (ha)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clusters.map((cluster) => (
                      <tr key={cluster.clusterId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {cluster.clusterName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {cluster.clusterManagerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {cluster.clusterManagerPhoneNumber}
                              </div>
                              <div className="text-xs text-gray-400">
                                {cluster.clusterManagerEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {cluster.agronomyExpertName ? (
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {cluster.agronomyExpertName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {cluster.agronomyExpertPhoneNumber}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {cluster.agronomyExpertEmail}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">
                              Not assigned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {cluster.area ? cluster.area.toFixed(2) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCluster(cluster)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {/* <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing page {clusterPage} of {clustersData?.data?.totalPages || 1}{' '}
                  ({clustersData?.data?.totalCount || 0} total clusters)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setClusterPage((p) => Math.max(1, p - 1))}
                    disabled={!clusterHasPrevious}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setClusterPage((p) => p + 1)}
                    disabled={!clusterHasNext}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ContentLayout>
  );
};

export default AdminClustersRoute;
