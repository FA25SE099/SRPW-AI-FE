import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X, Download, Loader2, Edit2, Save, AlertTriangle } from 'lucide-react'
import { usePreviewImportPlots, useImportPlotsFromData, convertPreviewToImportRows, type PlotImportRow, type PlotImportPreviewRow, type PlotImportPreviewDto } from '../api/preview-import-plots'
import { usePlotImportTemplate } from '../api/download-plot-import-template'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useNotifications } from '@/components/ui/notifications'

type ImportPlotsDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    clusterManagerId?: string | null
}

export const ImportPlotsDialog = ({ open, onOpenChange, clusterManagerId }: ImportPlotsDialogProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewData, setPreviewData] = useState<PlotImportPreviewDto | null>(null)
    const [editableRows, setEditableRows] = useState<PlotImportRow[]>([])
    const [isPreviewMode, setIsPreviewMode] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { addNotification } = useNotifications()

    const plotTemplate = usePlotImportTemplate()

    const previewMutation = usePreviewImportPlots({
        mutationConfig: {
            onSuccess: (data) => {
                if (data.success && data.data) {
                    setPreviewData(data.data)
                    setIsPreviewMode(true)
                    // Initialize editable rows from invalid rows (exclude duplicates - they will be skipped)
                    const invalidRowsToEdit = data.data.invalidRows.filter(row => !row.isDuplicate && row.errors && row.errors.length > 0)
                    setEditableRows(convertPreviewToImportRows(invalidRowsToEdit))
                    addNotification({
                        type: 'success',
                        title: 'Xem Trước Thành Công',
                        message: `Tìm thấy ${data.data.validRowsCount} hàng hợp lệ, ${data.data.invalidRowsCount} hàng không hợp lệ, ${data.data.duplicateRowsCount} hàng trùng lặp, và ${data.data.skippedRowsCount} hàng đã bỏ qua`,
                    })
                }
            },
            onError: (error: any) => {
                console.error('Preview error:', error)
                addNotification({
                    type: 'error',
                    title: 'Xem Trước Thất Bại',
                    message: error?.response?.data?.message || 'Không thể xem trước file nhập',
                })
            },
        },
    })

    const importMutation = useImportPlotsFromData({
        mutationConfig: {
            onSuccess: (data) => {
                if (data.success) {
                    addNotification({
                        type: 'success',
                        title: 'Nhập Thành Công',
                        message: data.message || `Đã nhập thành công ${data.data?.length || 0} thừa đất!`,
                    })
                    setTimeout(() => {
                        onOpenChange(false)
                        resetForm()
                        // Data will be automatically refetched via query invalidation
                    }, 2000)
                }
            },
            onError: (error: any) => {
                console.error('Import error:', error)
                addNotification({
                    type: 'error',
                    title: 'Nhập Thất Bại',
                    message: error?.response?.data?.message || 'Không thể nhập thừa đất',
                })
            },
        },
    })

    const resetForm = () => {
        setSelectedFile(null)
        setPreviewData(null)
        setEditableRows([])
        setIsPreviewMode(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const validateFile = (file: File): boolean => {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ]
        if (!validTypes.includes(file.type)) {
            addNotification({
                type: 'error',
                title: 'Loại File Không Hợp Lệ',
                message: 'Vui lòng chọn file Excel hợp lệ (.xlsx hoặc .xls)',
            })
            return false
        }
        if (file.size > 10 * 1024 * 1024) {
            addNotification({
                type: 'error',
                title: 'File Quá Lớn',
                message: 'Kích thước file phải nhỏ hơn 10MB',
            })
            return false
        }
        return true
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && validateFile(file)) {
            setSelectedFile(file)
            setIsPreviewMode(false)
            setPreviewData(null)
            setEditableRows([])
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            if (validateFile(file)) {
                setSelectedFile(file)
                setIsPreviewMode(false)
                setPreviewData(null)
                setEditableRows([])
            }
        }
    }

    const handlePreview = () => {
        if (!selectedFile) {
            addNotification({
                type: 'error',
                title: 'Chưa Chọn File',
                message: 'Vui lòng chọn file để xem trước',
            })
            return
        }

        previewMutation.mutate({
            excelFile: selectedFile,
        })
    }

    const handleFixRow = (index: number, field: keyof PlotImportRow, value: any) => {
        const updated = [...editableRows]
        updated[index] = { ...updated[index], [field]: value }
        setEditableRows(updated)
    }

    const handleImportFixed = () => {
        if (!previewData) {
            addNotification({
                type: 'error',
                title: 'Không Có Dữ Liệu Xem Trước',
                message: 'Vui lòng xem trước file trước',
            })
            return
        }

        // Merge valid rows with fixed invalid rows
        // Note: Duplicate rows are automatically skipped by the backend
        const validImportRows = convertPreviewToImportRows(previewData.validRows)
        const allRows: PlotImportRow[] = [...validImportRows, ...editableRows]

        importMutation.mutate({
            plotRows: allRows,
            clusterManagerId: clusterManagerId || null,
        })
    }

    const handleDownloadTemplate = async () => {
        try {
            setIsDownloading(true)
            await plotTemplate.download()
            addNotification({
                type: 'success',
                title: 'Tải Thành Công',
                message: 'Mẫu thừa đất đã được tải xuống!',
            })
        } catch (error: any) {
            console.error('Template download error:', error)
            addNotification({
                type: 'error',
                title: 'Tải Thất Bại',
                message: error.message || 'Tải mẫu thất bại. Vui lòng đảm bảo nông dân đã được nhập trước.',
            })
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="size-5 text-green-600" />
                        Nhập Thừa Đất Từ Excel
                    </DialogTitle>
                    <DialogDescription>
                        Tải lên file Excel để xem trước và nhập nhiều thừa đất cùng lúc
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Download Template */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                                <FileSpreadsheet className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-green-900 mb-1">
                                        Tải Mẫu Thừa Đất Cá Nhân Hóa
                                    </p>
                                    <p className="text-xs text-green-700">
                                        Mẫu sẽ được điền sẵn với nông dân và số lượng thừa đất của họ.
                                        Bao gồm trang tham chiếu với các giống lúa.
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadTemplate}
                                disabled={isDownloading || previewMutation.isPending || importMutation.isPending}
                                className="border-green-300 text-green-700 hover:bg-green-100 shrink-0"
                            >
                                {isDownloading ? (
                                    <>
                                        <Loader2 className="size-4 mr-2 animate-spin" />
                                        Đang tải...
                                    </>
                                ) : (
                                    <>
                                        <Download className="size-4 mr-2" />
                                        Tải Mẫu
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* File Upload */}
                    {!isPreviewMode && (
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                File Excel <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="excel-upload"
                                />
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragActive
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                                        }`}
                                >
                                    <Upload className="size-6 text-gray-400" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-700">
                                            {selectedFile ? selectedFile.name : 'Nhấp để tải lên hoặc kéo thả vào'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Chỉ file Excel (.xlsx, .xls) - Tối đa 10MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {selectedFile && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <FileSpreadsheet className="size-5 text-green-600" />
                                    <span className="flex-1 text-sm font-medium text-green-900">
                                        {selectedFile.name}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedFile(null)
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = ''
                                            }
                                        }}
                                        className="size-6 p-0 hover:bg-green-100"
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Preview Results */}
                    {isPreviewMode && previewData && (
                        <div className="space-y-4">
                            {/* Summary Card */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">
                                            Kết Quả Xem Trước
                                        </p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            Tổng: {previewData.totalRows} hàng
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setIsPreviewMode(false)
                                            setPreviewData(null)
                                            setEditableRows([])
                                        }}
                                    >
                                        <X className="size-4 mr-2" />
                                        Đóng Xem Trước
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                                    <div className="bg-green-100 rounded p-2 text-center">
                                        <p className="font-medium text-green-900">{previewData.validRowsCount}</p>
                                        <p className="text-green-700">Hợp Lệ</p>
                                    </div>
                                    <div className="bg-red-100 rounded p-2 text-center">
                                        <p className="font-medium text-red-900">{previewData.invalidRowsCount}</p>
                                        <p className="text-red-700">Không Hợp Lệ</p>
                                    </div>
                                    <div className="bg-yellow-100 rounded p-2 text-center">
                                        <p className="font-medium text-yellow-900">{previewData.duplicateRowsCount}</p>
                                        <p className="text-yellow-700">Trùng Lặp</p>
                                    </div>
                                    <div className="bg-gray-100 rounded p-2 text-center">
                                        <p className="font-medium text-gray-900">{previewData.skippedRowsCount}</p>
                                        <p className="text-gray-700">Đã Bỏ Qua</p>
                                    </div>
                                    <div className="bg-blue-100 rounded p-2 text-center">
                                        <p className="font-medium text-blue-900">{previewData.summary?.rowsCreatingCultivation || 0}</p>
                                        <p className="text-blue-700">Canh Tác</p>
                                    </div>
                                </div>
                            </div>

                            {/* General Errors */}
                            {previewData.generalErrors && previewData.generalErrors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-red-900 mb-2">
                                                Lỗi Chung:
                                            </p>
                                            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                                                {previewData.generalErrors.map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* General Errors */}
                            {previewData.generalErrors && previewData.generalErrors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-red-900 mb-2">
                                                General Errors:
                                            </p>
                                            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                                                {previewData.generalErrors.map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Valid Rows - Read Only */}
                            {previewData.validRows.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700">
                                        Hàng Hợp Lệ ({previewData.validRows.length})
                                    </h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <div className="max-h-48 overflow-y-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 sticky top-0">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Row</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">FarmCode</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">SoThua</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Area</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Warnings</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {previewData.validRows.map((row: PlotImportPreviewRow) => (
                                                        <tr key={row.rowNumber} className={row.warnings && row.warnings.length > 0 ? "bg-yellow-50" : "bg-green-50"}>
                                                            <td className="px-3 py-2">{row.rowNumber}</td>
                                                            <td className="px-3 py-2">{row.farmCode || '-'}</td>
                                                            <td className="px-3 py-2">{row.soThua || '-'}</td>
                                                            <td className="px-3 py-2">{row.area || '-'}</td>
                                                            <td className="px-3 py-2">
                                                                <span className={`text-xs ${row.status === 'Warning' ? 'text-yellow-700' : 'text-green-700'}`}>
                                                                    {row.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {row.warnings && row.warnings.length > 0 ? (
                                                                    <div className="flex items-start gap-1">
                                                                        <AlertTriangle className="size-3 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                                        <div className="text-xs text-yellow-700">
                                                                            {row.warnings.map((warning, i) => (
                                                                                <div key={i}>{warning}</div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Duplicate Rows - Read Only (Info) */}
                            {previewData.invalidRows.filter(row => row.isDuplicate).length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <AlertTriangle className="size-4 text-yellow-600" />
                                        Hàng Trùng Lặp ({previewData.invalidRows.filter(row => row.isDuplicate).length}) - Sẽ được bỏ qua
                                    </h4>
                                    <div className="border border-yellow-200 rounded-lg overflow-hidden bg-yellow-50">
                                        <div className="max-h-32 overflow-y-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-yellow-100 sticky top-0">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-yellow-900">Row</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-yellow-900">FarmCode</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-yellow-900">SoThua</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-yellow-900">SoTo</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-yellow-900">Reason</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-yellow-200">
                                                    {previewData.invalidRows.filter(row => row.isDuplicate).map((row: PlotImportPreviewRow) => (
                                                        <tr key={row.rowNumber}>
                                                            <td className="px-3 py-2">{row.rowNumber}</td>
                                                            <td className="px-3 py-2">{row.farmCode || '-'}</td>
                                                            <td className="px-3 py-2">{row.soThua || '-'}</td>
                                                            <td className="px-3 py-2">{row.soTo || '-'}</td>
                                                            <td className="px-3 py-2">
                                                                <div className="text-xs text-yellow-800">
                                                                    {row.warnings && row.warnings.length > 0 ? row.warnings[0] : 'Duplicate plot'}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Invalid Rows - Editable (only rows with errors, not duplicates) */}
                            {editableRows.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Edit2 className="size-4" />
                                        Sửa Lỗi ({editableRows.length})
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        Vui lòng sửa các lỗi bên dưới. Các hàng trùng lặp sẽ tự động được bỏ qua khi nhập.
                                    </p>
                                    <div className="border rounded-lg overflow-hidden">
                                        <div className="max-h-64 overflow-y-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 sticky top-0">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">FarmCode</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">SoThua</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">SoTo</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Area</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Errors</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {editableRows.map((row, index) => (
                                                        <tr key={index} className="bg-red-50">
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    type="text"
                                                                    value={row.farmCode || ''}
                                                                    onChange={(e) => handleFixRow(index, 'farmCode', e.target.value)}
                                                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                                                    placeholder="FarmCode"
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    type="number"
                                                                    value={row.soThua || ''}
                                                                    onChange={(e) => handleFixRow(index, 'soThua', e.target.value ? parseInt(e.target.value) : undefined)}
                                                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                                                    placeholder="SoThua"
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    type="number"
                                                                    value={row.soTo || ''}
                                                                    onChange={(e) => handleFixRow(index, 'soTo', e.target.value ? parseInt(e.target.value) : undefined)}
                                                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                                                    placeholder="SoTo"
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={row.area || ''}
                                                                    onChange={(e) => handleFixRow(index, 'area', e.target.value ? parseFloat(e.target.value) : undefined)}
                                                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                                                    placeholder="Area"
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <ul className="text-xs text-red-700 space-y-1">
                                                                    {previewData.invalidRows[index]?.errors?.map((err: string, i: number) => (
                                                                        <li key={i} className="flex items-start gap-1">
                                                                            <AlertCircle className="size-3 mt-0.5 flex-shrink-0" />
                                                                            <span>{err}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false)
                            resetForm()
                        }}
                        disabled={previewMutation.isPending || importMutation.isPending}
                    >
                        Hủy
                    </Button>
                    {!isPreviewMode ? (
                        <Button
                            onClick={handlePreview}
                            disabled={!selectedFile || previewMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        >
                            {previewMutation.isPending && <Spinner size="sm" />}
                            Xem Trước
                        </Button>
                    ) : (
                        <Button
                            onClick={handleImportFixed}
                            disabled={importMutation.isPending || (!(previewData?.validRowsCount ?? 0) && !editableRows.length)}
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        >
                            {importMutation.isPending && <Spinner size="sm" />}
                            <Save className="size-4" />
                            Nhập Dữ Liệu Đã Sửa
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}