// Production Plan Types

export type ProductionPlanStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

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

export interface UpdateProductionPlanInput {
  planId: string;
  planName?: string;
  basePlantingDate?: string;
  stages?: StageInPlan[];
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

export type CultivationTaskStatus = 'Draft' | 'PendingApproval' | 'InProgress' | 'Completed' | 'Cancelled';

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

