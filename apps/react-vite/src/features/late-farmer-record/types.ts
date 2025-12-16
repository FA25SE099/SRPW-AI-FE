// Late Farmer Record Types

export enum FarmerStatus {
  Normal = 0,
  Warned = 1,
  NotAllowed = 2,
  Resigned = 3,
}

export enum PlotStatus {
  Active = 0,
  Inactive = 1,
  Emergency = 2,
  Locked = 3,
  PendingPolygon = 4,
}

export interface LateFarmerRecordDTO {
  id: string;
  farmerId: string;
  farmerName?: string;
  taskId: string;
  taskName?: string;
  plotId: string;
  soThua?: number;
  soTo?: number;
  plotCultivationId: string;
  seasonId: string;
  seasonName?: string;
  groupId: string;
  groupName?: string;
  clusterId: string;
  clusterName?: string;
  recordedAt: string; // ISO 8601 DateTime
  notes?: string;
}

export interface FarmerLateCountDTO {
  farmerId: string;
  lateCount: number;
}

export interface PlotLateCountDTO {
  plotId: string;
  lateCount: number;
}

export interface FarmerLateDetailDTO {
  farmerId: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  farmCode?: string;
  totalLateCount: number;
  lateRecords: LateFarmerRecordDTO[];
}

export interface FarmerWithLateCountDTO {
  farmerId: string;
  fullName?: string;
  address?: string;
  phoneNumber?: string;
  isActive: boolean;
  isVerified: boolean;
  lastActivityAt?: string; // ISO 8601 DateTime
  farmCode?: string;
  plotCount: number;
  lateCount: number;
}

export interface PlotWithLateCountDTO {
  plotId: string;
  farmerId: string;
  farmerName?: string;
  groupId?: string;
  soThua?: number;
  soTo?: number;
  area: number;
  soilType?: string;
  status: PlotStatus;
  lateCount: number;
}

export interface GetLateFarmersInClusterParams {
  agronomyExpertId?: string;
  supervisorId?: string;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

export interface GetLatePlotsInClusterParams {
  agronomyExpertId?: string;
  supervisorId?: string;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}
