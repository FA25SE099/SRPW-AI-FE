export type ReportType = 'Pest' | 'Weather' | 'Disease' | 'Other';
export type ReportSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type ReportStatus = 'Pending' | 'UnderReview' | 'Resolved' | 'Rejected';
export type ReporterRole = 'Farmer' | 'Supervisor';

export type Report = {
    id: string;
    plotId: string;
    plotName: string;
    plotArea: number;
    cultivationPlanId: string;
    cultivationPlanName: string;
    reportType: ReportType;
    severity: ReportSeverity;
    title: string;
    description: string;
    reportedBy: string;
    reportedByRole: ReporterRole;
    reportedAt: string;
    status: ReportStatus;
    images?: string[];
    coordinates?: string;
    resolvedBy?: string;
    resolvedAt?: string;
    resolutionNotes?: string;
    farmerName?: string;
    clusterName?: string;
    affectedCultivationTaskId?: string;
    affectedTaskName?: string;
    affectedTaskType?: string;
    affectedTaskVersionName?: string;
};

export type ReportsResponse = {
    data: Report[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasPrevious: boolean;
    hasNext: boolean;
    succeeded: boolean;
    message: string | null;
    errors: string[];
};

export type CultivationPlan = {
    id: string;
    plotId: string;
    plotName: string;
    planName: string;
    riceVarietyId: string;
    riceVarietyName: string;
    basePlantingDate: string;
    totalArea: number;
    status: string;
    stages: CultivationStage[];
    estimatedTotalCost: number;
    farmerName: string;
    clusterName: string;
};

export type CultivationStage = {
    id: string;
    stageName: string;
    sequenceOrder: number;
    tasks: CultivationTask[];
    expectedDurationDays: number;
};

export type CultivationTask = {
    id: string;
    taskName: string;
    description: string;
    taskType: string;
    scheduledDate: string;
    scheduledEndDate: string | null;
    priority: string;
    sequenceOrder: number;
    status?: string; // Task status: Draft, Emergency, etc.
    materials: TaskMaterial[];
};

export type TaskMaterial = {
    materialId: string;
    materialName: string;
    quantityPerHa: number;
    unit: string;
};

export type ResolveReportRequest = {
    reportId: string;
    cultivationPlanId: string;
    newVersionName: string;
    resolutionReason: string;
    expertId: string;
    cultivationStageId: string;
    baseCultivationTasks: BaseCultivationTaskRequest[];
};

export type BaseCultivationTaskRequest = {
    cultivationPlanTaskId: string | null;
    taskName: string;
    description: string;
    taskType: string;
    scheduledEndDate: string;
    status: string;
    executionOrder: number;
    isContingency: boolean;
    contingencyReason: string;
    defaultAssignedToUserId: string | null;
    defaultAssignedToVendorId: string | null;
    materialsPerHectare: MaterialPerHectareRequest[];
};

export type MaterialPerHectareRequest = {
    materialId: string;
    quantityPerHa: number;
    notes: string | null;
};

