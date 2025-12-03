import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type GroupStatus = 'Draft' | 'Active' | 'ReadyForOptimization' | 'Locked' | 'Exception';

export type Group = {
    groupId: string;
    clusterId: string;
    supervisorId: string;
    status: GroupStatus;
    area: string | null;
    totalArea: number;
};

export type GroupsResponse = {
    succeeded: boolean;
    data: Group[];
    message: string;
    errors: string[];
};
export const getGroups = (): Promise<GroupsResponse> => {
    return api.get('/Group');
};

export const getGroupsQueryOptions = () => {
    return queryOptions({
        queryKey: ['groups'],
        queryFn: getGroups,
    });
};

type UseGroupsOptions = {
    queryConfig?: QueryConfig<typeof getGroupsQueryOptions>;
};

export const useGroups = ({ queryConfig }: UseGroupsOptions = {}) => {
    return useQuery({
        ...getGroupsQueryOptions(),
        ...queryConfig,
    }) as ReturnType<typeof useQuery<GroupsResponse, Error>>;
};