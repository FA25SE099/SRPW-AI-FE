import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { MutationConfig } from '@/lib/react-query'

// Types based on the new endpoint structure
export type PlotImportRow = {
    farmCode: string
    farmerName?: string
    phoneNumber?: string
    plotNumber?: number
    soThua?: number
    soTo?: number
    area?: number
    soilType?: string
    riceVarietyName?: string
    plantingDate?: string
    seasonName?: string
    year?: number
    boundaryWKT?: string | null
    coordinateWKT?: string | null
}

export type PlotImportPreviewRow = {
    rowNumber: number
    farmCode?: string
    farmerName?: string
    phoneNumber?: string
    soThua?: number
    soTo?: number
    area?: number
    soilType?: string
    riceVarietyName?: string
    plantingDate?: string | null
    seasonName?: string | null
    year?: number | null
    hasPolygon?: boolean
    isDuplicate?: boolean
    errors?: string[]
    warnings?: string[]
    status: string
    plotStatus?: string | null
    willCreatePlotCultivation?: string | null
    seasonYear?: string | null
}

export type PlotImportPreviewSummary = {
    totalRows: number
    validRows: number
    invalidRows: number
    skippedRows: number
    duplicateRows: number
    rowsWithPolygons: number
    rowsWithoutPolygons: number
    rowsCreatingCultivation: number
}

export type PlotImportPreviewDto = {
    totalRows: number
    validRowsCount: number
    invalidRowsCount: number
    skippedRowsCount: number
    duplicateRowsCount: number
    validRows: PlotImportPreviewRow[]
    invalidRows: PlotImportPreviewRow[]
    generalErrors?: string[]
    summary?: PlotImportPreviewSummary
}

export type PreviewImportPlotsInput = {
    excelFile: File
}

export type PreviewImportPlotsResponse = {
    success: boolean
    message?: string
    data: PlotImportPreviewDto
}

export type ImportPlotsFromDataInput = {
    plotRows: PlotImportRow[]
    clusterManagerId?: string | null
}

export type PlotResponse = {
    plotId: string
    soThua: number
    soTo: number
    area: number
    farmerId: string
    farmerName: string
    soilType?: string
    status: 'Active' | 'PendingPolygon'
    groupId?: string | null
}

export type ImportPlotsFromDataResponse = {
    success: boolean
    message: string
    data: PlotResponse[]
}

// Step 1: Preview the import
export const previewImportPlots = async ({
    excelFile
}: PreviewImportPlotsInput): Promise<PreviewImportPlotsResponse> => {
    const formData = new FormData()
    formData.append('excelFile', excelFile)

    return api.post('/plot/preview-import-excel', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }) as Promise<PreviewImportPlotsResponse>
}

// Step 2: Import fixed data
export const importPlotsFromData = async ({
    plotRows,
    clusterManagerId
}: ImportPlotsFromDataInput): Promise<ImportPlotsFromDataResponse> => {
    return api.post('/plot/import-from-data', {
        plotRows,
        clusterManagerId: clusterManagerId || null
    }) as Promise<ImportPlotsFromDataResponse>
}

// React Query hooks
type UsePreviewImportPlotsOptions = {
    mutationConfig?: MutationConfig<typeof previewImportPlots>
}

export const usePreviewImportPlots = ({ mutationConfig }: UsePreviewImportPlotsOptions = {}) => {
    return useMutation({
        ...mutationConfig,
        mutationFn: previewImportPlots,
    })
}

type UseImportPlotsFromDataOptions = {
    mutationConfig?: MutationConfig<typeof importPlotsFromData>
}

export const useImportPlotsFromData = ({ mutationConfig }: UseImportPlotsFromDataOptions = {}) => {
    const queryClient = useQueryClient()

    const { onSuccess, ...restConfig } = mutationConfig || {}

    return useMutation({
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ['plots'] })
            onSuccess?.(...args)
        },
        ...restConfig,
        mutationFn: importPlotsFromData,
    })
}

// Helper function to convert preview rows to import rows
export const convertPreviewToImportRows = (previewRows: PlotImportPreviewRow[]): PlotImportRow[] => {
    return previewRows.map(row => ({
        farmCode: row.farmCode || '',
        farmerName: row.farmerName,
        phoneNumber: row.phoneNumber,
        plotNumber: row.rowNumber - 1, // Adjust for header row
        soThua: row.soThua,
        soTo: row.soTo,
        area: row.area,
        soilType: row.soilType || undefined,
        riceVarietyName: row.riceVarietyName || undefined,
        plantingDate: row.plantingDate || undefined,
        seasonName: row.seasonName || undefined,
        year: row.year || undefined,
        boundaryWKT: row.hasPolygon ? null : null, // You might want to preserve this if available
        coordinateWKT: null
    }))
}
