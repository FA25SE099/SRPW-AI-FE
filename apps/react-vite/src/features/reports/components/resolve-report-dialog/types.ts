export type Step = 'report' | 'protocol' | 'edit' | 'config' | 'preview';

export type AddTaskMode = 'new' | 'protocol' | 'old' | null;

export type EditableStage = {
    stageName: string;
    sequenceOrder: number;
    cultivationPlanTaskId?: string; // Store one cultivationPlanTaskId from the stage for emergency tasks
    tasks: EditableTask[];
};

export type EditableTask = {
    taskName: string;
    description: string;
    taskType: string;
    daysAfter: number;
    durationDays: number;
    scheduledDate?: string | null;
    scheduledEndDate?: string | null;
    actualStartDate?: string | null;
    actualEndDate?: string | null;
    priority: string;
    sequenceOrder: number;
    isFromProtocol: boolean;
    originalTaskId?: string; // CultivationPlanTask.Id
    originalTaskStatus?: string; // Original task status from cultivation plan
    status: string; // Current status: Draft, Emergency, etc.
    originalProtocolTaskId?: string;
    materials: {
        materialId: string;
        quantityPerHa: number;
    }[];
};

export type FormData = {
    resolutionReason: string;
    versionName: string;
};

export type ResolveReportDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    reportId: string;
    reportTitle: string;
};

