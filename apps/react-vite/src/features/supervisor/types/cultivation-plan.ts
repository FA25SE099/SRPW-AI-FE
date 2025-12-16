// Cultivation Plan Types for Plot-specific cultivation data

export interface CultivationPlanMaterial {
  materialId: string;
  materialName: string;
  plannedQuantity: number;
  actualQuantity: number;
  unit: string;
}

export interface CultivationPlanTask {
  taskId: string;
  taskName: string;
  taskDescription: string;
  taskType: string;
  status: string;
  priority: string;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  orderIndex: number;
  materials: CultivationPlanMaterial[];
}

export interface CultivationPlanStage {
  stageId: string;
  stageName: string;
  sequenceOrder: number;
  description: string | null;
  typicalDurationDays: number;
  tasks: CultivationPlanTask[];
}

export interface CultivationPlanProgress {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  completionPercentage: number;
  daysElapsed: number;
  estimatedDaysRemaining: number;
}

export interface CultivationPlanDetail {
  plotCultivationId: string;
  plotId: string;
  plotName: string;
  plotArea: number;
  seasonId: string;
  seasonName: string;
  seasonStartDate: string;
  seasonEndDate: string;
  riceVarietyId: string;
  riceVarietyName: string;
  riceVarietyDescription: string | null;
  plantingDate: string;
  expectedYield: number | null;
  actualYield: number | null;
  cultivationArea: number;
  status: string;
  productionPlanId: string;
  productionPlanName: string;
  productionPlanDescription: string | null;
  activeVersionId: string;
  activeVersionName: string;
  stages: CultivationPlanStage[];
  progress: CultivationPlanProgress;
}

export interface CultivationPlanResponse {
  succeeded: boolean;
  data: CultivationPlanDetail;
  message: string;
  errors: string[];
}
