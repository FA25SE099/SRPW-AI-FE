// Production Plan Detailed Types

export interface MaterialUsage {
  materialId: string;
  materialName: string;
  unit: string;
  quantityPerHa: number;
  estimatedUnitPrice: number;
  actualQuantityUsed: number | null;
  actualUnitPrice: number | null;
}

export interface TaskDetail {
  taskId: string;
  taskName: string;
  taskType: string;
  status: string;
  scheduledDate: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  estimatedCost: number;
  actualMaterialCost: number | null;
  actualServiceCost: number | null;
  totalActualCost: number | null;
  materials: MaterialUsage[];
}

export interface StageDetail {
  stageId: string;
  stageName: string;
  sequenceOrder: number;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  status: string;
  estimatedStageCost: number;
  actualStageCost: number | null;
  tasks: TaskDetail[];
}

export interface PlotProgress {
  plotId: string;
  plotIdentifier: string;
  area: number;
  farmerName: string;
  status: string;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  estimatedCost: number;
  actualCost: number | null;
  hasActiveIssues: boolean;
  latestCompletedTask: string | null;
  latestCompletedAt: string | null;
}

export interface PlotEconomics {
  plotId: string;
  plotIdentifier: string;
  area: number;
  estimatedCost: number;
  actualCost: number;
  costVariance: number;
  yieldExpected: number;
  yieldActual: number;
  yieldVariance: number;
}

export interface EconomicsDetail {
  totalEstimatedCost: number;
  totalActualCost: number;
  costVariance: number;
  costVariancePercentage: number;
  actualMaterialCost: number;
  actualServiceCost: number;
  expectedYield: number;
  actualYield: number;
  yieldVariance: number;
  yieldVariancePercentage: number;
  yieldPerHectare: number;
  totalRevenue: number;
  grossProfit: number;
  profitMargin: number;
  returnOnInvestment: number;
  costPerKg: number;
  performanceRating: string;
  performanceScore: number;
  plotBreakdown: PlotEconomics[];
}

export interface PlanDetails {
  productionPlanId: string;
  planName: string;
  status: string;
  basePlantingDate: string;
  submittedAt: string | null;
  approvedAt: string | null;
  groupId: string;
  groupName: string;
  seasonName: string;
  seasonYear: number;
  totalArea: number;
  riceVarietyName: string;
  
  totalStages: number;
  completedStages: number;
  totalTasks: number;
  completedTasks: number;
  overallProgressPercentage: number;
  
  daysElapsed: number;
  estimatedDaysRemaining: number;
  isOnSchedule: boolean;
  
  estimatedTotalPlanCost: number;
  actualCostToDate: number;
  costVariance: number;
  costVariancePercentage: number;
  
  stages: StageDetail[];
  plotProgress: PlotProgress[];
  economicsDetail: EconomicsDetail | null;
}

