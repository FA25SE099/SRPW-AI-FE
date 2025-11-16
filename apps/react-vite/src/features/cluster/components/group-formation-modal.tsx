import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GroupFormationParams, GroupPreviewResult } from '../types';
import { usePreviewGroupFormation, useCreateGroups } from '../api';
import { ParameterStep } from './group-formation/parameter-step';
import { PreviewStep } from './group-formation/preview-step';
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
  const [step, setStep] = useState<'parameters' | 'preview' | 'success'>(
    'parameters',
  );
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

  const handlePreview = () => {
    previewMutation.mutate(params, {
      onSuccess: (data) => {
        setPreviewData(data);
        setStep('preview');
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Preview Failed',
          message: error?.message || 'Failed to generate preview',
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
    setStep('parameters');
    setPreviewData(null);
    onClose();
  };

  const getTitle = () => {
    switch (step) {
      case 'parameters':
        return '🎯 Automatic Group Formation';
      case 'preview':
        return '📋 Group Formation Preview';
      case 'success':
        return '✅ Groups Created Successfully';
      default:
        return 'Group Formation';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        {step === 'parameters' && (
          <ParameterStep
            params={params}
            availablePlots={availablePlots}
            onChange={setParams}
            onPreview={handlePreview}
            onFormNow={handleConfirm}
            isLoading={previewMutation.isPending || createMutation.isPending}
          />
        )}

        {step === 'preview' && previewData && (
          <PreviewStep
            preview={previewData}
            onBack={() => setStep('parameters')}
            onConfirm={handleConfirm}
            onAdjust={() => setStep('parameters')}
            isLoading={createMutation.isPending}
          />
        )}

        {step === 'success' && previewData && (
          <SuccessStep
            groupsCreated={previewData.totalGroupsFormed}
            plotsGrouped={previewData.totalPlotsGrouped}
            ungroupedPlots={previewData.ungroupedPlots}
            onViewGroups={handleClose}
            onHandleUngrouped={() => {
              handleClose();
              // TODO: Navigate to ungrouped plots manager
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

