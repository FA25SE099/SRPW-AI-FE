import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { MutationConfig } from '@/lib/react-query'
import { z } from 'zod'

export const importPlotsExcelInputSchema = z.object({
    excelFile: z.instanceof(File),
    importDate: z.string().optional(),
})

export type ImportPlotsExcelInput = z.infer<typeof importPlotsExcelInputSchema>

export type PlotImportData = {
    plotId: string;
    soThua: number;
    soTo: number;
    area: number;
    farmerId: string;
    farmerName: string;
    soilType?: string;
    status: string;
    groupId?: string | null;
}

export type ImportPlotsExcelResponse = {
    succeeded: boolean;
    message: string;
    data?: PlotImportData[];
    errors?: string[];
}

export const importPlotsExcel = async ({
    excelFile,
    importDate
}: ImportPlotsExcelInput): Promise<ImportPlotsExcelResponse> => {
    const formData = new FormData()
    formData.append('excelFile', excelFile)
    
    if (importDate) {
        formData.append('importDate', importDate)
    }

    return api.post('/plot/import-excel', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }) as Promise<ImportPlotsExcelResponse>
}

type UseImportPlotsExcelOptions = {
    mutationConfig?: MutationConfig<typeof importPlotsExcel>
}

export const useImportPlotsExcel = ({ mutationConfig }: UseImportPlotsExcelOptions = {}) => {
    const queryClient = useQueryClient()

    const { onSuccess, ...restConfig } = mutationConfig || {}

    return useMutation({
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ['plots'] })
            onSuccess?.(...args)
        },
        ...restConfig,
        mutationFn: importPlotsExcel,
    })
}