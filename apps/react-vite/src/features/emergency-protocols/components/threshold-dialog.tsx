import { Bug, Cloud, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';

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
  onCreatePestProtocol: () => void;
  onCreateWeatherProtocol: () => void;
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
  const { register, handleSubmit, reset, setValue } =
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
        setValue(key as any, initialData[key]);
      });
      setEnablePest(!!initialData.pestProtocolId);
      setEnableWeather(!!initialData.weatherProtocolId);
    } else if (!isOpen) {
      reset();
      setEnablePest(true);
      setEnableWeather(false);
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
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative z-10 w-full max-w-5xl rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="text-lg font-bold">
              {isEditMode ? 'Edit' : 'Add'} Threshold
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
                  onChange={(e) => setEnablePest(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <Bug className="size-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">
                  Pest Threshold
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
                  Weather Threshold
                </span>
              </label>
            </div>

            {!enablePest && !enableWeather && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-2">
                <p className="text-xs text-yellow-800">
                  Please enable at least one threshold type
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
                  Pest Settings
                </h4>
                {enablePest ? (
                  <div className="space-y-2">
                    <div>
                      <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                        Pest Protocol
                      </label>
                      <div className="flex gap-1">
                        <select
                          {...register('pestProtocolId')}
                          className="flex-1 rounded-md border bg-white px-2 py-1 text-xs"
                        >
                          <option value="">Select...</option>
                          {pestProtocols.map((p: any) => (
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
                          Affect Type *
                        </label>
                        <input
                          {...register('pestAffectType', {
                            required: enablePest,
                          })}
                          placeholder="Leaf Damage"
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Severity *
                        </label>
                        <select
                          {...register('pestSeverityLevel', {
                            required: enablePest,
                          })}
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        >
                          <option value="">Select...</option>
                          {SEVERITY_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Area % *
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
                          Damage % *
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
                          Population
                        </label>
                        <input
                          {...register('pestPopulationThreshold')}
                          placeholder="10/plant"
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Growth Stage
                        </label>
                        <input
                          {...register('pestGrowthStage')}
                          placeholder="Tillering"
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                        Notes
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
                    Enable Pest Threshold to configure
                  </div>
                )}
              </div>

              {/* Weather Threshold Card (always rendered, content conditional) */}
              <div
                className={`rounded-lg border-2 ${enableWeather ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50 opacity-60'} p-3`}
              >
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900">
                  <Cloud className="size-4" />
                  Weather Settings
                </h4>
                {enableWeather ? (
                  <div className="space-y-2">
                    <div>
                      <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                        Weather Protocol
                      </label>
                      <div className="flex gap-1">
                        <select
                          {...register('weatherProtocolId')}
                          className="flex-1 rounded-md border bg-white px-2 py-1 text-xs"
                        >
                          <option value="">Select...</option>
                          {weatherProtocols.map((w: any) => (
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
                          Event Type *
                        </label>
                        <input
                          {...register('weatherEventType', {
                            required: enableWeather,
                          })}
                          placeholder="Heavy Rain"
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Intensity *
                        </label>
                        <select
                          {...register('weatherIntensityLevel', {
                            required: enableWeather,
                          })}
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        >
                          <option value="">Select...</option>
                          {SEVERITY_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Threshold *
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
                          Unit *
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
                          Operator *
                        </label>
                        <select
                          {...register('weatherThresholdOperator', {
                            required: enableWeather,
                          })}
                          className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                        >
                          <option value="">Select...</option>
                          {THRESHOLD_OPERATORS.map((op) => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                          Duration (days)
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
                        Notes
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
                    Enable Weather Threshold to configure
                  </div>
                )}
              </div>
            </div>

            {/* Common Settings */}
            <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-3">
              <h4 className="mb-2 text-sm font-semibold text-gray-900">
                Common Settings
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                    Applicable Season *
                  </label>
                  <select
                    {...register('applicableSeason', { required: true })}
                    disabled={isLoadingSeasons}
                    className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                  >
                    <option value="">Select...</option>
                    {isLoadingSeasons ? (
                      <option disabled>Loading seasons...</option>
                    ) : seasons.length > 0 ? (
                      seasons.map((s) => (
                        <option key={s.id} value={s.seasonType}>
                          {s.seasonName} ({s.seasonType})
                        </option>
                      ))
                    ) : (
                      <option disabled>No seasons available</option>
                    )}
                  </select>
                  {!isLoadingSeasons && seasons.length === 0 && (
                    <p className="mt-0.5 text-[9px] text-red-600">
                      Failed to load seasons
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                    Rice Variety
                  </label>
                  <select
                    {...register('riceVarietyId')}
                    disabled={isLoadingRiceVarieties}
                    className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                  >
                    <option value="">None (Optional)</option>
                    {isLoadingRiceVarieties ? (
                      <option disabled>Loading varieties...</option>
                    ) : riceVarieties.length > 0 ? (
                      riceVarieties.map((variety) => (
                        <option key={variety.id} value={variety.id}>
                          {variety.varietyName}
                        </option>
                      ))
                    ) : (
                      <option disabled>No varieties available</option>
                    )}
                  </select>
                  {!isLoadingRiceVarieties && riceVarieties.length === 0 && (
                    <p className="mt-0.5 text-[9px] text-red-600">
                      Failed to load rice varieties
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-medium text-gray-600">
                    Priority (1-5) *
                  </label>
                  <select
                    {...register('priority', {
                      required: true,
                      valueAsNumber: true,
                    })}
                    className="w-full rounded-md border bg-white px-2 py-1 text-xs"
                  >
                    <option value="">Select...</option>
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
                  General Notes
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
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!enablePest && !enableWeather}
                size="sm"
              >
                {isEditMode ? 'Update' : 'Add'} Threshold
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
        onSubmit={(data) => {
          onCreatePestProtocol();
          setIsPestDialogOpen(false);
          refetchPest?.();
        }}
        isLoading={false}
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
            imageLinks: [],
            notes: '',
            isActive: true,
          });
        }}
        onSubmit={(data) => {
          onCreateWeatherProtocol();
          setIsWeatherDialogOpen(false);
          refetchWeather?.();
        }}
        isLoading={false}
        isEditMode={false}
        protocol={weatherForm}
        setProtocol={setWeatherForm}
      />
    </div>
  );
};
