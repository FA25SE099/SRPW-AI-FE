import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type CultivationVersion = {
    id: string;
    plotCultivationId: string;
    versionName: string;
    versionOrder: number;
    isActive: boolean;
    reason: string;
    activatedAt: string;
    createdAt: string;
    taskCount: number;
};

export type GetCultivationVersionsResponse = {
    succeeded: boolean;
    data: CultivationVersion[];
    message: string;
    errors: string[];
};

export const getCultivationVersions = (plotCultivationId: string): Promise<GetCultivationVersionsResponse> => {
    return api.get(`/cultivation-version/by-plot-cultivation/${plotCultivationId}`);
};

type UseCultivationVersionsOptions = {
    plotCultivationId: string;
    queryConfig?: QueryConfig<typeof getCultivationVersions>;
};

export const useCultivationVersions = ({
    plotCultivationId,
    queryConfig,
}: UseCultivationVersionsOptions) => {
    return useQuery({
        ...queryConfig,
        queryKey: ['cultivation-versions', plotCultivationId],
        queryFn: () => getCultivationVersions(plotCultivationId),
        enabled: !!plotCultivationId,
    });
};
