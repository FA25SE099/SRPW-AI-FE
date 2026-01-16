import { Bug, Cloud, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notifications';

import { usePestProtocols, useCreatePestProtocol } from '../api/get-pest-protocols';
import { useWeatherProtocols, useCreateWeatherProtocol } from '../api/get-weather-protocols';
import { useRiceVarietiesSimple } from '../api/get-rice-varieties-simple';
import { useSeasons } from '../api/get-seasons';

import { PestProtocolDialog } from './pest-protocol-dialog';
import { WeatherProtocolDialog } from './weather-protocol-dialog';

type EditableThreshold = {
  pestProtocolId?: string;
  weatherProtocolId?: string;
  pestAffectType?: string;
  pestSeverityLevel?: string;
  pestAreaThresholdPercent?: number;
  pestPopulationThreshold?: string;
  pestDamageThresholdPercent?: number;
  pestGrowthStage?: string;
  pestThresholdNotes?: string;
  weatherEventType?: string;
  weatherIntensityLevel?: string;
  weatherMeasurementThreshold?: number;
  weatherMeasurementUnit?: string;
  weatherThresholdOperator?: string;
  weatherDurationDaysThreshold?: number;
  weatherThresholdNotes?: string;
  applicableSeason?: string;
  riceVarietyId?: string;
  priority?: number;
  generalNotes?: string;
};

type ThresholdDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (threshold: EditableThreshold) => void;
  pestProtocols: any[];
  weatherProtocols: any[];
  onCreatePestProtocol: () => void | Promise<void>;
  onCreateWeatherProtocol: () => void | Promise<void>;
  initialData?: EditableThreshold | null;
  isEditMode?: boolean;
  onEditComplete?: (threshold: EditableThreshold) => void;
};

const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
const THRESHOLD_OPERATORS = [
  'Greater Than',
  'Less Than',
  'Equal To',
  'Between',
];
const PRIORITY_LEVELS = [1, 2, 3, 4, 5];

