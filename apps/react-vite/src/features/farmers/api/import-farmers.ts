import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { MutationConfig } from "@/lib/react-query";
import { z } from "zod";

export type ImportError = {
    rowNumber: number;
    fieldName: string;
    errorMessage: string;
}

export type ImportFarmer = {
    phoneNumber: string;
    fullName: string;
    address: string;
    farmCode: string;
};

export type ImportFarmersResponse = {
    totalRows: number;
    successCount: number;
    failureCount: number;
    errors: ImportError[];
    importedFarmers: ImportFarmer[];
};

export const importFarmers = (file: File): Promise<ImportFarmersResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/farmer/import', formData, {
        headers: {
            'Conntent-Type': 'multipart/form-data',
        },
    });
};

type UseImportFarmersOptions = {
    mutationConfig?: MutationConfig<typeof importFarmers>;
};

export const useImportFarmers = ({ mutationConfig }: UseImportFarmersOptions = {}) => {
    const queryClient = useQueryClient();

    const { onSuccess, ...restConfig } = mutationConfig || {};

    return useMutation({
        mutationFn: importFarmers,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({
                queryKey: ['farmer'],
            });
            onSuccess?.(...args);
        },
        ...restConfig,
    });
};
