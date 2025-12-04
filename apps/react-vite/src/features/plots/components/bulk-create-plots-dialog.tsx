import { Plus, Trash2, Save } from 'lucide-react';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNotifications } from '@/components/ui/notifications';
import { useFarmers } from '@/features/farmers/api/get-farmers';
import { useUser } from '@/lib/auth';
import {
  useCreatePlotsBulk,
  bulkCreatePlotsInputSchema,
  type BulkCreatePlotsInput,
} from '../api/create-plots-bulk';

type BulkCreatePlotsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const BulkCreatePlotsDialog = ({
  open,
  onOpenChange,
}: BulkCreatePlotsDialogProps) => {
  const { addNotification } = useNotifications();
  const user = useUser();

  const farmersQuery = useFarmers({
    params: {
      pageSize: 1000,
      clusterManagerId: user.data?.id,
    },
  });

  const farmers = farmersQuery.data?.data || [];

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BulkCreatePlotsInput>({
    resolver: zodResolver(bulkCreatePlotsInputSchema),
    defaultValues: {
      plots: [
        {
          farmerId: '',
          soThua: '' as any,
          soTo: '' as any,
          area: '' as any,
          soilType: '',
          riceVarietyName: '',
        },
      ],
      clusterManagerId: user.data?.id,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'plots',
  });

  const createMutation = useCreatePlotsBulk({
    mutationConfig: {
      onSuccess: (data) => {
        addNotification({
          type: 'success',
          title: 'Plots Created',
          message: `Successfully created ${data.length} plot(s)`,
        });
        reset();
        onOpenChange(false);
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: error.message || 'Failed to create plots',
        });
      },
    },
  });

  const onSubmit = (data: BulkCreatePlotsInput) => {
    createMutation.mutate({
      ...data,
      clusterManagerId: user.data?.id,
    });
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      reset();
      onOpenChange(false);
    }
  };

  const handleAddPlot = () => {
    append({
      farmerId: '',
      soThua: '' as any,
      soTo: '' as any,
      area: '' as any,
      soilType: '',
      riceVarietyName: '',
    });
  };

  const commonSoilTypes = [
    'Clay',
    'Sandy loam',
    'Clay loam',
    'Loam',
    'Silt loam',
    'Sandy clay',
  ];

  const commonRiceVarieties = [
    'IR64',
    'Jasmine 85',
    'Basmati',
    'OM 5451',
    'OM 6976',
    'Nang Hoa 9',
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Multiple Plots</DialogTitle>
          <DialogDescription>
            Add multiple plots at once. You can assign them to different farmers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Plot Entries */}
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">
                    Plot #{index + 1}
                  </h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Farmer Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Farmer <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register(`plots.${index}.farmerId`)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      <option value="">Select farmer</option>
                      {farmers.map((farmer) => (
                        <option key={farmer.farmerId} value={farmer.farmerId}>
                          {farmer.fullName} ({farmer.farmCode})
                        </option>
                      ))}
                    </select>
                    {errors.plots?.[index]?.farmerId && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.plots[index]?.farmerId?.message}
                      </p>
                    )}
                  </div>

                  {/* Sở Thửa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sở Thửa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...register(`plots.${index}.soThua`)}
                      placeholder="e.g., 123"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    {errors.plots?.[index]?.soThua && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.plots[index]?.soThua?.message}
                      </p>
                    )}
                  </div>

                  {/* Sở Tờ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sở Tờ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...register(`plots.${index}.soTo`)}
                      placeholder="e.g., 456"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    {errors.plots?.[index]?.soTo && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.plots[index]?.soTo?.message}
                      </p>
                    )}
                  </div>

                  {/* Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area (ha) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`plots.${index}.area`)}
                      placeholder="e.g., 2.5"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    {errors.plots?.[index]?.area && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.plots[index]?.area?.message}
                      </p>
                    )}
                  </div>

                  {/* Soil Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Soil Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register(`plots.${index}.soilType`)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      <option value="">Select soil type</option>
                      {commonSoilTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.plots?.[index]?.soilType && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.plots[index]?.soilType?.message}
                      </p>
                    )}
                  </div>

                  {/* Rice Variety */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rice Variety <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register(`plots.${index}.riceVarietyName`)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      <option value="">Select rice variety</option>
                      {commonRiceVarieties.map((variety) => (
                        <option key={variety} value={variety}>
                          {variety}
                        </option>
                      ))}
                    </select>
                    {errors.plots?.[index]?.riceVarietyName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.plots[index]?.riceVarietyName?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Plot Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddPlot}
              className="w-full border-dashed border-2 border-green-300 text-green-600 hover:bg-green-50"
            >
              <Plus className="size-4 mr-2" />
              Add Another Plot
            </Button>
          </div>

          {/* Form-level errors */}
          {errors.plots && !Array.isArray(errors.plots) && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-600">{errors.plots.message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || farmers.length === 0}
              isLoading={createMutation.isPending}
              icon={<Save className="size-4" />}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              Create {fields.length} Plot{fields.length > 1 ? 's' : ''}
            </Button>
          </div>
        </form>

        {farmersQuery.isLoading && (
          <div className="text-center py-4 text-sm text-gray-600">
            Loading farmers...
          </div>
        )}

        {farmers.length === 0 && !farmersQuery.isLoading && (
          <div className="rounded-md bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              No farmers available. Please add farmers first before creating plots.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

