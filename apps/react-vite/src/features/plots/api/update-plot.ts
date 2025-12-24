import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { z } from 'zod';
import { MutationConfig } from '@/lib/react-query';

export const updatePlotInputSchema = z.object({
    plotId: z.string().uuid(),
    farmerId: z.string().uuid(),
    groupId: z.string().uuid().optional().nullable(),
    boundary: z.string().optional(), // WKT Polygon format
    soThua: z.number().int().optional(),
    soTo: z.number().int().optional(),
    area: z.number().positive(),
    soilType: z.string().max(100).optional().nullable(),
    coordinate: z.string().optional().nullable(), // WKT Point format
    status: z.union([z.literal(0), z.literal(1)]), // 0 = Active, 1 = PendingPolygon
});

export type UpdatePlotInput = z.infer<typeof updatePlotInputSchema>;

export type UpdatePlotResponse = {
    succeeded: boolean;
    message: string;
    data: {
        plotId: string;
        farmerId: string;
        groupId?: string;
        boundary: string;
        soThua?: number;
        soTo?: number;
        area: number;
        soilType?: string;
        coordinate?: string;
        status: number;
    } | null;
    errors: string[] | null;
};

export const updatePlot = async (
    data: UpdatePlotInput
): Promise<UpdatePlotResponse> => {
    return api.put('/Plot', data);
};

type UseUpdatePlotOptions = {
    mutationConfig?: MutationConfig<typeof updatePlot>;
};

export const useUpdatePlot = ({ mutationConfig }: UseUpdatePlotOptions = {}) => {
    const queryClient = useQueryClient();

    const { onSuccess, ...restConfig } = mutationConfig || {};

    return useMutation({
        mutationFn: updatePlot,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({
                queryKey: ['plots'],
            });
            queryClient.invalidateQueries({
                queryKey: ['polygon-tasks'],
            });
            onSuccess?.(...args);
        },
        ...restConfig,
    });
};
