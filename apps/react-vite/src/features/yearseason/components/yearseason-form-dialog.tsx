import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Loader2 } from 'lucide-react';
import { YearSeason, CreateYearSeasonDto, YearSeasonStatus } from '../types';
import { Season, RiceVariety } from '@/types/api';
import { useCalculateSeasonDates } from '../api';

type YearSeasonFormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateYearSeasonDto) => void;
  yearSeason?: YearSeason;
  isLoading?: boolean;
  clusters?: Array<{ id: string; name: string }>;
  seasons?: Season[];
  riceVarieties?: RiceVariety[];
  isLoadingSeasons?: boolean;
  isLoadingRiceVarieties?: boolean;
};

type FormData = {
  seasonId: string;
  clusterId: string;
  year: number;
  riceVarietyId?: string;
  startDate: string;
  endDate: string;
  planningWindowStart: string;
  planningWindowEnd: string;
  allowedPlantingFlexibilityDays: number;
  materialConfirmationDaysBeforePlanting: number;

  // ✨ NEW: Farmer Selection Fields
  allowFarmerSelection: boolean;
  farmerSelectionWindowStart?: string;
  farmerSelectionWindowEnd?: string;
};

export const YearSeasonFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  yearSeason,
  isLoading,
  clusters = [],
  seasons = [],
  riceVarieties = [],
  isLoadingSeasons = false,
  isLoadingRiceVarieties = false,
}: YearSeasonFormDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      year: new Date().getFullYear(),
      allowedPlantingFlexibilityDays: 7,
      materialConfirmationDaysBeforePlanting: 14,
      allowFarmerSelection: false, // ✨ NEW: Default to false (backward compatible)
    },
  });

  const selectedSeasonId = watch('seasonId');
  const selectedYear = watch('year');

  // ✨ API CALL: Fetch calculated dates from backend
  const { data: calculatedDates, isLoading: isCalculatingDates } = useCalculateSeasonDates({
    params: {
      seasonId: selectedSeasonId || '',
      year: selectedYear || new Date().getFullYear(),
    },
    queryConfig: {
      enabled: !!selectedSeasonId && !!selectedYear && !yearSeason,
    },
  });

  // Helper function to convert YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  // Helper function to convert DD/MM/YYYY to YYYY-MM-DD for storage
  const formatDateForStorage = (dateString: string): string => {
    if (!dateString) return '';
    if (/^\d{2}\/\d{2}\/\d{4}/.test(dateString)) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    }
    return dateString;
  };

  // Helper function to convert date to YYYY-MM-DD format for HTML date input
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';

    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      return dateString.split('T')[0];
    }

    // If in ISO format with time, extract date part
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }

    // If in MM/DD/YYYY format (from backend calculate-dates API), convert to YYYY-MM-DD
    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateString)) {
      const parts = dateString.split('/');
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }

    return dateString;
  };

  // ✨ AUTO-FILL: Apply calculated dates when received from API
  useEffect(() => {
    if (calculatedDates && !yearSeason) {
      console.log('📅 Calculated dates received:', calculatedDates);

      // Convert to YYYY-MM-DD format for date inputs
      const startDateFormatted = formatDateForInput(calculatedDates.startDate);
      const endDateFormatted = formatDateForInput(calculatedDates.endDate);

      console.log('📅 Formatted dates:', {
        startDate: startDateFormatted,
        endDate: endDateFormatted,
        planningStart: formatDateForInput(calculatedDates.suggestedPlanningWindowStart),
        planningEnd: formatDateForInput(calculatedDates.suggestedPlanningWindowEnd),
      });

      setValue('startDate', startDateFormatted);
      setValue('endDate', endDateFormatted);

      // ✨ BONUS: Auto-fill suggested planning window
      if (calculatedDates.suggestedPlanningWindowStart) {
        setValue('planningWindowStart', formatDateForInput(calculatedDates.suggestedPlanningWindowStart));
      }
      if (calculatedDates.suggestedPlanningWindowEnd) {
        setValue('planningWindowEnd', formatDateForInput(calculatedDates.suggestedPlanningWindowEnd));
      }

      // ✨ Auto-fill farmer selection window if farmer selection is enabled
      if (watch('allowFarmerSelection')) {
        if (calculatedDates.suggestedFarmerSelectionWindowStart) {
          setValue('farmerSelectionWindowStart', formatDateForInput(calculatedDates.suggestedFarmerSelectionWindowStart));
        }
        if (calculatedDates.suggestedFarmerSelectionWindowEnd) {
          setValue('farmerSelectionWindowEnd', formatDateForInput(calculatedDates.suggestedFarmerSelectionWindowEnd));
        }
      }
    }
  }, [calculatedDates, setValue, watch, yearSeason]);

  useEffect(() => {
    if (yearSeason) {
      reset({
        seasonId: yearSeason.seasonId,
        clusterId: yearSeason.clusterId,
        year: yearSeason.year,
        riceVarietyId: yearSeason.riceVarietyId || undefined,
        startDate: formatDateForInput(yearSeason.startDate),
        endDate: formatDateForInput(yearSeason.endDate),
        planningWindowStart: formatDateForInput(yearSeason.planningWindowStart),
        planningWindowEnd: formatDateForInput(yearSeason.planningWindowEnd),
        allowedPlantingFlexibilityDays: yearSeason.allowedPlantingFlexibilityDays,
        materialConfirmationDaysBeforePlanting:
          yearSeason.materialConfirmationDaysBeforePlanting,
        // ✨ NEW: Farmer Selection Fields
        allowFarmerSelection: yearSeason.allowFarmerSelection || false,
        farmerSelectionWindowStart: formatDateForInput(yearSeason.farmerSelectionWindowStart),
        farmerSelectionWindowEnd: formatDateForInput(yearSeason.farmerSelectionWindowEnd),
      });
    }
  }, [yearSeason, reset]);

  const handleFormSubmit = (data: FormData) => {
    const payload: CreateYearSeasonDto = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      planningWindowStart: new Date(data.planningWindowStart).toISOString(),
      planningWindowEnd: new Date(data.planningWindowEnd).toISOString(),
      // ✨ NEW: Include farmer selection fields
      allowFarmerSelection: data.allowFarmerSelection,
      farmerSelectionWindowStart: data.farmerSelectionWindowStart
        ? new Date(data.farmerSelectionWindowStart).toISOString()
        : null,
      farmerSelectionWindowEnd: data.farmerSelectionWindowEnd
        ? new Date(data.farmerSelectionWindowEnd).toISOString()
        : null,
      // Make riceVarietyId optional (null if not provided)
      riceVarietyId: data.riceVarietyId || null,
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {yearSeason ? 'Chỉnh Sửa Mùa Vụ Năm' : 'Tạo Mùa Vụ Năm Mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Cluster Selection */}
            <div className="space-y-2">
              <Label htmlFor="clusterId">Cụm *</Label>
              <select
                id="clusterId"
                {...register('clusterId', { required: 'Cụm là bắt buộc' })}
                className="w-full px-3 py-2 border rounded-md"
                disabled={!!yearSeason}
              >
                <option value="">Chọn cụm...</option>
                {clusters.map((cluster) => (
                  <option key={cluster.id} value={cluster.id}>
                    {cluster.name}
                  </option>
                ))}
              </select>
              {errors.clusterId && (
                <p className="text-sm text-red-600">{errors.clusterId.message}</p>
              )}
            </div>

            {/* Season Selection */}
            <div className="space-y-2">
              <Label htmlFor="seasonId">Mùa Vụ *</Label>
              <select
                id="seasonId"
                {...register('seasonId', { required: 'Mùa vụ là bắt buộc' })}
                className="w-full px-3 py-2 border rounded-md"
                disabled={!!yearSeason || isLoadingSeasons}
              >
                <option value="">
                  {isLoadingSeasons ? 'Đang tải mùa vụ...' : 'Chọn mùa vụ...'}
                </option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.seasonName} ({season.seasonType})
                  </option>
                ))}
              </select>
              {errors.seasonId && (
                <p className="text-sm text-red-600">{errors.seasonId.message}</p>
              )}
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year">Năm *</Label>
              <Input
                id="year"
                type="number"
                {...register('year', {
                  required: 'Năm là bắt buộc',
                  min: { value: 2020, message: 'Năm phải từ 2020 trở đi' },
                  max: { value: 2100, message: 'Năm phải từ 2100 trở về trước' },
                })}
                disabled={!!yearSeason}
              />
              {errors.year && (
                <p className="text-sm text-red-600">{errors.year.message}</p>
              )}
            </div>

            {/* Rice Variety */}
            <div className="space-y-2">
              <Label htmlFor="riceVarietyId">
                Giống Lúa {watch('allowFarmerSelection') ? '' : '*'}
              </Label>
              <select
                id="riceVarietyId"
                {...register('riceVarietyId', {
                  required: !watch('allowFarmerSelection') && 'Giống lúa là bắt buộc khi tắt lựa chọn nông dân',
                })}
                className="w-full px-3 py-2 border rounded-md"
                disabled={watch('allowFarmerSelection') || isLoadingRiceVarieties}
              >
                <option value="">
                  {isLoadingRiceVarieties
                    ? 'Đang tải giống lúa...'
                    : watch('allowFarmerSelection')
                      ? 'N/A - Nông dân sẽ chọn giống'
                      : 'Chọn giống lúa...'}
                </option>
                {riceVarieties.map((variety) => (
                  <option key={variety.id} value={variety.id}>
                    {variety.varietyName}
                  </option>
                ))}
              </select>
              {errors.riceVarietyId && (
                <p className="text-sm text-red-600">
                  {errors.riceVarietyId.message}
                </p>
              )}
              {watch('allowFarmerSelection') && (
                <p className="text-xs text-muted-foreground">
                  Nông dân sẽ chọn giống lúa của riêng họ trong cửa sổ lựa chọn
                </p>
              )}
            </div>
          </div>

          {/* Season Dates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Thời Kỳ Mùa Vụ</h3>
              {isCalculatingDates && (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Đang tính toán ngày...
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày Bắt Đầu * (DD/MM/YYYY)</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate', {
                    required: 'Ngày bắt đầu là bắt buộc',
                    validate: (value) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // Reset time to start of day
                      const selectedDate = new Date(value);

                      if (selectedDate < today) {
                        return 'Ngày bắt đầu không thể ở quá khứ';
                      }
                      return true;
                    },
                  })}
                  disabled={isCalculatingDates}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày Kết Thúc * (DD/MM/YYYY)</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate', {
                    required: 'Ngày kết thúc là bắt buộc',
                    validate: (value) => {
                      const start = watch('startDate');
                      if (start && new Date(value) <= new Date(start)) {
                        return 'Ngày kết thúc phải sau ngày bắt đầu';
                      }

                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const selectedDate = new Date(value);

                      if (selectedDate < today) {
                        return 'Ngày kết thúc không thể ở quá khứ';
                      }

                      return true;
                    },
                  })}
                  disabled={isCalculatingDates}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>
            {calculatedDates && !yearSeason && (
              <p className="text-xs text-green-600">
                ✓ Ngày đã được tự động điền từ {calculatedDates.seasonName}
                {calculatedDates.crossesYears && ' (trải qua hai năm)'}
              </p>
            )}
          </div>

          {/* Planning Window */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Cửa Sổ Lập Kế Hoạch</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planningWindowStart">Ngày Bắt Đầu * (DD/MM/YYYY)</Label>
                <Input
                  id="planningWindowStart"
                  type="date"
                  {...register('planningWindowStart', {
                    required: 'Ngày bắt đầu cửa sổ lập kế hoạch là bắt buộc',
                    validate: (value) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const selectedDate = new Date(value);

                      if (selectedDate < today) {
                        return 'Ngày bắt đầu cửa sổ lập kế hoạch không thể ở quá khứ';
                      }
                      return true;
                    },
                  })}
                />
                {errors.planningWindowStart && (
                  <p className="text-sm text-red-600">
                    {errors.planningWindowStart.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="planningWindowEnd">Ngày Kết Thúc * (DD/MM/YYYY)</Label>
                <Input
                  id="planningWindowEnd"
                  type="date"
                  {...register('planningWindowEnd', {
                    required: 'Ngày kết thúc cửa sổ lập kế hoạch là bắt buộc',
                    validate: (value) => {
                      const start = watch('planningWindowStart');
                      const seasonStart = watch('startDate');
                      if (start && new Date(value) <= new Date(start)) {
                        return 'Ngày kết thúc cửa sổ lập kế hoạch phải sau ngày bắt đầu';
                      }
                      if (
                        seasonStart &&
                        new Date(value) >= new Date(seasonStart)
                      ) {
                        return 'Cửa sổ lập kế hoạch phải kết thúc trước khi mùa vụ bắt đầu';
                      }

                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const selectedDate = new Date(value);

                      if (selectedDate < today) {
                        return 'Ngày kết thúc cửa sổ lập kế hoạch không thể ở quá khứ';
                      }

                      return true;
                    },
                  })}
                />
                {errors.planningWindowEnd && (
                  <p className="text-sm text-red-600">
                    {errors.planningWindowEnd.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ✨ NEW: Farmer Selection Configuration */}
          <div className="space-y-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-sm text-blue-900">
                  Lựa Chọn Giống Lúa Của Nông Dân
                </h3>
                <p className="text-xs text-blue-700 mt-1">
                  Cho phép nông dân chọn giống lúa của riêng họ
                </p>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('allowFarmerSelection')}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-blue-900">
                  Bật
                </span>
              </label>
            </div>

            {watch('allowFarmerSelection') && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="farmerSelectionWindowStart" className="text-blue-900">
                    Ngày Bắt Đầu Cửa Sổ Lựa Chọn * (DD/MM/YYYY)
                  </Label>
                  <Input
                    id="farmerSelectionWindowStart"
                    type="date"
                    {...register('farmerSelectionWindowStart', {
                      required: watch('allowFarmerSelection') && 'Ngày bắt đầu cửa sổ lựa chọn là bắt buộc',
                      validate: (value) => {
                        if (!watch('allowFarmerSelection')) return true;

                        const seasonStart = watch('startDate');
                        // if (seasonStart && value && new Date(value) >= new Date(seasonStart)) {
                        //   return 'Selection window must start before season starts';
                        // }
                        return true;
                      },
                    })}
                    className="bg-white"
                  />
                  {errors.farmerSelectionWindowStart && (
                    <p className="text-sm text-red-600">
                      {errors.farmerSelectionWindowStart.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farmerSelectionWindowEnd" className="text-blue-900">
                    Ngày Kết Thúc Cửa Sổ Lựa Chọn * (DD/MM/YYYY)
                  </Label>
                  <Input
                    id="farmerSelectionWindowEnd"
                    type="date"
                    {...register('farmerSelectionWindowEnd', {
                      required: watch('allowFarmerSelection') && 'Ngày kết thúc cửa sổ lựa chọn là bắt buộc',
                      validate: (value) => {
                        if (!watch('allowFarmerSelection')) return true;

                        const start = watch('farmerSelectionWindowStart');
                        if (start && value && new Date(value) <= new Date(start)) {
                          return 'Ngày kết thúc cửa sổ lựa chọn phải sau ngày bắt đầu';
                        }
                        const seasonStart = watch('startDate');
                        if (seasonStart && value && new Date(value) >= new Date(seasonStart)) {
                          return 'Cửa sổ lựa chọn phải kết thúc trước khi mùa vụ bắt đầu';
                        }
                        return true;
                      },
                    })}
                    className="bg-white"
                  />
                  {errors.farmerSelectionWindowEnd && (
                    <p className="text-sm text-red-600">
                      {errors.farmerSelectionWindowEnd.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Additional Settings */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Cài Đặt Bổ Sung</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="allowedPlantingFlexibilityDays">
                  Linh Hoạt Gieo Trồng (ngày)
                </Label>
                <Input
                  id="allowedPlantingFlexibilityDays"
                  type="number"
                  min="0"
                  {...register('allowedPlantingFlexibilityDays', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Phải từ 0 trở lên' },
                  })}
                />
                {errors.allowedPlantingFlexibilityDays && (
                  <p className="text-sm text-red-600">
                    {errors.allowedPlantingFlexibilityDays.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="materialConfirmationDaysBeforePlanting">
                  Số Ngày Xác Nhận Vật Liệu
                </Label>
                <Input
                  id="materialConfirmationDaysBeforePlanting"
                  type="number"
                  min="0"
                  {...register('materialConfirmationDaysBeforePlanting', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Phải từ 0 trở lên' },
                  })}
                />
                {errors.materialConfirmationDaysBeforePlanting && (
                  <p className="text-sm text-red-600">
                    {errors.materialConfirmationDaysBeforePlanting.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {yearSeason ? 'Cập Nhật' : 'Tạo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

