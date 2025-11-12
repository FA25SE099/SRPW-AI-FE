import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { useImportPlotsExcel } from '../api/import-plots-excel'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

type ImportPlotsDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const ImportPlotsDialog = ({ open, onOpenChange }: ImportPlotsDialogProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [importDate, setImportDate] = useState<string>('')
    const [errors, setErrors] = useState<string[]>([])
    const [successMessage, setSuccessMessage] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const importMutation = useImportPlotsExcel({
        mutationConfig: {
            onSuccess: (data) => {
                console.log('📦 Import response:', JSON.stringify(data, null, 2))

                // ✅ Check if response is wrapped object or raw array
                if (Array.isArray(data)) {
                    // Backend returned array directly (old format)
                    setSuccessMessage(`Successfully imported ${data.length} plots!`)
                    setErrors([])
                    toast.success(`Successfully imported ${data.length} plots!`)

                    setTimeout(() => {
                        onOpenChange(false)
                        resetForm()
                    }, 2000)
                } else if (data.success === true) {
                    // Backend returned wrapped response (new format)
                    setSuccessMessage(data.message || 'Plots imported successfully!')
                    setErrors([])
                    toast.success(data.message || 'Plots imported successfully!')

                    setTimeout(() => {
                        onOpenChange(false)
                        resetForm()
                    }, 2000)
                } else if (data.success === false) {
                    // Backend returned error in wrapped format
                    const errorMessages = data.errors && data.errors.length > 0
                        ? data.errors
                        : [data.message || 'Import failed']

                    setErrors(errorMessages)
                    setSuccessMessage('')
                    toast.error(data.message || 'Import failed')
                } else {
                    // Unknown format
                    console.error('Unknown response format:', data)
                    setErrors(['Unexpected response format'])
                    toast.error('Import failed - unexpected response')
                }
            },
            onError: (error: any) => {
                console.error('❌ Import error:', error)
                console.error('Error response:', error?.response?.data)

                const responseData = error?.response?.data

                if (responseData && responseData.success === false) {
                    // Backend returned error response
                    const errorMessages = responseData.errors && responseData.errors.length > 0
                        ? responseData.errors
                        : [responseData.message || 'Import failed']

                    setErrors(errorMessages)
                    toast.error(responseData.message || 'Import failed')
                } else {
                    // Network or unknown error
                    setErrors(['Failed to import plots. Please try again.'])
                    toast.error('Failed to import plots')
                }

                setSuccessMessage('')
            },
        },
    })

    const resetForm = () => {
        setSelectedFile(null)
        setImportDate('')
        setErrors([])
        setSuccessMessage('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
            ]
            if (!validTypes.includes(file.type)) {
                toast.error('Please select a valid Excel file (.xlsx or .xls)')
                return
            }
            setSelectedFile(file)
            setErrors([])
            setSuccessMessage('')
        }
    }

    const handleImport = () => {
        if (!selectedFile) {
            toast.error('Please select a file to import')
            return
        }

        setErrors([])
        setSuccessMessage('')

        importMutation.mutate({
            excelFile: selectedFile,
            importDate: importDate || undefined,
        })
    }

    const handleDownloadTemplate = () => {
        toast.info('Template download feature - to be implemented')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="size-5 text-green-600" />
                        Import Plots from Excel
                    </DialogTitle>
                    <DialogDescription>
                        Upload an Excel file to import multiple plots at once
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Download Template */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900 mb-2">
                                    Don't have a template?
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadTemplate}
                                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                                >
                                    Download Excel Template
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Excel File <span className="text-red-500">*</span>
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
                            <label
                                htmlFor="excel-upload"
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                            >
                                <Upload className="size-6 text-gray-400" />
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-700">
                                        {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Excel files only (.xlsx, .xls)
                                    </p>
                                </div>
                            </label>
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

                    {/* Import Date (Optional) */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Import Date (Optional)
                        </label>
                        <input
                            type="date"
                            value={importDate}
                            onChange={(e) => setImportDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                        />
                        <p className="text-xs text-gray-500">
                            Leave empty to use current date
                        </p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-green-900">
                                        {successMessage}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Validation Errors */}
                    {errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-900 mb-2">
                                        Validation Errors:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                                        {errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
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
                        disabled={importMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!selectedFile || importMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                        {importMutation.isPending && <Spinner size="sm" />}
                        Import Plots
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}