export const ThresholdDialog = ({
  isOpen,
  onClose,
  onAdd,
  pestProtocols,
  weatherProtocols,
  onCreatePestProtocol,
  onCreateWeatherProtocol,
  initialData,
  isEditMode,
  onEditComplete,
}: Omit<ThresholdDialogProps, 'riceVarieties' | 'seasons'>) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const { register, handleSubmit, reset, setValue, getValues } =
    useForm<EditableThreshold>();
  const [enablePest, setEnablePest] = useState(
    !!initialData?.pestProtocolId || true,
  );
  const [enableWeather, setEnableWeather] = useState(
    !!initialData?.weatherProtocolId || false,
  );

  // Fetch seasons and rice varieties directly in this component
  const { data: seasonsResponse, isLoading: isLoadingSeasons } = useSeasons();
  const { data: riceVarietiesResponse, isLoading: isLoadingRiceVarieties } =
    useRiceVarietiesSimple();

  // Query pest and weather protocols for the dropdowns
  const { data: pestProtocolsData, refetch: refetchPest } = usePestProtocols({
    params: { currentPage: 1, pageSize: 100, isActive: true },
  });
  const { data: weatherProtocolsData, refetch: refetchWeather } = useWeatherProtocols({
    params: { currentPage: 1, pageSize: 100, isActive: true },
  });

  // Mutations with auto-selection after creation
  const createPestMutation = useCreatePestProtocol({
    mutationConfig: {
      onSuccess: async (response: any) => {
        console.log('Pest protocol created, full response:', response);
        console.log('Response type:', typeof response);

        addNotification({
          type: 'success',
          title: 'Thành Công',
          message: 'Đã tạo quy trình sâu bệnh thành công',
        });

        // The response IS the ID string directly
        const newPestId = typeof response === 'string' ? response : response?.data;
        console.log('New pest protocol ID:', newPestId);

        // Invalidate and wait for refetch to complete
        await queryClient.invalidateQueries({ queryKey: ['pest-protocols'] });
        await refetchPest();

        // Set the newly created pest protocol as selected after data is refreshed
        if (newPestId) {
          setValue('pestProtocolId', newPestId, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
          console.log('Pest protocol set - ID:', newPestId);
          console.log('Form value after setValue:', getValues('pestProtocolId'));
        }
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Lỗi',
          message: error?.message || 'Tạo quy trình sâu bệnh thất bại',
        });
      },
    },
  });

  const createWeatherMutation = useCreateWeatherProtocol({
    mutationConfig: {
      onSuccess: async (response: any) => {
        console.log('Weather protocol created, full response:', response);
        console.log('Response type:', typeof response);

        addNotification({
          type: 'success',
          title: 'Thành Công',
          message: 'Đã tạo quy trình thời tiết thành công',
        });

        // The response IS the ID string directly
        const newWeatherId = typeof response === 'string' ? response : response?.data;
        console.log('New weather protocol ID:', newWeatherId);

        // Invalidate and wait for refetch to complete
        await queryClient.invalidateQueries({ queryKey: ['weather-protocols'] });
        await refetchWeather();

        // Set the newly created weather protocol as selected after data is refreshed
        if (newWeatherId) {
          setValue('weatherProtocolId', newWeatherId, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
          console.log('Weather protocol set - ID:', newWeatherId);
          console.log('Form value after setValue:', getValues('weatherProtocolId'));
        }
      },
      onError: (error: any) => {
        addNotification({
          type: 'error',
          title: 'Lỗi',
          message: error?.message || 'Tạo quy trình thời tiết thất bại',
        });
      },
    },
  });  // Use the queried data instead of props for the dropdowns
  const pestProtocolsList = pestProtocolsData?.data || pestProtocols || [];
  const weatherProtocolsList = weatherProtocolsData?.data || weatherProtocols || [];

  // Refetch protocols whenever the dialog opens
  useEffect(() => {
    if (isOpen) {
      refetchPest();
      refetchWeather();
    }
  }, [isOpen, refetchPest, refetchWeather]);

  // FIX: seasonsResponse is already the array, not an object with .data
  const seasons = Array.isArray(seasonsResponse)
    ? seasonsResponse
    : seasonsResponse?.data || [];
  const riceVarieties = Array.isArray(riceVarietiesResponse)
    ? riceVarietiesResponse
    : riceVarietiesResponse?.data || [];
  const [isPestDialogOpen, setIsPestDialogOpen] = useState(false);
  const [isWeatherDialogOpen, setIsWeatherDialogOpen] = useState(false);
  const [pestForm, setPestForm] = useState({
    id: '',
    name: '',
    description: '',
    type: '',
    imageLinks: [] as string[],
    notes: '',
    isActive: true,
  });
  const [weatherForm, setWeatherForm] = useState({
    id: '',
    name: '',
    description: '',
    source: '',
    sourceLink: '',
    imageLinks: [] as string[],
    notes: '',
    isActive: true,
  });

  // Debug logs
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 ThresholdDialog - Seasons:', {
        seasonsResponse,
        seasons,
        seasonsLength: seasons.length,
        isLoadingSeasons,
      });
      console.log('🔍 ThresholdDialog - Rice Varieties:', {
        riceVarietiesResponse,
        riceVarieties,
        riceVarietiesLength: riceVarieties.length,
        isLoadingRiceVarieties,
      });
    }
  }, [
    isOpen,
    seasonsResponse,
    riceVarietiesResponse,
    seasons,
    riceVarieties,
    isLoadingSeasons,
    isLoadingRiceVarieties,
  ]);

  useEffect(() => {
    if (isEditMode && initialData && isOpen) {
      Object.keys(initialData).forEach((key) => {
        setValue(key as any, (initialData as any)[key]);
      });
      setEnablePest(!!initialData.pestProtocolId as any);
      setEnableWeather(!!initialData.weatherProtocolId as any);
    } else if (!isOpen) {
      reset();
      setEnablePest(true as any);
      setEnableWeather(false as any);
    }
  }, [isEditMode, initialData, isOpen, setValue, reset]);

  const handleAdd = (data: EditableThreshold) => {
    if (!enablePest) {
      data.pestProtocolId = undefined;
      data.pestAffectType = undefined;
      data.pestSeverityLevel = undefined;
      data.pestAreaThresholdPercent = undefined;
      data.pestPopulationThreshold = undefined;
      data.pestDamageThresholdPercent = undefined;
      data.pestGrowthStage = undefined;
      data.pestThresholdNotes = undefined;
    }

    if (!enableWeather) {
      data.weatherProtocolId = undefined;
      data.weatherEventType = undefined;
      data.weatherIntensityLevel = undefined;
      data.weatherMeasurementThreshold = undefined;
      data.weatherMeasurementUnit = undefined;
      data.weatherThresholdOperator = undefined;
      data.weatherDurationDaysThreshold = undefined;
      data.weatherThresholdNotes = undefined;
    }

    if (data.riceVarietyId === '') data.riceVarietyId = undefined;
    if (data.pestProtocolId === '') data.pestProtocolId = undefined;
    if (data.weatherProtocolId === '') data.weatherProtocolId = undefined;

    if (isEditMode && initialData && onEditComplete) {
      onEditComplete({ ...initialData, ...data });
    } else {
      onAdd(data);
    }
    reset();
    onClose();
  };






































  if (!isOpen) return null;

  return (
    <div className={isOpen ? 'fixed inset-0 z-[60] overflow-y-auto' : 'hidden'}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative z-10 w-full max-w-5xl rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="text-lg font-bold">
              {isEditMode ? 'Chỉnh Sửa' : 'Thêm'} Ngưỡng
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <span className="text-lg">✕</span>
            </button>
          </div>

          <form onSubmit={handleSubmit(handleAdd)} className="space-y-4 p-5">
            {/* Threshold Type Selection */}
            <div className="flex gap-3">
              <label
                className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 transition-colors ${enablePest ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
              >
                <input
                  type="checkbox"
                  checked={enablePest}
                  onChange={(e) => setEnablePest(e.target.checked as any)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <Bug className="size-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">
                  Ngưỡng Sâu Bệnh
                </span>
              </label>
              <label
                className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 transition-colors ${enableWeather ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
              >
                <input
                  type="checkbox"
                  checked={enableWeather}
                  onChange={(e) => setEnableWeather(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <Cloud className="size-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Ngưỡng Thời Tiết
                </span>
              </label>
            </div>

            {!enablePest && !enableWeather && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-2">
                <p className="text-xs text-yellow-800">
                  Vui lòng bật ít nhất một loại ngưỡng
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Pest Threshold Card (always rendered, content conditional) */}
              <div
                className={`rounded-lg border-2 ${enablePest ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50 opacity-60'} p-3`}
              >
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-900">
                  <Bug className="size-4" />
                  Cài Đặt Sâu Bệnh
                </h4>
                {enablePest ? (
                  <div className="space-y-2">
                    <div>
                      <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                        Quy Trình Sâu Bệnh
                      </label>
                      <div className="flex gap-1">
                        <select
                          {...register('pestProtocolId')}
                          className="flex-1 rounded-md border bg-white px-2 py-1 text-xs"
                        >
                          <option value="">Chọn...</option>
                          {pestProtocolsList.map((p: any) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsPestDialogOpen(true)}
                          className="rounded-md bg-orange-600 px-2 py-1 text-white hover:bg-orange-700"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Loại Ảnh Hưởng *
                        </label>
                        <input
                          {...register('pestAffectType', {
                            required: enablePest,
                          })}
                          placeholder="Thiệt Hại Lá"
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Mức Độ Nghiêm Trọng *
                        </label>
                        <select
                          {...register('pestSeverityLevel', {
                            required: enablePest,
                          })}
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        >
                          <option value="">Chọn...</option>
                          {SEVERITY_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              {level === 'Low' ? 'Thấp' : level === 'Medium' ? 'Trung Bình' : level === 'High' ? 'Cao' : 'Nghiêm Trọng'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Diện Tích % *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          {...register('pestAreaThresholdPercent', {
                            required: enablePest,
                            valueAsNumber: true,
                          })}
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Thiệt Hại % *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          {...register('pestDamageThresholdPercent', {
                            required: enablePest,
                            valueAsNumber: true,
                          })}
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Số Lượng
                        </label>
                        <input
                          {...register('pestPopulationThreshold')}
                          placeholder="10/cây"
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Giai Đoạn Sinh Trưởng
                        </label>
                        <input
                          {...register('pestGrowthStage')}
                          placeholder="Đẻ Nhánh"
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                        Ghi Chú
                      </label>
                      <textarea
                        {...register('pestThresholdNotes')}
                        rows={2}
                        className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs italic text-gray-400">
                    Bật Ngưỡng Sâu Bệnh để cấu hình
                  </div>
                )}
              </div>

              {/* Weather Threshold Card (always rendered, content conditional) */}
              <div
                className={`rounded-lg border-2 ${enableWeather ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50 opacity-60'} p-3`}
              >
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900">
                  <Cloud className="size-4" />
                  Cài Đặt Thời Tiết
                </h4>
                {enableWeather ? (
                  <div className="space-y-2">
                    <div>
                      <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                        Quy Trình Thời Tiết
                      </label>
                      <div className="flex gap-1">
                        <select
                          {...register('weatherProtocolId')}
                          className="flex-1 rounded-md border bg-white px-2 py-1 text-xs"
                        >
                          <option value="">Chọn...</option>
                          {weatherProtocolsList.map((w: any) => (
                            <option key={w.id} value={w.id}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsWeatherDialogOpen(true)}
                          className="rounded-md bg-blue-600 px-2 py-1 text-white hover:bg-blue-700"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Loại Sự Kiện *
                        </label>
                        <input
                          {...register('weatherEventType', {
                            required: enableWeather,
                          })}
                          placeholder="Mưa Lớn"
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Cường Độ *
                        </label>
                        <select
                          {...register('weatherIntensityLevel', {
                            required: enableWeather,
                          })}
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        >
                          <option value="">Chọn...</option>
                          {SEVERITY_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              {level === 'Low' ? 'Thấp' : level === 'Medium' ? 'Trung Bình' : level === 'High' ? 'Cao' : 'Nghiêm Trọng'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Ngưỡng *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          {...register('weatherMeasurementThreshold', {
                            required: enableWeather,
                            valueAsNumber: true,
                          })}
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Đơn Vị *
                        </label>
                        <input
                          {...register('weatherMeasurementUnit', {
                            required: enableWeather,
                          })}
                          placeholder="mm, °C"
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Toán Tử *
                        </label>
                        <select
                          {...register('weatherThresholdOperator', {
                            required: enableWeather,
                          })}
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        >
                          <option value="">Chọn...</option>
                          {THRESHOLD_OPERATORS.map((op) => (
                            <option key={op} value={op}>
                              {op === 'Greater Than' ? 'Lớn Hơn' : op === 'Less Than' ? 'Nhỏ Hơn' : op === 'Equal To' ? 'Bằng' : 'Giữa'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Thời Gian (ngày)
                        </label>
                        <input
                          type="number"
                          {...register('weatherDurationDaysThreshold', {
                            valueAsNumber: true,
                          })}
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                        Ghi Chú
                      </label>
                      <textarea
                        {...register('weatherThresholdNotes')}
                        rows={2}
                        className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs italic text-gray-400">
                    Bật Ngưỡng Thời Tiết để cấu hình
                  </div>
                )}
              </div>
            </div>

            {/* Common Settings */}
            <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-3">
              <h4 className="mb-2 text-sm font-semibold text-gray-900">
                Cài Đặt Chung
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                    Mùa Vụ Áp Dụng *
                  </label>
                  <select
                    {...register('applicableSeason', { required: true })}
                    disabled={isLoadingSeasons}
                    className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                  >
                    <option value="">Chọn...</option>
                    {isLoadingSeasons ? (
                      <option disabled>Đang tải mùa vụ...</option>
                    ) : seasons.length > 0 ? (
                      seasons.map((s) => (
                        <option key={s.id} value={s.seasonType}>
                          {s.seasonName} ({s.seasonType})
                        </option>
                      ))
                    ) : (
                      <option disabled>Không có mùa vụ</option>
                    )}
                  </select>
                  {!isLoadingSeasons && seasons.length === 0 && (
                    <p className="mt-0.5 text-[9px] text-red-600">
                      Tải mùa vụ thất bại
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                    Giống Lúa
                  </label>
                  <select
                    {...register('riceVarietyId')}
                    disabled={isLoadingRiceVarieties}
                    className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                  >
                    <option value="">Không (Tùy Chọn)</option>
                    {isLoadingRiceVarieties ? (
                      <option disabled>Đang tải giống lúa...</option>
                    ) : riceVarieties.length > 0 ? (
                      riceVarieties.map((variety) => (
                        <option key={variety.id} value={variety.id}>
                          {variety.varietyName}
                        </option>
                      ))
                    ) : (
                      <option disabled>Không có giống lúa</option>
                    )}
                  </select>
                  {!isLoadingRiceVarieties && riceVarieties.length === 0 && (
                    <p className="mt-0.5 text-[9px] text-red-600">
                      Tải giống lúa thất bại
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                    Ưu Tiên (1-5) *
                  </label>
                  <select
                    {...register('priority', {
                      required: true,
                      valueAsNumber: true,
                    })}
                    className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                  >
                    <option value="">Chọn...</option>
                    {PRIORITY_LEVELS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-2">
                <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                  Ghi Chú Chung
                </label>
                <textarea
                  {...register('generalNotes')}
                  rows={2}
                  className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                size="sm"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={!enablePest && !enableWeather}
                size="sm"
              >
                {isEditMode ? 'Cập Nhật' : 'Thêm'} Ngưỡng
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Pest Protocol Dialog */}
      <PestProtocolDialog
        isOpen={isPestDialogOpen}
        onClose={() => {
          setIsPestDialogOpen(false);
          setPestForm({
            id: '',
            name: '',
            description: '',
            type: '',
            imageLinks: [],
            notes: '',
            isActive: true,
          });
        }}
        onSubmit={async (data) => {
          try {
            const response = await createPestMutation.mutateAsync(data);
            console.log('Pest protocol created with response:', response);
            // Close dialog and reset form after successful creation
            setIsPestDialogOpen(false);
            setPestForm({
              id: '',
              name: '',
              description: '',
              type: '',
              imageLinks: [],
              notes: '',
              isActive: true,
            });
          } catch (error) {
            console.error('Failed to create pest protocol:', error);
            // Don't close dialog on error so user can retry
          }
        }}
        isLoading={createPestMutation.isPending}
        isEditMode={false}
        protocol={pestForm}
        setProtocol={setPestForm}
      />

      {/* Weather Protocol Dialog */}
      <WeatherProtocolDialog
        isOpen={isWeatherDialogOpen}
        onClose={() => {
          setIsWeatherDialogOpen(false);
          setWeatherForm({
            id: '',
            name: '',
            description: '',
            source: '',
            sourceLink: '',
            imageLinks: [] as string[],
            notes: '',
            isActive: true,
          });
        }}
        onSubmit={async (data) => {
          try {
            const response = await createWeatherMutation.mutateAsync(data);
            console.log('Weather protocol created with response:', response);
            // Close dialog and reset form after successful creation
            setIsWeatherDialogOpen(false);
            setWeatherForm({
              id: '',
              name: '',
              description: '',
              source: '',
              sourceLink: '',
              imageLinks: [] as string[],
              notes: '',
              isActive: true,
            });
          } catch (error) {
            console.error('Failed to create weather protocol:', error);
            // Don't close dialog on error so user can retry
          }
        }}
        isLoading={createWeatherMutation.isPending}
        isEditMode={false}
        protocol={weatherForm}
        setProtocol={setWeatherForm}
      />
    </div>
  );
};