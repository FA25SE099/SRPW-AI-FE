// GroupFormationModalV2.tsx - New workflow with editable preview
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Map, CheckCircle } from 'lucide-react';
import {
  GroupFormationParams,
  PreviewGroupsResponse,
  PreviewGroup,
  FormGroupsFromPreviewRequest,
} from '../types';
import {
  usePreviewGroupFormationV2,
  useFormGroupsFromPreview
} from '../api';
import { EditablePreviewStep } from './group-formation/editable-preview-step';
import { SuccessStep } from './group-formation/success-step';
import { useNotifications } from '@/components/ui/notifications/notifications-store';

type GroupFormationModalV2Props = {
  isOpen: boolean;
  onClose: () => void;
  clusterId: string;
  seasonId: string;
  year: number;
  availablePlots: number;
  onGroupsCreated?: () => void;
};

export const GroupFormationModalV2 = ({
  isOpen,
  onClose,
  clusterId,
  seasonId,
  year,
  availablePlots,
  onGroupsCreated,
}: GroupFormationModalV2Props) => {
  const { addNotification } = useNotifications();
  const [step, setStep] = useState<'preview' | 'success'>('preview');
  const [params, setParams] = useState<GroupFormationParams>({
    clusterId,
    seasonId,
    year,
    strategy: 'balanced',
    proximityThresholdMeters: 2000,
    plantingDateToleranceDays: 2,
    minGroupAreaHa: 15,
    maxGroupAreaHa: 50,
    minPlots: 5,
    maxPlots: 15,
    autoAssignSupervisors: true,
  });

  const [previewData, setPreviewData] = useState<PreviewGroupsResponse | null>(
    null,
  );
  const [createdGroupsCount, setCreatedGroupsCount] = useState(0);

  const previewMutation = usePreviewGroupFormationV2();
  const formFromPreviewMutation = useFormGroupsFromPreview();

  useEffect(() => {
    if (isOpen && !previewData) {
      previewMutation.mutate(params, {
        onSuccess: (data) => {
          setPreviewData(data);
        },
        onError: (error: any) => {
          addNotification({
            type: 'error',
            title: 'Xem Trước Thất Bại',
            message: error?.message || 'Không thể tạo xem trước',
          });
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleParamsChange = (newParams: GroupFormationParams) => {
    setParams(newParams);
  };

  const handleRecalculate = () => {
    previewMutation.mutate(params, {
      onSuccess: (data) => {
        setPreviewData(data);
        addNotification({
          type: 'success',
          title: 'Đã Tính Toán Lại Nhóm',
          message: `Đã gom ${data.summary.groupsToBeFormed} nhóm với ${data.summary.plotsGrouped} thửa đất`,
        });
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Tính Toán Lại Thất Bại',
          message: error?.message || 'Không thể tính toán lại xem trước',
        });
      },
    });
  };

  const handleConfirm = (editedGroups: PreviewGroup[]) => {
    if (!previewData) return;

    const request: FormGroupsFromPreviewRequest = {
      clusterId: previewData.clusterId,
      seasonId: previewData.seasonId,
      year: previewData.year,
      createGroupsImmediately: true,
      groups: editedGroups.map((g) => ({
        groupName: g.groupName,
        riceVarietyId: g.riceVarietyId,
        plantingWindowStart: g.plantingWindowStart,
        plantingWindowEnd: g.plantingWindowEnd,
        medianPlantingDate: g.medianPlantingDate,
        plotIds: g.plotIds,
        supervisorId: g.supervisorId,
      })),
    };

    formFromPreviewMutation.mutate(request, {
      onSuccess: (data) => {
        // Note: API client unwraps Result<T> responses, so data is already the inner data object
        setCreatedGroupsCount(data.groupsCreated);
        setStep('success');

        addNotification({
          type: 'success',
          title: 'Thành Công',
          message: `Đã tạo ${data.groupsCreated} nhóm thành công`,
        });

        // Show warnings if any
        if (data.warnings && data.warnings.length > 0) {
          data.warnings.forEach((warning) => {
            addNotification({
              type: 'warning',
              title: 'Cảnh Báo',
              message: warning,
            });
          });
        }

        // Notify parent component
        onGroupsCreated?.();
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Tạo Nhóm Thất Bại',
          message: error?.message || 'Không thể tạo nhóm',
        });
      },
    });
  };

  const handleClose = () => {
    setStep('preview');
    setPreviewData(null);
    setCreatedGroupsCount(0);
    onClose();
  };

  const getTitle = () => {
    switch (step) {
      case 'preview':
        return (
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Xem Trước Gom Nhóm (Quy Trình Mới)
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Gom Nhóm Thành Công
          </div>
        );
      default:
        return 'Gom Nhóm';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-6">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        {step === 'preview' && (
          <div className="flex-1 overflow-hidden">
            {previewMutation.isPending && !previewData ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Spinner size="lg" className="mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Đang phân tích thửa đất và gom nhóm với phân công giám sát viên...
                  </p>
                </div>
              </div>
            ) : previewData ? (
              <EditablePreviewStep
                preview={previewData}
                params={params}
                availablePlots={availablePlots}
                onParamsChange={handleParamsChange}
                onRecalculate={handleRecalculate}
                onConfirm={handleConfirm}
                onCancel={handleClose}
                isLoading={formFromPreviewMutation.isPending}
                isRecalculating={previewMutation.isPending}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Không thể tạo xem trước
                </p>
              </div>
            )}
          </div>
        )}

        {step === 'success' && (
          <SuccessStep
            groupsCreated={createdGroupsCount}
            plotsGrouped={previewData?.summary.plotsGrouped || 0}
            ungroupedPlots={previewData?.summary.ungroupedPlots || 0}
            onViewGroups={handleClose}
            onHandleUngrouped={() => {
              handleClose();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

