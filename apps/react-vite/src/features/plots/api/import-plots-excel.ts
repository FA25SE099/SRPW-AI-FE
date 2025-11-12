import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { MutationConfig } from '@/lib/react-query'
import { z } from 'zod'

export const importPlotsExcelInputSchema = z.object({
    excelFile: z.instanceof(File),
    importDate: z.string().optional(),
})

export type ImportPlotsExcelInput = z.infer<typeof importPlotsExcelInputSchema>

export type ImportPlotsExcelResponse = {
    success: boolean  // ✅ Changed from 'succeeded' to 'success'
    message: string
    data?: any[]
    errors?: string[]
}

export const importPlotsExcel = async ({
    excelFile,
    importDate
}: ImportPlotsExcelInput): Promise<ImportPlotsExcelResponse> => {
    const formData = new FormData()
    formData.append('excelFile', excelFile)

    const params = new URLSearchParams()
    if (importDate) {
        params.append('importDate', importDate)
    }

    const url = `/plot/import-excel${params.toString() ? `?${params.toString()}` : ''}`

    const response = await api.post<ImportPlotsExcelResponse>(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })

    return response.data
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