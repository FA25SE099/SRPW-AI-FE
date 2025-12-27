import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle2, Clock, Play, CheckCheck } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { YearSeasonStatus } from '../types';

type UpdateStatusDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    currentStatus: YearSeasonStatus;
    yearSeasonId: string;
    yearSeasonName: string;
    onStatusUpdate: (newStatus: YearSeasonStatus) => void;
    isUpdating?: boolean;
};

const STATUS_CONFIG: Record<
    YearSeasonStatus,
    {
        label: string;
        description: string;
        icon: any;
        color: string;
        bgColor: string;
        borderColor: string;
        nextStatuses: YearSeasonStatus[];
    }
> = {
    Draft: {
        label: 'Draft',
        description: 'Initial planning phase',
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        nextStatuses: ['PlanningOpen'],
    },
    PlanningOpen: {
        label: 'Planning Open',
        description: 'Farmers can select rice varieties',
        icon: Play,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        nextStatuses: ['Active'],
    },
    Active: {
        label: 'Active',
        description: 'Cultivation in progress',
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        nextStatuses: ['Completed'],
    },
    Completed: {
        label: 'Completed',
        description: 'Season has ended',
        icon: CheckCheck,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        nextStatuses: [],
    },
};

export const UpdateStatusDialog = ({
    isOpen,
    onClose,
    currentStatus,
    yearSeasonId,
    yearSeasonName,
    onStatusUpdate,
    isUpdating = false,
}: UpdateStatusDialogProps) => {
    const [selectedStatus, setSelectedStatus] = useState<YearSeasonStatus | null>(null);

    const currentConfig = STATUS_CONFIG[currentStatus];
    const availableStatuses = currentConfig.nextStatuses;

    const handleConfirm = () => {
        if (selectedStatus) {
            onStatusUpdate(selectedStatus);
        }
    };

    const getStatusWarning = (newStatus: YearSeasonStatus): string | null => {
        switch (newStatus) {
            case 'PlanningOpen':
                return 'Opening planning will allow farmers to select their rice varieties. Make sure all prerequisites are met.';
            case 'Active':
                return 'Activating the season will lock farmer selections and begin cultivation tracking. This action should only be done when planting has started.';
            case 'Completed':
                return 'Completing the season will mark it as finished. This action is permanent and cannot be undone.';
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Update Season Status</DialogTitle>
                    <DialogDescription>
                        Change the status of {yearSeasonName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Current Status */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            Current Status
                        </label>
                        <div
                            className={`flex items-center gap-3 p-4 rounded-lg border ${currentConfig.borderColor} ${currentConfig.bgColor}`}
                        >
                            <currentConfig.icon className={`w-5 h-5 ${currentConfig.color}`} />
                            <div className="flex-1">
                                <div className="font-semibold text-foreground">{currentConfig.label}</div>
                                <div className="text-sm text-muted-foreground">
                                    {currentConfig.description}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Available Status Transitions */}
                    {availableStatuses.length > 0 ? (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                Change Status To
                            </label>
                            <div className="space-y-2">
                                {availableStatuses.map((status) => {
                                    const config = STATUS_CONFIG[status];
                                    const isSelected = selectedStatus === status;

                                    return (
                                        <button
                                            key={status}
                                            onClick={() => setSelectedStatus(status)}
                                            className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all ${isSelected
                                                ? `${config.borderColor} ${config.bgColor} ring-2 ring-offset-2`
                                                : 'border-muted bg-background hover:border-muted-foreground/50'
                                                }`}
                                            disabled={isUpdating}
                                        >
                                            <config.icon
                                                className={`w-5 h-5 ${isSelected ? config.color : 'text-muted-foreground'}`}
                                            />
                                            <div className="flex-1 text-left">
                                                <div
                                                    className={`font-semibold ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}
                                                >
                                                    {config.label}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {config.description}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 className={`w-5 h-5 ${config.color}`} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                This season has reached its final status and cannot be changed further.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Warning Message */}
                    {selectedStatus && getStatusWarning(selectedStatus) && (
                        <Alert className="bg-orange-50 border-orange-200">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                                {getStatusWarning(selectedStatus)}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isUpdating}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedStatus || isUpdating}
                        className={selectedStatus ? STATUS_CONFIG[selectedStatus].bgColor : ''}
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>Update Status</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

