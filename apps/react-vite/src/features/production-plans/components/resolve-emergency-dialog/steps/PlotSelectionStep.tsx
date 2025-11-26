import { FileText } from 'lucide-react';
import { ProductionPlan } from '@/features/production-plans/types';

type PlotSelectionStepProps = {
    planDetails: ProductionPlan;
    selectedPlotIds: Set<string>;
    setSelectedPlotIds: (ids: Set<string>) => void;
};

export const PlotSelectionStep = ({
    planDetails,
    selectedPlotIds,
    setSelectedPlotIds,
}: PlotSelectionStepProps) => {
    return (
        <div className="space-y-4">
            <div className="rounded-lg border bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-900">Select Plots for Emergency Resolution</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            Choose which plots will receive the emergency cultivation tasks. Tasks will be scaled by
                            each plot's area.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
                {planDetails.groupDetails.plots.map((plot) => {
                    const isSelected = selectedPlotIds.has(plot.id);
                    return (
                        <label
                            key={plot.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                isSelected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                        const newSelected = new Set(selectedPlotIds);
                                        if (e.target.checked) {
                                            newSelected.add(plot.id);
                                        } else {
                                            newSelected.delete(plot.id);
                                        }
                                        setSelectedPlotIds(newSelected);
                                    }}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{plot.plotName}</div>
                                    <div className="text-sm text-gray-600 mt-1">Area: {plot.area} ha</div>
                                    {plot.coordinates && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Location: {plot.coordinates}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </label>
                    );
                })}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-green-900 font-medium">
                        {selectedPlotIds.size} plot{selectedPlotIds.size !== 1 ? 's' : ''} selected
                    </span>
                    {selectedPlotIds.size > 0 && (
                        <button
                            onClick={() => setSelectedPlotIds(new Set())}
                            className="text-xs text-green-700 hover:text-green-800 underline"
                        >
                            Clear selection
                        </button>
                    )}
                </div>
                {selectedPlotIds.size === 0 && (
                    <p className="text-xs text-green-700 mt-1">Please select at least one plot to continue</p>
                )}
            </div>
        </div>
    );
};

