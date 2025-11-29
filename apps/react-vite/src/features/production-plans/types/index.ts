// Add this type to the existing types:
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

// Add these types:
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
  contingencyReason?: string;
  defaultAssignedToUserId?: string | null;
  defaultAssignedToVendorId?: string | null;
  materialsPerHectare: TaskMaterialRequest[];
};

export type TaskMaterialRequest = {
  materialId: string;
  quantityPerHa: number;
  notes?: string | null;
};

// Add these types for the plan details:
export type PlotDetail = {
  id: string;
  area: number;
  soThua: number;
  soTo: number;
  soilType: string;
  status: string;
  farmerId: string;
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
  materialUnit: string;
  quantityPerHa: number;
  estimatedAmount: number;
};

export type ProductionPlanTask = {
  id: string;
  taskName: string;
  description: string;
  taskType: string;
  scheduledDate: string;
  scheduledEndDate: string | null;
  priority: string;
  sequenceOrder: number;
  estimatedMaterialCost: number;
  materials: TaskMaterial[];
};

export type ProductionPlanStage = {
  id: string;
  stageName: string;
  sequenceOrder: number;
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
  estimatedTotalPlanCost: number;
  groupDetails: GroupDetail;
  stages: ProductionPlanStage[];
};