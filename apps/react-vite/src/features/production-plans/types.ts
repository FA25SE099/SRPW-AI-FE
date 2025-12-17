// Production Plan Types

export type ProductionPlanStatus =
  | 'Draft'
  | 'Pending'
  | 'Approved'
  | 'Rejected';

export interface MaterialInPlan {
  materialId: string;
  materialName: string;
  quantityPerHa: number;
  estimatedAmount: number;
  hasPriceWarning: boolean;
  priceValidFrom?: string;
  unit: string;
}

export interface TaskInPlan {
  taskId?: string;
  taskName: string;
  description: string;
  daysAfter: number;
  durationDays: number;
  taskType: string;
  priority: string;
  sequenceOrder: number;
  scheduledEndDate: string;
  materials: MaterialInPlan[];
}

export interface StageInPlan {
  stageId?: string;
  stageName: string;
  sequenceOrder: number;
  expectedDurationDays: number;
  isMandatory: boolean;
  notes?: string;
  tasks: TaskInPlan[];
}

export interface ProductionPlanDraft {
  standardPlanId: string;
  groupId: string;
  planName: string;
  totalArea: number;
  basePlantingDate: string;
  estimatedTotalPlanCost: number;
  hasPriceWarnings: boolean;
  priceWarnings: string[];
  stages: StageInPlan[];
}

export interface ProductionPlan {
  productionPlanId: string;
  planName: string;
  status: ProductionPlanStatus;
  basePlantingDate: string;
  totalArea: number;
  estimatedTotalCost: number;
  groupId: string;
  groupName: string;
  seasonName: string;
  seasonYear: number;
  supervisorName: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  stages: StageInPlan[];
}

export interface CreateProductionPlanInput {
  standardPlanId: string;
  groupId: string;
  basePlantingDate: string;
  planName?: string;
  stages?: StageInPlan[];
}

export interface UpdateMaterialInPlan {
  materialId: string;
  quantityPerHa: number;
}

export interface UpdateTaskInPlan {
  taskId?: string;
  taskName: string;
  description: string;
  daysAfter: number;
  durationDays: number;
  taskType: string;
  priority: string;
  sequenceOrder: number;
  scheduledDate?: string;
  scheduledEndDate?: string;
  materials: UpdateMaterialInPlan[];
}

export interface UpdateStageInPlan {
  stageId?: string;
  stageName: string;
  sequenceOrder: number;
  expectedDurationDays: number;
  isMandatory: boolean;
  notes?: string;
  tasks: UpdateTaskInPlan[];
}

export interface UpdateProductionPlanInput {
  planId: string;
  planName?: string;
  basePlantingDate?: string;
  stages?: UpdateStageInPlan[];
  expertId?: string;
}

export interface SubmitPlanInput {
  planId: string;
  supervisorId: string;
}

// Execution Monitoring Types
export interface PlotSummary {
  plotId: string;
  plotName: string;
  farmerName: string;
  plotArea: number;
  taskCount: number;
  completedTasks: number;
  completionRate: number;
}

export interface ExecutionSummary {
  planId: string;
  planName: string;
  approvedAt: string;
  approvedByExpert: string;
  groupId: string;
  groupName: string;
  seasonName: string;
  totalArea: number;
  plotCount: number;
  farmerCount: number;
  totalTasksCreated: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksPending: number;
  completionPercentage: number;
  estimatedCost: number;
  actualCost: number;
  firstTaskStarted?: string;
  lastTaskCompleted?: string;
  plotSummaries: PlotSummary[];
}

export type CultivationTaskStatus =
  | 'Draft'
  | 'PendingApproval'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled';

export interface CultivationTask {
  taskId: string;
  taskName: string;
  description: string;
  taskType: string;
  status: CultivationTaskStatus;
  scheduledEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  plotId: string;
  plotName: string;
  farmerId: string;
  farmerName: string;
  actualMaterialCost: number;
  actualServiceCost: number;
  isContingency: boolean;
  contingencyReason?: string;
}

export interface PlotImplementationMaterial {
  materialId: string;
  materialName: string;
  plannedQuantity: number;
  actualQuantity: number;
  actualCost: number;
  unit: string;
}

