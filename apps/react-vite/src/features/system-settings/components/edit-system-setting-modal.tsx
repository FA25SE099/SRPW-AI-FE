import { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/components/ui/notifications';
import { useUpdateSystemSetting } from '../api';
import { SystemSetting } from '../types';

interface EditSystemSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  setting: SystemSetting | null;
}

export const EditSystemSettingModal = ({
  isOpen,
  onClose,
  setting,
}: EditSystemSettingModalProps) => {
  const { addNotification } = useNotifications();
  const [settingValue, setSettingValue] = useState('');
  const [settingDescription, setSettingDescription] = useState('');

  useEffect(() => {
    if (setting) {
      setSettingValue(setting.settingValue);
      setSettingDescription(setting.settingDescription);
    }
  }, [setting]);

  const updateMutation = useUpdateSystemSetting({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'System setting updated successfully',
        });
        handleClose();
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Error',
          message: error?.message || 'Failed to update system setting',
        });
      },
    },
  });

  const handleClose = () => {
    setSettingValue('');
    setSettingDescription('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!setting) return;

    await updateMutation.mutateAsync({
      id: setting.id,
      data: {
        settingValue: settingValue.trim(),
        settingDescription: settingDescription.trim() || undefined,
      },
    });
  };

  if (!setting) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit System Setting
          </DialogTitle>
          <DialogDescription>
            Update the value and description for this system setting
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Read-only fields */}
          <div className="space-y-4 rounded-lg bg-gray-50 p-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Setting Key (Read-only)
              </Label>
              <Input
                value={setting.settingKey}
                disabled
                className="bg-gray-100 text-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Category (Read-only)
              </Label>
              <Input
                value={setting.settingCategory}
                disabled
                className="bg-gray-100 text-gray-600"
              />
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-2">
            <Label htmlFor="settingValue">
              Setting Value <span className="text-red-500">*</span>
            </Label>
            <Input
              id="settingValue"
              value={settingValue}
              onChange={(e) => setSettingValue(e.target.value)}
              placeholder="Enter setting value"
              required
              autoFocus
            />
            <p className="text-xs text-gray-500">
              The actual value for this system setting
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settingDescription">
              Description (Optional)
            </Label>
            <textarea
              id="settingDescription"
              value={settingDescription}
              onChange={(e) => setSettingDescription(e.target.value)}
              placeholder="Enter a description for this setting..."
              rows={4}
              maxLength={500}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 text-right">
              {settingDescription.length}/500 characters
            </p>
          </div>

          {/* Metadata */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium text-gray-900">
                {new Date(setting.createdAt).toLocaleString()}
              </span>
            </div>
            {setting.lastModifiedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Modified:</span>
                <span className="font-medium text-gray-900">
                  {new Date(setting.lastModifiedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Setting'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

