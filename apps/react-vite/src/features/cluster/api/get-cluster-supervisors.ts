import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type SupervisorGroup = {
    groupId: string;
    groupName: string;
    status: string;
    totalArea: number;
    plotCount: number;
};

export type ClusterSupervisor = {
    supervisorId: string;
    clusterId: string;
    supervisorName: string;
    maxFarmerCapacity: number;
    currentFarmerCount: number;
    supervisedGroups: SupervisorGroup[];
    assignedTasks: any[];
    supervisorAssignments: any[];
};

type GetClusterSupervisorsParams = {
    clusterId: string;
};

export const getClusterSupervisors = async ({
    clusterId,
}: GetClusterSupervisorsParams): Promise<ClusterSupervisor[]> => {
    const response = await api.get(`/Supervisor/by-cluster/${clusterId}`);

    // API returns array of supervisors
    if (Array.isArray(response)) {
        return response as unknown as ClusterSupervisor[];
    }

    // Fallback if single object is returned
    if (response && typeof response === 'object' && 'supervisorId' in response) {
        return [response as unknown as ClusterSupervisor];
    }

    return [];
};

type UseClusterSupervisorsOptions = {
    clusterId: string;
    queryConfig?: QueryConfig<typeof getClusterSupervisors>;
};

export const useClusterSupervisors = ({
    clusterId,
    queryConfig,
}: UseClusterSupervisorsOptions) => {
    return useQuery({
        queryKey: ['cluster-supervisors', clusterId],
        queryFn: () => getClusterSupervisors({ clusterId }),
        enabled: !!clusterId,
        ...queryConfig,
    });
};
