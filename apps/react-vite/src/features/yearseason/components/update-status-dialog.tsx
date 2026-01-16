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
        label: 'Bản Nháp',
        description: 'Giai đoạn lập kế hoạch ban đầu',
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        nextStatuses: ['PlanningOpen'],
    },
    PlanningOpen: {
        label: 'Mở Lập Kế Hoạch',
        description: 'Nông dân có thể chọn giống lúa',
        icon: Play,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        nextStatuses: ['Active'],
    },
    Active: {
        label: 'Đang Hoạt Động',
        description: 'Canh tác đang tiến hành',
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        nextStatuses: ['Completed'],
    },
    Completed: {
        label: 'Đã Hoàn Thành',
        description: 'Mùa vụ đã kết thúc',
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
                return 'Mở lập kế hoạch sẽ cho phép nông dân chọn giống lúa của họ. Đảm bảo tất cả các điều kiện tiên quyết đã được đáp ứng.';
            case 'Active':
                return 'Kích hoạt mùa vụ sẽ khóa lựa chọn của nông dân và bắt đầu theo dõi canh tác. Hành động này chỉ nên được thực hiện khi đã bắt đầu gieo trồng.';
            case 'Completed':
                return 'Hoàn thành mùa vụ sẽ đánh dấu nó là đã kết thúc. Hành động này là vĩnh viễn và không thể hoàn tác.';
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Cập Nhật Trạng Thái Mùa Vụ</DialogTitle>
                    <DialogDescription>
                        Thay đổi trạng thái của {yearSeasonName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Current Status */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            Trạng Thái Hiện Tại
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
                                Thay Đổi Trạng Thái Thành
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
                                Mùa vụ này đã đạt trạng thái cuối cùng và không thể thay đổi thêm.
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
                        Hủy
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedStatus || isUpdating}
                        className={selectedStatus ? STATUS_CONFIG[selectedStatus].bgColor : ''}
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang cập nhật...
                            </>
                        ) : (
                            <>Cập Nhật Trạng Thái</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