export interface PlotImplementationTask {
  taskId: string;
  taskName: string;
  description: string;
  taskType: string;
  status: CultivationTaskStatus;
  executionOrder: number;
  scheduledEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  actualMaterialCost: number;
  actualServiceCost?: number;
  totalActualCost?: number;
  materials: PlotImplementationMaterial[];
}

export interface PlotImplementation {
  plotId: string;
  plotName: string;
  soThua: string;
  soTo: string;
  plotArea: number;
  farmerId: string;
  farmerName: string;
  productionPlanId: string;
  productionPlanName: string;
  seasonName: string;
  riceVarietyName: string;
  plantingDate: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  completionPercentage: number;
  tasks: PlotImplementationTask[];
}

export interface ApprovedPlan {
  planId: string;
  planName: string;
  groupName: string;
  seasonName: string;
  approvedAt: string;
  approvedBy: string;
  estimatedCost: number;
  totalArea: number;
  plotCount: number;
  completionPercentage: number;
}

// Emergency Plan Types
export type EmergencyPlanListItem = {
  id: string;
  planName: string;
  groupId: string;
  groupArea: string;
  basePlantingDate: string;
  status: string;
  submittedAt: string | null;
  submitterName: string;
};

export type GetEmergencyPlansDTO = {
  currentPage: number;
  pageSize: number;
  groupId?: string | null;
  clusterId?: string | null;
  searchTerm?: string;
};

export type ResolveEmergencyMaterial = {
  materialId: string;
  quantityUsed: number;
  actualCost: number;
};

export type ResolveEmergencyCultivationTask = {
  productionPlanTaskId: string;
  plotCultivationId: string;
  assignedToUserId?: string;
  assignedToVendorId?: string;
  cultivationTaskName: string;
  description: string;
  taskType: string;
  scheduledEndDate: string;
  status: string;
  executionOrder: number;
  isContingency: boolean;
  contingencyReason: string;
  materials: ResolveEmergencyMaterial[];
};

export type ResolveEmergencyDTO = {
  planId: string;
  newVersionName: string;
  resolutionReason?: string;
  expertId?: string;
  productionStageId: string;
  plotIds: string[];
  baseCultivationTasks: BaseCultivationTaskRequest[];
};

export type BaseCultivationTaskRequest = {
  productionPlanTaskId?: string | null;
  taskName?: string;
  description?: string;
  taskType?: string;
  scheduledEndDate?: string;
  status?: string;
  executionOrder?: number;
  isContingency: boolean;
  contingencyReason?: string | null;
  defaultAssignedToUserId?: string | null;
  defaultAssignedToVendorId?: string | null;
  materialsPerHectare: TaskMaterialRequest[];
};

export type TaskMaterialRequest = {
  materialId: string;
  quantityPerHa: number;
  notes?: string | null;
};

// Additional Plan Detail Types
export type PlotDetail = {
  id: string;
  plotName?: string;
  area: number;
  soThua: number;
  soTo: number;
  soilType?: string;
  status: string;
  farmerId: string;
  coordinates?: string;
};

export type GroupDetail = {
  id: string;
  clusterName: string;
  totalArea: number;
  status: string;
  plots: PlotDetail[];
};

export type TaskMaterial = {
  materialId: string;
  materialName: string;
  materialUnit?: string;
  quantityPerHa: number;
  estimatedAmount: number;
};

export type ProductionPlanTask = {
  id: string;
  taskId?: string;
  taskName: string;
  description: string;
  taskType: string;
  scheduledDate: string;
  scheduledEndDate: string | null;
  priority: string;
  sequenceOrder: number;
  status?: string; // Task status: Draft, Emergency, etc.
  estimatedMaterialCost: number;
  materials: TaskMaterial[];
};

export type ProductionPlanStage = {
  id: string;
  stageId?: string;
  stageName: string;
  sequenceOrder: number;
  notes?: string;
  expectedDurationDays?: number;
  typicalDurationDays: number;
  colorCode: string;
  tasks: ProductionPlanTask[];
};

export type ProductionPlanDetail = {
  id: string;
  planName: string;
  standardPlanId: string;
  groupId: string;
  totalArea: number;
  basePlantingDate: string;
  status: string;
  estimatedTotalCost?: number;
  estimatedTotalPlanCost: number;
  approvedBy?: string;
  groupDetails: GroupDetail;
  stages: ProductionPlanStage[];
};