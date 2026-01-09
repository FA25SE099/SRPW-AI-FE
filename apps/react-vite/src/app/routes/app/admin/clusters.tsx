import { useState, useEffect, useMemo } from 'react';
import { Users, UserCheck, Search, Edit } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
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
import {
  useClusters,
  useCreateCluster,
  useUpdateCluster,
  useClusterManagers,
  useCreateClusterManager,
  useAgronomyExperts,
  useCreateAgronomyExpert,
  useSupervisors,
  useCreateSupervisor,
} from '@/features/cluster/api/cluster-management';
import {
  Cluster,
  ClusterManager,
  AgronomyExpert,
  Supervisor,
  SortBy,
} from '@/features/cluster/types';
import { ManagerSelectDialog } from '@/features/cluster/components/manager-select-dialog';
import { ExpertSelectDialog } from '@/features/cluster/components/expert-select-dialog';
import { CreateManagerDialog } from '@/features/cluster/components/create-manager-dialog';
import { CreateExpertDialog } from '@/features/cluster/components/create-expert-dialog';
import { SupervisorSelectDialog } from '@/features/cluster/components/supervisor-select-dialog';

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

  // Shared create manager/expert/supervisor dialogs
  const [isManagerDialogOpen, setIsManagerDialogOpen] = useState(false);
  const [isExpertDialogOpen, setIsExpertDialogOpen] = useState(false);
  const [isSupervisorDialogOpen, setIsSupervisorDialogOpen] = useState(false);

  // Shared manager/expert/supervisor selection dialogs
  const [isManagerSelectOpen, setIsManagerSelectOpen] = useState(false);
  const [isExpertSelectOpen, setIsExpertSelectOpen] = useState(false);
  const [isSupervisorSelectOpen, setIsSupervisorSelectOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Search and pagination for managers
  const [managerSearch, setManagerSearch] = useState('');
  const [managerPhoneSearch, setManagerPhoneSearch] = useState('');
  const [managerPage, setManagerPage] = useState(1);
  const [managerPageSize] = useState(10);
  const [managerFreeOrAssigned, setManagerFreeOrAssigned] = useState<
    boolean | null
  >(true);

  // Search and pagination for experts
  const [expertSearch, setExpertSearch] = useState('');
  const [expertPhoneSearch, setExpertPhoneSearch] = useState('');
  const [expertPage, setExpertPage] = useState(1);
  const [expertPageSize] = useState(10);
  const [expertFreeOrAssigned, setExpertFreeOrAssigned] = useState<
    boolean | null
  >(true);

  // Search and pagination for supervisors
  const [supervisorSearch, setSupervisorSearch] = useState('');
  const [supervisorPhoneSearch, setSupervisorPhoneSearch] = useState('');
  const [supervisorAdvancedSearch, setSupervisorAdvancedSearch] = useState('');
  const [supervisorPage, setSupervisorPage] = useState(1);
  const [supervisorPageSize] = useState(10);
  const [selectedSupervisorIds, setSelectedSupervisorIds] = useState<string[]>(
    [],
  );
  const [allSupervisors, setAllSupervisors] = useState<Supervisor[]>([]);

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

  const [newSupervisor, setNewSupervisor] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    maxFarmerCapacity: 100,
  });

  // Fetch clusters list
  const { data: clustersData, isLoading: isLoadingClusters } = useClusters(
    clusterPage,
    clusterPageSize,
    clusterNameSearch,
    managerExpertNameSearch,
    phoneNumberSearch,
    sortBy,
  );

  // Fetch cluster managers
  const { data: managersData, isLoading: isLoadingManagers } =
    useClusterManagers(
      managerPage,
      managerPageSize,
      managerSearch,
      managerPhoneSearch,
      managerFreeOrAssigned,
      isManagerSelectOpen,
    );

  // Fetch agronomy experts
  const { data: expertsData, isLoading: isLoadingExperts } = useAgronomyExperts(
    expertPage,
    expertPageSize,
    expertSearch,
    expertPhoneSearch,
    expertFreeOrAssigned,
    isExpertSelectOpen,
  );

  // Fetch supervisors
  const { data: supervisorsData, isLoading: isLoadingSupervisors } =
    useSupervisors(
      supervisorPage,
      supervisorPageSize,
      supervisorSearch,
      supervisorPhoneSearch,
      supervisorAdvancedSearch,
      isSupervisorSelectOpen,
    );

  // Create cluster mutation
  const createClusterMutation = useCreateCluster();

  // Create cluster manager mutation
  const createManagerMutation = useCreateClusterManager();

  // Create agronomy expert mutation
  const createExpertMutation = useCreateAgronomyExpert();

  // Create supervisor mutation
  const createSupervisorMutation = useCreateSupervisor();

  // Update cluster mutation
  const updateClusterMutation = useUpdateCluster();

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
    // Set selected supervisors from cluster and add them to allSupervisors
    const clusterSupervisorIds =
      cluster.supervisors?.map((s) => s.supervisorId) || [];
    setSelectedSupervisorIds(clusterSupervisorIds);

    // Add cluster supervisors to allSupervisors if they exist
    if (cluster.supervisors && cluster.supervisors.length > 0) {
      const clusterSupervisorsData: Supervisor[] = cluster.supervisors.map(
        (s) => ({
          supervisorId: s.supervisorId,
          supervisorName: s.fullName || 'Unknown',
          supervisorPhoneNumber: s.phoneNumber || '',
          email: s.email || '',
          clusterId: cluster.clusterId,
          assignedDate: s.assignedDate,
          currentFarmerCount: s.currentFarmerCount,
          maxFarmerCapacity: s.maxFarmerCapacity,
        }),
      );

      setAllSupervisors((prev) => {
        const newSupervisors = clusterSupervisorsData.filter(
          (s) =>
            !prev.some((existing) => existing.supervisorId === s.supervisorId),
        );
        return [...prev, ...newSupervisors];
      });
    }

    setIsEditMode(true);
    setIsEditDialogOpen(true);
  };

  const handleCreateCluster = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !clusterName ||
      !selectedManagerId ||
      !selectedExpertId ||
      selectedSupervisorIds.length === 0
    ) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message:
          'Please fill in all required fields (including at least one supervisor)',
      });
      return;
    }

    createClusterMutation.mutate(
      {
        clusterName,
        clusterManagerId: selectedManagerId,
        agronomyExpertId: selectedExpertId,
        supervisorIds:
          selectedSupervisorIds.length > 0 ? selectedSupervisorIds : null,
      },
      {
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: 'Thành công',
            message: 'Tạo cụm thành công',
          });
          handleCreateDialogClose();
        },
        onError: (error: any) => {
          console.error('Create cluster error:', error);
          addNotification({
            type: 'error',
            title: 'Lỗi',
            message: error?.response?.data?.message || 'Không thể tạo cụm',
          });
        },
      },
    );
  };

  const handleUpdateCluster = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !editingCluster ||
      !clusterName ||
      !selectedManagerId ||
      !selectedExpertId ||
      selectedSupervisorIds.length === 0
    ) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message:
          'Please fill in all required fields (including at least one supervisor)',
      });
      return;
    }

    updateClusterMutation.mutate(
      {
        clusterId: editingCluster.clusterId,
        clusterName: clusterName,
        clusterManagerId: selectedManagerId,
        agronomyExpertId: selectedExpertId,
        supervisorIds:
          selectedSupervisorIds.length > 0 ? selectedSupervisorIds : null,
      },
      {
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: 'Thành công',
            message: 'Cập nhật cụm thành công',
          });
          handleEditDialogClose();
        },
        onError: (error: any) => {
          console.error('Update cluster error:', error);
          addNotification({
            type: 'error',
            title: 'Lỗi',
            message: error?.response?.data?.message || 'Không thể cập nhật cụm',
          });
        },
      },
    );
  };

  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false);
    setClusterName('');
    setSelectedManagerId('');
    setSelectedExpertId('');
    setSelectedManagerName('');
    setSelectedExpertName('');
    setSelectedSupervisorIds([]);
    setIsEditMode(false);
  };

  const handleSupervisorSelectOpen = (open: boolean) => {
    if (open) {
      // Invalidate and refetch supervisors list when dialog opens to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['supervisors'] });
    }
    setIsSupervisorSelectOpen(open);
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
    setSelectedSupervisorIds([]);
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
    e.stopPropagation();

    createManagerMutation.mutate(newManager, {
      onSuccess: (response) => {
        console.log('Manager created, full response:', response);

        addNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Tạo quản lý cụm thành công',
        });

        // Extract the new manager ID from response
        const newManagerId = response?.data || response;
        console.log('New manager ID:', newManagerId);

        // Set the newly created manager as selected
        setSelectedManagerId(newManagerId);
        setSelectedManagerName(
          `${newManager.fullName} (${newManager.phoneNumber})`,
        );

        console.log(
          'Manager set - ID:',
          newManagerId,
          'Name:',
          `${newManager.fullName} (${newManager.phoneNumber})`,
        );

        // Close dialog and reset form
        setIsManagerDialogOpen(false);
        setNewManager({ fullName: '', email: '', phoneNumber: '' });
      },
      onError: (error: any) => {
        console.error('Create manager error:', error);
        addNotification({
          type: 'error',
          title: 'Error',
          message:
            error?.response?.data?.message ||
            'Failed to create cluster manager',
        });
      },
    });
  };

  const handleCreateExpert = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    createExpertMutation.mutate(newExpert, {
      onSuccess: (response) => {
        console.log('Expert created, full response:', response);

        addNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Tạo chuyên gia nông học thành công',
        });

        // Extract the new expert ID from response
        const newExpertId = response?.data || response;
        console.log('New expert ID:', newExpertId);

        // Set the newly created expert as selected
        setSelectedExpertId(newExpertId);
        setSelectedExpertName(
          `${newExpert.fullName} (${newExpert.phoneNumber})`,
        );

        console.log(
          'Expert set - ID:',
          newExpertId,
          'Name:',
          `${newExpert.fullName} (${newExpert.phoneNumber})`,
        );

        // Close dialog and reset form
        setIsExpertDialogOpen(false);
        setNewExpert({ fullName: '', email: '', phoneNumber: '' });
      },
      onError: (error: any) => {
        console.error('Create expert error:', error);
        addNotification({
          type: 'error',
          title: 'Error',
          message:
            error?.response?.data?.message ||
            'Failed to create agronomy expert',
        });
      },
    });
  };

  const handleToggleSupervisor = (supervisor: Supervisor) => {
    setSelectedSupervisorIds((prev) => {
      if (prev.includes(supervisor.supervisorId)) {
        return prev.filter((id) => id !== supervisor.supervisorId);
      } else {
        return [...prev, supervisor.supervisorId];
      }
    });
  };

  const handleConfirmSupervisors = () => {
    setIsSupervisorSelectOpen(false);
  };

  const handleCreateSupervisor = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    createSupervisorMutation.mutate(newSupervisor, {
      onSuccess: (response) => {
        console.log('Supervisor created, full response:', response);

        addNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Tạo giám sát viên thành công',
        });

        // Extract the new supervisor ID from response
        const newSupervisorId = response?.data || response;
        console.log('New supervisor ID:', newSupervisorId);

        // Add the newly created supervisor to selected list
        setSelectedSupervisorIds((prev) => [...prev, newSupervisorId]);

        // Add to allSupervisors immediately
        const createdSupervisor: Supervisor = {
          supervisorId: newSupervisorId,
          supervisorName: newSupervisor.fullName,
          supervisorPhoneNumber: newSupervisor.phoneNumber,
          email: newSupervisor.email,
          clusterId: null,
          assignedDate: null,
          currentFarmerCount: 0,
          maxFarmerCapacity: newSupervisor.maxFarmerCapacity,
        };
        setAllSupervisors((prev) => [createdSupervisor, ...prev]);

        console.log('Supervisor added to selection - ID:', newSupervisorId);

        // Close dialog and reset form
        setIsSupervisorDialogOpen(false);
        setNewSupervisor({
          fullName: '',
          email: '',
          phoneNumber: '',
          maxFarmerCapacity: 100,
        });
      },
      onError: (error: any) => {
        console.error('Create supervisor error:', error);
        addNotification({
          type: 'error',
          title: 'Lỗi',
          message:
            error?.response?.data?.message || 'Không thể tạo giám sát viên',
        });
      },
    });
  };

  const managers: ClusterManager[] = managersData?.data || [];
  const experts: AgronomyExpert[] = expertsData?.data || [];
  const rawSupervisors = supervisorsData?.data || [];

  const supervisors: Supervisor[] = useMemo(() => {
    return rawSupervisors.map((s: any) => ({
      supervisorId: s.supervisorId,
      supervisorName: s.fullName || s.supervisorName || '',
      supervisorPhoneNumber: s.phoneNumber || s.supervisorPhoneNumber || '',
      email: s.email || '',
      clusterId: s.clusterId || null,
      assignedDate: s.assignedDate || null,
      currentFarmerCount: s.currentFarmerCount || 0,
      maxFarmerCapacity: s.maxFarmerCapacity || 10,
    }));
  }, [rawSupervisors]);

  const clusters: Cluster[] = clustersData?.data || [];

  // Track all supervisors including newly selected ones
  useEffect(() => {
    if (supervisors.length > 0) {
      setAllSupervisors((prev) => {
        const newSupervisors = supervisors.filter(
          (s) =>
            !prev.some((existing) => existing.supervisorId === s.supervisorId),
        );
        return [...prev, ...newSupervisors];
      });
    }
  }, [supervisors]);
  const managerHasNext = managersData?.data.hasNext || false;
  const managerHasPrevious = managersData?.data.hasPrevious || false;
  const expertHasNext = expertsData?.data.hasNext || false;
  const expertHasPrevious = expertsData?.data.hasPrevious || false;
  const supervisorHasNext = supervisorsData?.data.hasNext || false;
  const supervisorHasPrevious = supervisorsData?.data.hasPrevious || false;
  const clusterHasNext = clustersData?.data.hasNext || false;
  const clusterHasPrevious = clustersData?.data.hasPrevious || false;

  return (
    <ContentLayout title="Quản lý cụm">
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Các cụm</h2>
            <p className="mt-1 text-sm text-gray-600">
              Quản lý cụm, phân công quản lý và chuyên gia nông học
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setIsEditMode(false)}>Tạo cụm</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo cụm mới</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateCluster} className="space-y-6">
                {/* Cluster Name */}
                <div className="space-y-2">
                  <Label htmlFor="clusterName">Tên cụm *</Label>
                  <Input
                    id="clusterName"
                    value={clusterName}
                    onChange={(e) => setClusterName(e.target.value)}
                    placeholder="Nhập tên cụm"
                    required
                  />
                </div>

                {/* Cluster Manager */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Quản lý cụm *</Label>
                    <CreateManagerDialog
                      open={isManagerDialogOpen}
                      onOpenChange={setIsManagerDialogOpen}
                      fullName={newManager.fullName}
                      email={newManager.email}
                      phoneNumber={newManager.phoneNumber}
                      onFullNameChange={(value) =>
                        setNewManager({ ...newManager, fullName: value })
                      }
                      onEmailChange={(value) =>
                        setNewManager({ ...newManager, email: value })
                      }
                      onPhoneNumberChange={(value) =>
                        setNewManager({ ...newManager, phoneNumber: value })
                      }
                      onSubmit={handleCreateManager}
                      isCreating={createManagerMutation.isPending}
                    />
                  </div>

                  <ManagerSelectDialog
                    open={isManagerSelectOpen}
                    onOpenChange={setIsManagerSelectOpen}
                    selectedManagerId={selectedManagerId}
                    selectedManagerName={selectedManagerName}
                    managers={managers}
                    isLoading={isLoadingManagers}
                    search={managerSearch}
                    phoneSearch={managerPhoneSearch}
                    freeOrAssigned={managerFreeOrAssigned}
                    page={managerPage}
                    hasNext={managerHasNext}
                    hasPrevious={managerHasPrevious}
                    totalPages={managersData?.data?.totalPages || 1}
                    totalCount={managersData?.data?.totalCount || 0}
                    onSearchChange={setManagerSearch}
                    onPhoneSearchChange={setManagerPhoneSearch}
                    onFilterChange={setManagerFreeOrAssigned}
                    onPageChange={setManagerPage}
                    onSelect={handleSelectManager}
                  />
                </div>

                {/* Agronomy Expert */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Chuyên gia nông học *</Label>
                    <CreateExpertDialog
                      open={isExpertDialogOpen}
                      onOpenChange={setIsExpertDialogOpen}
                      fullName={newExpert.fullName}
                      email={newExpert.email}
                      phoneNumber={newExpert.phoneNumber}
                      onFullNameChange={(value) =>
                        setNewExpert({ ...newExpert, fullName: value })
                      }
                      onEmailChange={(value) =>
                        setNewExpert({ ...newExpert, email: value })
                      }
                      onPhoneNumberChange={(value) =>
                        setNewExpert({ ...newExpert, phoneNumber: value })
                      }
                      onSubmit={handleCreateExpert}
                      isCreating={createExpertMutation.isPending}
                    />
                  </div>

                  <ExpertSelectDialog
                    open={isExpertSelectOpen}
                    onOpenChange={setIsExpertSelectOpen}
                    selectedExpertId={selectedExpertId}
                    selectedExpertName={selectedExpertName}
                    experts={experts}
                    isLoading={isLoadingExperts}
                    search={expertSearch}
                    phoneSearch={expertPhoneSearch}
                    freeOrAssigned={expertFreeOrAssigned}
                    page={expertPage}
                    hasNext={expertHasNext}
                    hasPrevious={expertHasPrevious}
                    totalPages={expertsData?.data?.totalPages || 1}
                    totalCount={expertsData?.data?.totalCount || 0}
                    onSearchChange={setExpertSearch}
                    onPhoneSearchChange={setExpertPhoneSearch}
                    onFilterChange={setExpertFreeOrAssigned}
                    onPageChange={setExpertPage}
                    onSelect={handleSelectExpert}
                  />
                </div>

                {/* Supervisors */}
                <div className="space-y-2">
                  <Label>Giám sát viên *</Label>

                  <SupervisorSelectDialog
                    open={isSupervisorSelectOpen}
                    onOpenChange={handleSupervisorSelectOpen}
                    selectedSupervisorIds={selectedSupervisorIds}
                    supervisors={supervisors}
                    allSupervisors={allSupervisors}
                    isLoading={isLoadingSupervisors}
                    search={supervisorSearch}
                    phoneSearch={supervisorPhoneSearch}
                    advancedSearch={supervisorAdvancedSearch}
                    page={supervisorPage}
                    hasNext={supervisorHasNext}
                    hasPrevious={supervisorHasPrevious}
                    totalPages={supervisorsData?.data?.totalPages || 1}
                    totalCount={supervisorsData?.data?.totalCount || 0}
                    onSearchChange={setSupervisorSearch}
                    onPhoneSearchChange={setSupervisorPhoneSearch}
                    onAdvancedSearchChange={setSupervisorAdvancedSearch}
                    onPageChange={setSupervisorPage}
                    onToggleSelect={handleToggleSupervisor}
                    onConfirm={handleConfirmSupervisors}
                    isCreateDialogOpen={isSupervisorDialogOpen}
                    onCreateDialogOpenChange={setIsSupervisorDialogOpen}
                    newSupervisor={newSupervisor}
                    onNewSupervisorChange={(field, value) =>
                      setNewSupervisor({ ...newSupervisor, [field]: value })
                    }
                    onCreateSubmit={handleCreateSupervisor}
                    isCreating={createSupervisorMutation.isPending}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCreateDialogClose}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={createClusterMutation.isPending}
                  >
                    {createClusterMutation.isPending
                      ? 'Đang tạo...'
                      : 'Tạo cụm'}
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
              <DialogTitle>Chỉnh sửa cụm</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateCluster} className="space-y-6">
              {/* Cluster Name */}
              <div className="space-y-2">
                <Label htmlFor="editClusterName">Tên cụm *</Label>
                <Input
                  id="editClusterName"
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                  placeholder="Nhập tên cụm"
                  required
                />
              </div>

              {/* Cluster Manager */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Quản lý cụm *</Label>
                  <CreateManagerDialog
                    open={isManagerDialogOpen}
                    onOpenChange={setIsManagerDialogOpen}
                    fullName={newManager.fullName}
                    email={newManager.email}
                    phoneNumber={newManager.phoneNumber}
                    onFullNameChange={(value) =>
                      setNewManager({ ...newManager, fullName: value })
                    }
                    onEmailChange={(value) =>
                      setNewManager({ ...newManager, email: value })
                    }
                    onPhoneNumberChange={(value) =>
                      setNewManager({ ...newManager, phoneNumber: value })
                    }
                    onSubmit={handleCreateManager}
                    isCreating={createManagerMutation.isPending}
                  />
                </div>

                <ManagerSelectDialog
                  open={isManagerSelectOpen}
                  onOpenChange={setIsManagerSelectOpen}
                  selectedManagerId={selectedManagerId}
                  selectedManagerName={selectedManagerName}
                  managers={managers}
                  isLoading={isLoadingManagers}
                  search={managerSearch}
                  phoneSearch={managerPhoneSearch}
                  freeOrAssigned={managerFreeOrAssigned}
                  page={managerPage}
                  hasNext={managerHasNext}
                  hasPrevious={managerHasPrevious}
                  totalPages={managersData?.data?.totalPages || 1}
                  totalCount={managersData?.data?.totalCount || 0}
                  onSearchChange={setManagerSearch}
                  onPhoneSearchChange={setManagerPhoneSearch}
                  onFilterChange={setManagerFreeOrAssigned}
                  onPageChange={setManagerPage}
                  onSelect={handleSelectManager}
                />
              </div>

              {/* Agronomy Expert */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Chuyên gia nông học *</Label>
                  <CreateExpertDialog
                    open={isExpertDialogOpen}
                    onOpenChange={setIsExpertDialogOpen}
                    fullName={newExpert.fullName}
                    email={newExpert.email}
                    phoneNumber={newExpert.phoneNumber}
                    onFullNameChange={(value) =>
                      setNewExpert({ ...newExpert, fullName: value })
                    }
                    onEmailChange={(value) =>
                      setNewExpert({ ...newExpert, email: value })
                    }
                    onPhoneNumberChange={(value) =>
                      setNewExpert({ ...newExpert, phoneNumber: value })
                    }
                    onSubmit={handleCreateExpert}
                    isCreating={createExpertMutation.isPending}
                  />
                </div>

                <ExpertSelectDialog
                  open={isExpertSelectOpen}
                  onOpenChange={setIsExpertSelectOpen}
                  selectedExpertId={selectedExpertId}
                  selectedExpertName={selectedExpertName}
                  experts={experts}
                  isLoading={isLoadingExperts}
                  search={expertSearch}
                  phoneSearch={expertPhoneSearch}
                  freeOrAssigned={expertFreeOrAssigned}
                  page={expertPage}
                  hasNext={expertHasNext}
                  hasPrevious={expertHasPrevious}
                  totalPages={expertsData?.data?.totalPages || 1}
                  totalCount={expertsData?.data?.totalCount || 0}
                  onSearchChange={setExpertSearch}
                  onPhoneSearchChange={setExpertPhoneSearch}
                  onFilterChange={setExpertFreeOrAssigned}
                  onPageChange={setExpertPage}
                  onSelect={handleSelectExpert}
                />
              </div>

              {/* Supervisors */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Giám sát viên (Ít nhất 1)</Label>
                </div>

                <SupervisorSelectDialog
                  open={isSupervisorSelectOpen}
                  onOpenChange={handleSupervisorSelectOpen}
                  selectedSupervisorIds={selectedSupervisorIds}
                  supervisors={supervisors}
                  allSupervisors={allSupervisors}
                  isLoading={isLoadingSupervisors}
                  search={supervisorSearch}
                  phoneSearch={supervisorPhoneSearch}
                  advancedSearch={supervisorAdvancedSearch}
                  page={supervisorPage}
                  hasNext={supervisorHasNext}
                  hasPrevious={supervisorHasPrevious}
                  totalPages={supervisorsData?.data?.totalPages || 1}
                  totalCount={supervisorsData?.data?.totalCount || 0}
                  onSearchChange={setSupervisorSearch}
                  onPhoneSearchChange={setSupervisorPhoneSearch}
                  onAdvancedSearchChange={setSupervisorAdvancedSearch}
                  onPageChange={setSupervisorPage}
                  onToggleSelect={handleToggleSupervisor}
                  onConfirm={handleConfirmSupervisors}
                  isCreateDialogOpen={isSupervisorDialogOpen}
                  onCreateDialogOpenChange={setIsSupervisorDialogOpen}
                  newSupervisor={newSupervisor}
                  onNewSupervisorChange={(field, value) =>
                    setNewSupervisor({ ...newSupervisor, [field]: value })
                  }
                  onCreateSubmit={handleCreateSupervisor}
                  isCreating={createSupervisorMutation.isPending}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEditDialogClose}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={updateClusterMutation.isPending}
                >
                  {updateClusterMutation.isPending
                    ? 'Đang cập nhật...'
                    : 'Cập nhật cụm'}
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
                placeholder="Tìm theo tên cụm"
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
                placeholder="Tìm theo tên/email quản lý/chuyên gia"
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
                placeholder="Tìm theo số điện thoại"
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
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SortBy.NameAscending}>Tên (A-Z)</SelectItem>
                <SelectItem value={SortBy.NameDescending}>Tên (Z-A)</SelectItem>
                <SelectItem value={SortBy.DateCreatedAscending}>
                  Ngày (Cũ nhất)
                </SelectItem>
                <SelectItem value={SortBy.DateCreatedDescending}>
                  Ngày (Mới nhất)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clusters List */}
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          {isLoadingClusters ? (
            <div className="p-8 text-center text-gray-500">Đang tải cụm...</div>
          ) : clusters.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium">Không tìm thấy cụm nào</p>
              <p className="text-sm mt-2">Tạo cụm đầu tiên để bắt đầu</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên cụm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quản lý
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chuyên gia nông học
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giám sát viên
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
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
                          {cluster.supervisors &&
                          cluster.supervisors.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-900">
                                {cluster.supervisors.length} giám sát viên
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">
                              Không có giám sát viên
                            </span>
                          )}
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
                  Trang {clusterPage} / {clustersData?.data?.totalPages || 1} (
                  {clustersData?.data?.totalCount || 0} tổng số cụm)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setClusterPage((p) => Math.max(1, p - 1))}
                    disabled={!clusterHasPrevious}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setClusterPage((p) => p + 1)}
                    disabled={!clusterHasNext}
                  >
                    Sau
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
