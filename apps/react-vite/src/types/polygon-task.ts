export type PolygonTaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';

export interface PlotInfo {
    plotId: string;
    soThua: number | null;
    soTo: number | null;
    area: number;
    soilType: string | null;
    farmerId: string;
    farmerName: string | null;
    farmerPhone: string | null;
}

export interface PolygonTask {
    id: string;
    plotId: string;
    status: PolygonTaskStatus;
    assignedAt: string;
    completedAt: string | null;
    notes: string | null;
    priority: number;
    // Plot information
    soThua: number | null;
    soTo: number | null;
    plotArea: number;
    soilType: string | null;
    // Farmer information
    farmerId: string;
    farmerName: string | null;
    farmerPhone: string | null;
}

export interface PolygonTasksFilters {
    status?: PolygonTaskStatus;
}

export interface PolygonTasksSummary {
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
}
