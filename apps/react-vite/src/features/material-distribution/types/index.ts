// Material Distribution Types

export type MaterialDistributionStatus =
  | 'Pending'
  | 'PartiallyConfirmed'
  | 'Completed'
  | 'Overdue';

export interface MaterialDistribution {
  id: string;
  materialName: string;
  materialId: string;
  quantity: number;
  unit: string;
  farmerName: string;
  farmerId: string;
  farmerPhone: string;
  plotName: string;
  plotId: string;
  supervisorName: string;
  supervisorId: string;
  status: MaterialDistributionStatus;
  scheduledDistributionDate: string;
  distributionDeadline: string;
  supervisorConfirmationDeadline: string;
  farmerConfirmationDeadline: string | null;
  actualDistributionDate: string | null;
  supervisorConfirmedAt: string | null;
  farmerConfirmedAt: string | null;
  supervisorNotes: string | null;
  farmerNotes: string | null;
  imageUrls: string[] | null;
  isSupervisorOverdue: boolean;
  isFarmerOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialDistributionsResponse {
  distributions: MaterialDistribution[];
  totalDistributions: number;
  pendingCount: number;
  partiallyConfirmedCount: number;
  completedCount: number;
  overdueCount: number;
}

export interface ConfirmDistributionRequest {
  materialDistributionId: string;
  supervisorId: string;
  actualDistributionDate: string;
  notes?: string;
  imageUrls?: string[];
}

export interface ConfirmReceiptRequest {
  materialDistributionId: string;
  farmerId: string;
  notes?: string;
}

export interface InitiateDistributionRequest {
  productionPlanId: string;
  supervisorId: string;
}

export type MaterialDistributionFilter = 'all' | 'pending' | 'overdue' | 'completed';

// Grouped Distribution Types
export interface MaterialItem {
  distributionId: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  status: MaterialDistributionStatus;
  farmerConfirmedAt: string | null;
  farmerNotes: string | null;
}

export interface FarmerDistribution {
  plotCultivationId: string;
  plotId: string;
  plotName: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  location: string;
  status: MaterialDistributionStatus;
  materials: MaterialItem[];
  scheduledDistributionDate: string;
  distributionDeadline: string;
  supervisorConfirmationDeadline: string;
  farmerConfirmationDeadline: string | null;
  supervisorConfirmedBy: string | null;
  supervisorName: string | null;
  supervisorConfirmedAt: string | null;
  actualDistributionDate: string | null;
  supervisorNotes: string | null;
  imageUrls: string[] | null;
  isOverdue: boolean;
  isSupervisorOverdue: boolean;
  isFarmerOverdue: boolean;
  totalMaterialCount: number;
  pendingMaterialCount: number;
  confirmedMaterialCount: number;
}

export interface GroupedDistributionsResponse {
  groupId: string;
  totalFarmers: number;
  totalMaterials: number;
  farmerDistributions: FarmerDistribution[];
}

// Bulk Confirm Types
export interface BulkConfirmDistributionRequest {
  plotCultivationId: string;
  supervisorId: string;
  actualDistributionDate: string;
  notes?: string;
  imageUrls?: string[]; // Shared images for all distributions (backward compatible)
  distributionImages?: Record<string, string[]>; // Individual images per distribution (NEW)
}

export interface BulkConfirmDistributionResponse {
  totalDistributionsConfirmed: number;
  confirmedDistributionIds: string[];
  message: string;
}

