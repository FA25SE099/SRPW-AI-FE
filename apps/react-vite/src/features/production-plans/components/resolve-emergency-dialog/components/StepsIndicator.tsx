import { ChevronRight } from 'lucide-react';
import { Step } from '../types';

type StepsIndicatorProps = {
    currentStep: Step;
};

export const StepsIndicator = ({ currentStep }: StepsIndicatorProps) => {
    return (
        <div className="border-b px-6 py-3 bg-gray-50">
            <div className="flex items-center gap-2 text-sm">
                <span
                    className={`px-3 py-1 rounded-full ${
                        currentStep === 'protocol'
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'bg-gray-200 text-gray-600'
                    }`}
                >
                    1. Protocol & Report
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span
                    className={`px-3 py-1 rounded-full ${
                        currentStep === 'plots'
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'bg-gray-200 text-gray-600'
                    }`}
                >
                    2. Select Plots
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span
                    className={`px-3 py-1 rounded-full ${
                        currentStep === 'edit'
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'bg-gray-200 text-gray-600'
                    }`}
                >
                    3. Edit Tasks
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span
                    className={`px-3 py-1 rounded-full ${
                        currentStep === 'name'
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'bg-gray-200 text-gray-600'
                    }`}
                >
                    4. Version Name
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span
                    className={`px-3 py-1 rounded-full ${
                        currentStep === 'preview'
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'bg-gray-200 text-gray-600'
                    }`}
                >
                    5. Preview
                </span>
            </div>
        </div>
    );
};

