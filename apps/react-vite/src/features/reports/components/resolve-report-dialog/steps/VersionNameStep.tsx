import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '../types';

type VersionNameStepProps = {
    register: UseFormRegister<FormData>;
    errors: FieldErrors<FormData>;
};

export const VersionNameStep = ({ register, errors }: VersionNameStepProps) => {
    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Version Name *</label>
                <input
                    type="text"
                    {...register('versionName', { required: 'Version name is required' })}
                    placeholder="e.g., Report Resolution v2.0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.versionName && (
                    <p className="text-sm text-red-600 mt-1">{errors.versionName.message}</p>
                )}
            </div>
        </div>
    );
};

