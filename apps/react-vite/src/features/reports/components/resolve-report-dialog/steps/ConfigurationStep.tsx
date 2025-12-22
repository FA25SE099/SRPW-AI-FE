import { useMemo } from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { AlertCircle, Info } from 'lucide-react';
import { FormData } from '../types';
import { useCultivationVersions } from '@/features/supervisor/api/get-cultivation-versions';

type ConfigurationStepProps = {
    register: UseFormRegister<FormData>;
    errors: FieldErrors<FormData>;
    setValue: UseFormSetValue<FormData>;
    watch: UseFormWatch<FormData>;
    plotCultivationId: string | null;
};

export const ConfigurationStep = ({
    register,
    errors,
    setValue,
    watch,
    plotCultivationId
}: ConfigurationStepProps) => {
    const versionName = watch('versionName');

    // Fetch cultivation versions if we have a plotCultivationId
    const { data: versionsResponse, isLoading: isLoadingVersions } = useCultivationVersions({
        plotCultivationId: plotCultivationId || '',
        queryConfig: {
            enabled: !!plotCultivationId,
        },
    });

    const versions = useMemo(() => {
        if (!versionsResponse) return [];
        if (Array.isArray(versionsResponse)) return versionsResponse;
        return (versionsResponse as any).data || [];
    }, [versionsResponse]);

    const existingVersionNames = useMemo(() => {
        return versions.map((v: any) => v.versionName.toLowerCase());
    }, [versions]);

    const isDuplicateName = useMemo(() => {
        if (!versionName || !versionName.trim()) return false;
        return existingVersionNames.includes(versionName.trim().toLowerCase());
    }, [versionName, existingVersionNames]);

    // Debug log
    console.log('ConfigurationStep - plotCultivationId:', plotCultivationId);
    console.log('ConfigurationStep - versionsResponse:', versionsResponse);
    console.log('ConfigurationStep - isLoadingVersions:', isLoadingVersions);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Resolution Report */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution Report *
                </label>
                <textarea
                    {...register('resolutionReason', { required: 'Resolution report is required' })}
                    rows={6}
                    placeholder="Describe how you will address this issue and what changes will be made..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
                {errors.resolutionReason && (
                    <p className="text-sm text-red-600 mt-1">{errors.resolutionReason.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                    This will be saved with the resolution
                </p>
            </div>

            {/* Version Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version Name *
                </label>
                <input
                    type="text"
                    {...register('versionName', {
                        required: 'Version name is required',
                        validate: (value) => {
                            if (!value || !value.trim()) return 'Version name is required';
                            if (isDuplicateName) return 'This version name already exists';
                            return true;
                        }
                    })}
                    placeholder="e.g., Report Resolution v2.0"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${isDuplicateName || errors.versionName
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                        }`}
                />

                {isDuplicateName && (
                    <div className="flex items-start gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                            This version name already exists. Please choose a different name.
                        </span>
                    </div>
                )}

                {errors.versionName && !isDuplicateName && (
                    <p className="text-sm text-red-600 mt-1">{errors.versionName.message}</p>
                )}

                <p className="text-xs text-gray-500 mt-2">
                    Must be unique among existing versions
                </p>
            </div>

            {/* Existing Versions Info */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Existing Versions {versions.length > 0 && `(${versions.length})`}
                </h4>
                {isLoadingVersions ? (
                    <div className="text-sm text-gray-500 py-4 text-center">Loading versions...</div>
                ) : !plotCultivationId ? (
                    <div className="text-sm text-gray-500 py-2">
                        No cultivation plan ID available to fetch versions
                    </div>
                ) : versions.length === 0 ? (
                    <div className="text-sm text-gray-500 py-2">
                        No existing versions found. This will be the first version.
                    </div>
                ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {versions.map((version: any) => (
                            <div
                                key={version.id}
                                className={`text-sm px-3 py-2 rounded ${version.isActive
                                    ? 'bg-blue-100 text-blue-900 font-medium'
                                    : 'bg-white text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{version.versionName}</span>
                                    {version.isActive && (
                                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                                            Active
                                        </span>
                                    )}
                                </div>
                                {version.reason && (
                                    <p className="text-xs mt-1 opacity-75">{version.reason}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
