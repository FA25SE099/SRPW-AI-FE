import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notifications';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  YearSeasonList,
  YearSeasonFormDialog,
  useYearSeasonsByCluster,
  useCreateYearSeason,
  useDeleteYearSeason,
  CreateYearSeasonDto,
} from '@/features/yearseason';
import { useExpertProfile } from '@/features/expert/api/get-expert-profile';
import { useSeasons } from '@/features/rice-varieties/api/get-seasons';
import { useRiceVarieties } from '@/features/rice-varieties/api/get-rice-varieties';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const YearSeasonsManagementRoute = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch expert's profile to get their assigned cluster
  const { data: expertProfile, isLoading: isLoadingProfile, error: profileError } = useExpertProfile();
  
  const typedExpertProfile = expertProfile as import('@/features/expert/api/get-expert-profile').ExpertProfile | undefined;
  const clusterId = typedExpertProfile?.clusterId || '';
  const clusterName = typedExpertProfile?.clusterName || '';

  // Fetch seasons from API
  const { data: seasonsData, isLoading: isLoadingSeasons } = useSeasons({
    params: { isActive: true },
  });

  // Fetch rice varieties from API
  const { data: riceVarietiesData, isLoading: isLoadingRiceVarieties } = useRiceVarieties({
    params: { isActive: true },
  });

  // Fetch YearSeasons for expert's assigned cluster
  const { data: yearSeasons, isLoading, refetch } = useYearSeasonsByCluster({
    clusterId,
    queryConfig: {
      enabled: !!clusterId,
    },
  });
  
  const typedYearSeasons = yearSeasons as import('@/features/yearseason/types').YearSeasonsByClusterResponse | undefined;

  // Create mutation
  const createMutation = useCreateYearSeason({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Năm vụ đã được tạo thành công',
        });
        setIsCreateDialogOpen(false);
        refetch();
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Lỗi',
          message: error?.message || 'Không thể tạo Năm vụ',
        });
      },
    },
  });

  // Delete mutation
  const deleteMutation = useDeleteYearSeason({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Năm vụ đã được xóa thành công',
        });
        refetch();
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Lỗi',
          message: error?.message || 'Không thể xóa Năm vụ',
        });
      },
    },
  });

  const handleCreate = (data: CreateYearSeasonDto) => {
    createMutation.mutate(data);
  };

  const handleView = (yearSeasonId: string) => {
    navigate(`/app/yearseason/${yearSeasonId}/dashboard`);
  };

  const handleDelete = (yearSeasonId: string) => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn xóa Năm vụ này không? Hành động này không thể hoàn tác.'
      )
    ) {
      deleteMutation.mutate(yearSeasonId);
    }
  };

  // Show loading state while fetching profile
  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải hồ sơ của bạn...</p>
        </div>
      </div>
    );
  }

  // Show error if profile couldn't be loaded
  if (profileError) {
    return (
      <div className="space-y-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Không thể tải hồ sơ của bạn. Vui lòng thử làm mới trang.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show message if expert has no cluster assigned
  if (!clusterId) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold">Quản lý Năm vụ</h1>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bạn chưa được phân công vào cụm nào. Vui lòng liên hệ quản trị viên để được phân công vào một cụm.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold">Quản lý Năm vụ</h1>
          </div>
          <p className="text-muted-foreground ml-11">
            Quản lý chu kỳ sản xuất lúa theo mùa cho {clusterName}
          </p>
        </div>
      </div>

      {/* Cluster Info Display (Read-only) */}
      <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex-1">
          <label className="text-sm font-medium text-blue-900">Cụm được phân công của bạn:</label>
          <p className="text-lg font-semibold text-blue-700 mt-1">{clusterName}</p>
        </div>
      </div>

      {/* YearSeason List */}
      <YearSeasonList
        yearSeasons={typedYearSeasons?.allSeasons || []}
        clusterName={clusterName}
        isLoading={isLoading}
        onView={handleView}
        onDelete={handleDelete}
        onCreate={() => setIsCreateDialogOpen(true)}
      />

      {/* Create Dialog */}
      <YearSeasonFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
        clusters={[{ id: clusterId, name: clusterName }]}
        seasons={seasonsData || []}
        riceVarieties={riceVarietiesData || []}
        isLoadingSeasons={isLoadingSeasons}
        isLoadingRiceVarieties={isLoadingRiceVarieties}
      />
    </div>
  );
};

export default YearSeasonsManagementRoute;

