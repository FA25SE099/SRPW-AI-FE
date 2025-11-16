import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { MutationConfig } from "@/lib/react-query";
import { z } from "zod";

export const completePolygonTaskInputSchema = z.object({
    polygonGeoJson: z.string(),
    notes: z.string().optional(),
});

export type CompletePolygonTaskInput = z.infer<typeof completePolygonTaskInputSchema>;

export const completePolygonTask = ({
    taskId,
    data,
}: {
    taskId: string;
    data: CompletePolygonTaskInput;
}): Promise<{ succeeded: boolean; data: boolean; message: string; errors: string[] }> => {
    return api.post(`/Supervisor/polygon/${taskId}/complete`, data);
};

type UseCompletePolygonTaskOptions = {
    mutationConfig?: MutationConfig<typeof completePolygonTask>;
};

export const useCompletePolygonTask = ({
    mutationConfig,
}: UseCompletePolygonTaskOptions = {}) => {
    const queryClient = useQueryClient();

    const { onSuccess, ...restConfig } = mutationConfig || {};

    return useMutation({
        onSuccess: (...args) => {
            // ADDED: Invalidate plots query để refetch polygon mới
            queryClient.invalidateQueries({
                queryKey: ["plots"],
            });

            queryClient.invalidateQueries({
                queryKey: ["polygon-tasks"],
            });

            onSuccess?.(...args);
        },
        ...restConfig,
        mutationFn: completePolygonTask,
    });
};