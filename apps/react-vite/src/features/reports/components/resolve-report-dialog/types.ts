export type Step = 'report' | 'protocol' | 'edit' | 'name' | 'preview';

export type AddTaskMode = 'new' | 'protocol' | null;

export type EditableStage = {
    stageName: string;
    sequenceOrder: number;
    tasks: EditableTask[];
};

export type EditableTask = {
    taskName: string;
    description: string;
    taskType: string;
    daysAfter: number;
    durationDays: number;
    priority: string;
    sequenceOrder: number;
    isFromProtocol: boolean;
    originalTaskId?: string; // CultivationPlanTask.Id
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

