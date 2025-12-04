import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { z } from "zod";

export const validatePolygonAreaInputSchema = z.object({
    plotId: z.string(),
    polygonGeoJson: z.string(),
    tolerancePercent: z.number().optional().default(10),
});

export type ValidatePolygonAreaInput = z.infer<typeof validatePolygonAreaInputSchema>;

export type ValidatePolygonAreaResponse = {
    succeeded: boolean;
    data: {
        isValid: boolean;
        drawnAreaHa: number;
        plotAreaHa: number;
        differencePercent: number;
        tolerancePercent: number;
        message: string;
    } | null;
    message: string | null;
    errors: string[];
};

export const validatePolygonArea = async ({
    plotId,
    polygonGeoJson,
    tolerancePercent = 10,
}: ValidatePolygonAreaInput): Promise<ValidatePolygonAreaResponse> => {
    return api.post(`/Supervisor/polygon/validate-area`, {
        plotId,
        polygonGeoJson,
        tolerancePercent
    });
};

export const useValidatePolygonArea = () => {
    return useMutation({
        mutationFn: validatePolygonArea,
    });
};

