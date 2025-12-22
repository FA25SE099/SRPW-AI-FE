export type Step = 'protocol' | 'plots' | 'edit' | 'config' | 'preview';

export type AddTaskMode = 'new' | 'protocol' | 'old' | null;

export type EditableStage = {
    stageName: string;
    sequenceOrder: number;
    cultivationPlanTaskId?: string; // Store one planTaskId from the stage for emergency tasks
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
    originalTaskId?: string; // This is ProductionPlanTask.Id
    originalProtocolTaskId?: string;
    status: string; // Task status: Draft, Emergency, etc.
    materials: {
        materialId: string;
        quantityPerHa: number;
    }[];
};

export type FormData = {
    resolutionReason: string;
    versionName: string;
};

export type ResolveEmergencyDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    planId: string;
    planName: string;
};

