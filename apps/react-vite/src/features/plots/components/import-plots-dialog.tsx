import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X, Download, Loader2 } from 'lucide-react'
import { useImportPlotsExcel } from '../api/import-plots-excel'
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
}

export const ImportPlotsDialog = ({ open, onOpenChange }: ImportPlotsDialogProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [importDate, setImportDate] = useState<string>('')
    const [errors, setErrors] = useState<string[]>([])
    const [successMessage, setSuccessMessage] = useState<string>('')
    const [isDownloading, setIsDownloading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { addNotification } = useNotifications()

    const plotTemplate = usePlotImportTemplate()

    const importMutation = useImportPlotsExcel({
        mutationConfig: {
            onSuccess: (data) => {
                console.log('📦 Import response:', JSON.stringify(data, null, 2))

                // ✅ Check if response is wrapped object or raw array
                if (Array.isArray(data)) {
                    // Backend returned array directly (old format)
                    setSuccessMessage(`Đã nhập thành công ${data.length} thừa đất!`)
                    setErrors([])
                    addNotification({
                        type: 'success',
                        title: 'Nhập Thành Công',
                        message: `Đã nhập thành công ${data.length} thừa đất!`,
                    })

                    setTimeout(() => {
                        onOpenChange(false)
                        resetForm()
                    }, 2000)
                } else if (data.success === true) {
                    // Backend returned wrapped response
                    setSuccessMessage(data.message || 'Nhập thừa đất thành công!')
                    setErrors([])
                    addNotification({
                        type: 'success',
                        title: 'Nhập Thành Công',
                        message: data.message || 'Nhập thừa đất thành công!',
                    })

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
                    addNotification({
                        type: 'error',
                        title: 'Nhập Thất Bại',
                        message: data.message || 'Nhập thất bại',
                    })
                } else {
                    // Unknown format
                    console.error('Unknown response format:', data)
                    setErrors(['Định dạng phản hồi không mong đợi'])
                    addNotification({
                        type: 'error',
                        title: 'Nhập Thất Bại',
                        message: 'Nhập thất bại - phản hồi không mong đợi',
                    })
                }
            },
            onError: (error: any) => {
                console.error('❌ Import error:', error)
                console.error('Error response:', error?.response?.data)

                const responseData = error?.response?.data

                if (responseData && (responseData.succeeded === false || responseData.success === false)) {
                    // Backend returned error response (supports both 'succeeded' and 'success')
                    const errorMessages = responseData.errors && responseData.errors.length > 0
                        ? responseData.errors
                        : [responseData.message || 'Import failed']

                    setErrors(errorMessages)
                    addNotification({
                        type: 'error',
                        title: 'Nhập Thất Bại',
                        message: responseData.message || 'Nhập thất bại',
                    })
                } else {
                    // Network or unknown error
                    setErrors(['Nhập thừa đất thất bại. Vui lòng thử lại.'])
                    addNotification({
                        type: 'error',
                        title: 'Nhập Thất Bại',
                        message: 'Nhập thừa đất thất bại',
                    })
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
            setErrors([])
            setSuccessMessage('')
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
                setErrors([])
                setSuccessMessage('')
            }
        }
    }

    const handleImport = () => {
        if (!selectedFile) {
            addNotification({
                type: 'error',
                title: 'Chưa Chọn File',
                message: 'Vui lòng chọn file để nhập',
            })
            return
        }

        setErrors([])
        setSuccessMessage('')

        importMutation.mutate({
            excelFile: selectedFile,
            importDate: importDate || undefined,
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
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="size-5 text-green-600" />
                        Nhập Thừa Đất Từ Excel
                    </DialogTitle>
                    <DialogDescription>
                        Tải lên file Excel để nhập nhiều thừa đất cùng lúc
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
                                disabled={isDownloading || importMutation.isPending}
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

                    {/* Import Date (Optional) */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Ngày Nhập (Tùy Chọn)
                        </label>
                        <input
                            type="date"
                            value={importDate}
                            onChange={(e) => setImportDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
                        />
                        <p className="text-xs text-gray-500">
                            Để trống để sử dụng ngày hiện tại
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
                                        Lỗi Kiểm Tra:
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
                        Hủy
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!selectedFile || importMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                        {importMutation.isPending && <Spinner size="sm" />}
                        Nhập Thừa Đất
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}