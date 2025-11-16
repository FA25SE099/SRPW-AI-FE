import { useQuery, queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { QueryConfig } from "@/lib/react-query";
import { PolygonTask, PolygonTasksFilters } from "@/types/polygon-task";

// =============== TYPES ===============

export type GetPolygonTasksResponse = {
    succeeded: boolean;
    data: PolygonTask[];
    errors: string[];
    message: string | null;
};

// =============== API FUNCTIONS ===============

export const getPolygonTasks = (filters?: PolygonTasksFilters): Promise<PolygonTask[]> => {
    const params = new URLSearchParams();

    const status = filters?.status || 'Pending';
    if (status === 'Pending') {
        params.append('status', status);
    }

    const queryString = params.toString();
    const url = `/supervisor/polygon-tasks${queryString ? `?${queryString}` : ''}`;

    return api.get(url);
};

export const getPolygonTasksQueryOptions = (filters?: PolygonTasksFilters) => {
    return queryOptions({
        queryKey: ['polygon-tasks', filters],
        queryFn: () => getPolygonTasks(filters),
    });
};

type UsePolygonTasksOptions = {
    filters?: PolygonTasksFilters;
    queryConfig?: QueryConfig<typeof getPolygonTasksQueryOptions>;
};

export const usePolygonTasks = ({
    filters,
    queryConfig,
}: UsePolygonTasksOptions = {}) => {
    return useQuery({
        ...getPolygonTasksQueryOptions(filters),
        ...queryConfig,
    });
};