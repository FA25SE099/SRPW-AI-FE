import { PolygonTask } from "@/types/polygon-task";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Save, X, Pencil } from "lucide-react";
import React from "react";

interface DrawingPanelProps {
    task: PolygonTask;
    polygonArea: number;
    notes: string;
    onNotesChange: (notes: string) => void;
    onComplete: () => void;
    onCancel: () => void;
    isCompleting: boolean;
    hasPolygon: boolean;
}

// Helper function để convert priority
const getPriorityText = (priority: number | string | undefined): string => {
    if (typeof priority === 'string') return priority;
    if (typeof priority === 'number') {
        switch (priority) {
            case 1: return 'High';
            case 2: return 'Medium';
            case 3: return 'Low';
            default: return 'Unknown';
        }
    }
    return 'Unknown';
};

const getPriorityLevel = (priority: number | string | undefined): 'High' | 'Medium' | 'Low' | 'Unknown' => {
    if (typeof priority === 'string') {
        return priority as 'High' | 'Medium' | 'Low' | 'Unknown';
    }
    if (typeof priority === 'number') {
        switch (priority) {
            case 1: return 'High';
            case 2: return 'Medium';
            case 3: return 'Low';
            default: return 'Unknown';
        }
    }
    return 'Unknown';
};

export const DrawingPanel = ({
    task,
    polygonArea,
    notes,
    onNotesChange,
    onComplete,
    onCancel,
    isCompleting,
    hasPolygon
}: DrawingPanelProps) => {
    const priorityLevel = getPriorityLevel(task.priority);
    const priorityText = getPriorityText(task.priority);

    return (
        <Card className="absolute top-20 right-4 w-80 bg-white shadow-lg z-20">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Pencil className="w-5 h-5 text-blue-600" />
                    Drawing Polygon
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Task Info */}
                <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-sm">Plot Information</span>
                    </div>
                    <div className="space-y-1 text-sm">
                        <div>Thửa: <span className="font-medium">{task.soThua}</span></div>
                        <div>Tờ: <span className="font-medium">{task.soTo}</span></div>
                        <div>Farmer: <span className="font-medium">{task.farmerName}</span></div>
                        {task.priority !== undefined && (
                            <div>Priority: <span className={`font-medium ${priorityLevel === 'High' ? 'text-red-600' :
                                    priorityLevel === 'Medium' ? 'text-orange-600' : 'text-green-600'
                                }`}>{priorityText}</span></div>
                        )}
                    </div>
                </div>

                {/* Drawing Status */}
                <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Drawing Status</div>
                    {hasPolygon ? (
                        <div className="space-y-1 text-sm">
                            <div className="text-green-600 font-medium">✓ Polygon completed</div>
                            <div>Area: <span className="font-medium">{polygonArea}m²</span></div>
                            <div>Points: <span className="font-medium">Ready to save</span></div>
                        </div>
                    ) : (
                        <div className="text-orange-600 text-sm">
                            Click on the map to start drawing polygon points
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                    <div className="font-medium mb-1">Instructions:</div>
                    <div>• Click to add polygon points</div>
                    <div>• Double-click to finish drawing</div>
                    <div>• Use trash tool to delete polygon</div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={onComplete}
                        disabled={!hasPolygon || isCompleting}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="sm"
                    >
                        {isCompleting ? (
                            <span>Saving...</span>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Complete Task
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={onCancel}
                        variant="outline"
                        size="sm"
                        disabled={isCompleting}
                    >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};