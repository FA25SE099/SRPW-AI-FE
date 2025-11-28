import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { GroupFormationParams, GroupPreviewResult } from '../types';
import { usePreviewGroupFormation, useCreateGroups } from '../api';
import { PreviewStepWithParams } from './group-formation/preview-step-with-params';
import { SuccessStep } from './group-formation/success-step';
import { useNotifications } from '@/components/ui/notifications/notifications-store';

type GroupFormationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  clusterId: string;
  seasonId: string;
  year: number;
  availablePlots: number;
};

export const GroupFormationModal = ({
  isOpen,
  onClose,
  clusterId,
  seasonId,
  year,
  availablePlots,
}: GroupFormationModalProps) => {
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

  const [previewData, setPreviewData] = useState<GroupPreviewResult | null>(
    null,
  );

  const previewMutation = usePreviewGroupFormation();
  const createMutation = useCreateGroups();

  // Auto-load preview when modal opens (only once)
  useEffect(() => {
    if (isOpen && !previewData) {
      previewMutation.mutate(params, {
        onSuccess: (data) => {
          setPreviewData(data);
        },
        onError: (error: any) => {
          addNotification({
            type: 'error',
            title: 'Preview Failed',
            message: error?.message || 'Failed to generate preview',
          });
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleParamsChange = (newParams: GroupFormationParams) => {
    // Only update params, don't trigger API call
    // User must click "Recalculate Groups" button to fetch new preview
    setParams(newParams);
  };

  const handleRecalculate = () => {
    // Trigger recalculation when button is clicked
    previewMutation.mutate(params, {
      onSuccess: (data) => {
        setPreviewData(data);
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Recalculation Failed',
          message: error?.message || 'Failed to recalculate preview',
        });
      },
    });
  };

  const handleConfirm = () => {
    createMutation.mutate(params, {
      onSuccess: (data) => {
        setStep('success');
        setPreviewData({
          totalGroupsFormed: data.groupsCreated,
          totalPlotsGrouped: data.plotsAssigned,
          ungroupedPlots: data.ungroupedPlots,
          proposedGroups: [],
          ungroupedPlotsList: [],
        });
        addNotification({
          type: 'success',
          title: 'Success',
          message: `${data.groupsCreated} groups created successfully`,
        });
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: error?.message || 'Failed to create groups',
        });
      },
    });
  };

  const handleClose = () => {
    setStep('preview');
    setPreviewData(null);
    onClose();
  };

  const getTitle = () => {
    switch (step) {
      case 'preview':
        return '🗺️ Group Formation Preview';
      case 'success':
        return '✅ Groups Created Successfully';
      default:
        return 'Group Formation';
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
                  <p className="text-muted-foreground">Analyzing plots and generating groups...</p>
                </div>
              </div>
            ) : previewData ? (
              <PreviewStepWithParams
                preview={previewData}
                params={params}
                availablePlots={availablePlots}
                onParamsChange={handleParamsChange}
                onRecalculate={handleRecalculate}
                onConfirm={handleConfirm}
                onCancel={handleClose}
                isLoading={createMutation.isPending}
                isRecalculating={previewMutation.isPending}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Failed to generate preview</p>
                <Button onClick={handleClose} className="mt-4">Close</Button>
              </div>
            )}
          </div>
        )}

        {step === 'success' && previewData && (
          <SuccessStep
            groupsCreated={previewData.totalGroupsFormed}
            plotsGrouped={previewData.totalPlotsGrouped}
            ungroupedPlots={previewData.ungroupedPlots}
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

