import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Bug, Cloud, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSeasons } from '../api/get-seasons';
import { useRiceVarietiesSimple } from '../api/get-rice-varieties-simple';

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
const THRESHOLD_OPERATORS = ['Greater Than', 'Less Than', 'Equal To', 'Between'];
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
    const { register, handleSubmit, reset, setValue } = useForm<EditableThreshold>();
    const [enablePest, setEnablePest] = useState(!!initialData?.pestProtocolId || true);
    const [enableWeather, setEnableWeather] = useState(!!initialData?.weatherProtocolId || false);

    // Fetch seasons and rice varieties directly in this component
    const { data: seasonsResponse, isLoading: isLoadingSeasons } = useSeasons();
    const { data: riceVarietiesResponse, isLoading: isLoadingRiceVarieties } = useRiceVarietiesSimple();

    // FIX: seasonsResponse is already the array, not an object with .data
    const seasons = Array.isArray(seasonsResponse) ? seasonsResponse : seasonsResponse?.data || [];
    const riceVarieties = Array.isArray(riceVarietiesResponse) ? riceVarietiesResponse : riceVarietiesResponse?.data || [];

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
    }, [isOpen, seasonsResponse, riceVarietiesResponse, seasons, riceVarieties, isLoadingSeasons, isLoadingRiceVarieties]);

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
                        <h3 className="text-lg font-bold">{isEditMode ? 'Edit' : 'Add'} Threshold</h3>
                        <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                            <span className="text-lg">✕</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(handleAdd)} className="p-5 space-y-4">
                        {/* Threshold Type Selection */}
                        <div className="flex gap-3">
                            <label className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${enablePest ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                                <input type="checkbox" checked={enablePest} onChange={(e) => setEnablePest(e.target.checked)} className="rounded text-orange-600 focus:ring-orange-500" />
                                <Bug className="h-4 w-4 text-orange-600" />
                                <span className="text-sm font-medium text-gray-700">Pest Threshold</span>
                            </label>
                            <label className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${enableWeather ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                                <input type="checkbox" checked={enableWeather} onChange={(e) => setEnableWeather(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                <Cloud className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">Weather Threshold</span>
                            </label>
                        </div>

                        {!enablePest && !enableWeather && (
                            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs text-yellow-800">Please enable at least one threshold type</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            {/* Pest Threshold Card */}
                            {enablePest && (
                                <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-3">
                                    <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2 text-sm">
                                        <Bug className="h-4 w-4" />Pest Settings
                                    </h4>
                                    <div className="space-y-2">
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Pest Protocol</label>
                                            <div className="flex gap-1">
                                                <select {...register('pestProtocolId')} className="flex-1 rounded-md border px-2 py-1 text-xs bg-white">
                                                    <option value="">Select...</option>
                                                    {pestProtocols.map((p: any) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                                                </select>
                                                <button type="button" onClick={onCreatePestProtocol} className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-md">
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Affect Type *</label>
                                                <input {...register('pestAffectType', { required: enablePest })} placeholder="Leaf Damage" className="w-full rounded-md border px-2 py-1 text-xs bg-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Severity *</label>
                                                <select {...register('pestSeverityLevel', { required: enablePest })} className="w-full rounded-md border px-2 py-1 text-xs bg-white">
                                                    <option value="">Select...</option>
                                                    {SEVERITY_LEVELS.map(level => (<option key={level} value={level}>{level}</option>))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Area % *</label>
                                                <input type="number" step="0.1" {...register('pestAreaThresholdPercent', { required: enablePest, valueAsNumber: true })} className="w-full rounded-md border px-2 py-1 text-xs bg-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Damage % *</label>
                                                <input type="number" step="0.1" {...register('pestDamageThresholdPercent', { required: enablePest, valueAsNumber: true })} className="w-full rounded-md border px-2 py-1 text-xs bg-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Population</label>
                                                <input {...register('pestPopulationThreshold')} placeholder="10/plant" className="w-full rounded-md border px-2 py-1 text-xs bg-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Growth Stage</label>
                                                <input {...register('pestGrowthStage')} placeholder="Tillering" className="w-full rounded-md border px-2 py-1 text-xs bg-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Notes</label>
                                            <textarea {...register('pestThresholdNotes')} rows={2} className="w-full rounded-md border px-2 py-1 text-xs bg-white" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Weather Threshold Card */}
                            {enableWeather && (
                                <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-3">
                                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                                        <Cloud className="h-4 w-4" />Weather Settings
                                    </h4>
                                    <div className="space-y-2">
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Weather Protocol</label>
                                            <div className="flex gap-1">
                                                <select {...register('weatherProtocolId')} className="flex-1 rounded-md border px-2 py-1 text-xs bg-white">
                                                    <option value="">Select...</option>
                                                    {weatherProtocols.map((w: any) => (<option key={w.id} value={w.id}>{w.name}</option>))}
                                                </select>
                                                <button type="button" onClick={onCreateWeatherProtocol} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Event Type *</label>
                                                <input {...register('weatherEventType', { required: enableWeather })} placeholder="Heavy Rain" className="w-full rounded-md border px-2 py-1 text-xs bg-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Intensity *</label>
                                                <select {...register('weatherIntensityLevel', { required: enableWeather })} className="w-full rounded-md border px-2 py-1 text-xs bg-white">
                                                    <option value="">Select...</option>
                                                    {SEVERITY_LEVELS.map(level => (<option key={level} value={level}>{level}</option>))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Threshold *</label>
                                                <input type="number" step="0.1" {...register('weatherMeasurementThreshold', { required: enableWeather, valueAsNumber: true })} className="w-full rounded-md border px-2 py-1 text-xs bg-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Unit *</label>
                                                <input {...register('weatherMeasurementUnit', { required: enableWeather })} placeholder="mm, °C" className="w-full rounded-md border px-2 py-1 text-xs bg-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Operator *</label>
                                                <select {...register('weatherThresholdOperator', { required: enableWeather })} className="w-full rounded-md border px-2 py-1 text-xs bg-white">
                                                    <option value="">Select...</option>
                                                    {THRESHOLD_OPERATORS.map(op => (<option key={op} value={op}>{op}</option>))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Duration (days)</label>
                                                <input type="number" {...register('weatherDurationDaysThreshold', { valueAsNumber: true })} className="w-full rounded-md border px-2 py-1 text-xs bg-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Notes</label>
                                            <textarea {...register('weatherThresholdNotes')} rows={2} className="w-full rounded-md border px-2 py-1 text-xs bg-white" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Common Settings */}
                        <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-3">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Common Settings</h4>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Applicable Season *</label>
                                    <select
                                        {...register('applicableSeason', { required: true })}
                                        disabled={isLoadingSeasons}
                                        className="w-full rounded-md border px-2 py-1 text-xs bg-white"
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
                                        <p className="text-[9px] text-red-600 mt-0.5">Failed to load seasons</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Rice Variety</label>
                                    <select
                                        {...register('riceVarietyId')}
                                        disabled={isLoadingRiceVarieties}
                                        className="w-full rounded-md border px-2 py-1 text-xs bg-white"
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
                                        <p className="text-[9px] text-red-600 mt-0.5">Failed to load rice varieties</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Priority (1-5) *</label>
                                    <select {...register('priority', { required: true, valueAsNumber: true })} className="w-full rounded-md border px-2 py-1 text-xs bg-white">
                                        <option value="">Select...</option>
                                        {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="mt-2">
                                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">General Notes</label>
                                <textarea {...register('generalNotes')} rows={2} className="w-full rounded-md border px-2 py-1 text-xs bg-white" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t">
                            <Button type="button" variant="outline" onClick={onClose} size="sm">Cancel</Button>
                            <Button type="submit" disabled={!enablePest && !enableWeather} size="sm">
                                {isEditMode ? 'Update' : 'Add'} Threshold
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};