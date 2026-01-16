import { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle, FileSpreadsheet, Loader2, Download } from 'lucide-react';
import { useImportFarmers } from '../api/import-farmers';
import { useFarmerImportTemplate } from '../api/download-farmer-import-template';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useNotifications } from '@/components/ui/notifications';

type ImportFarmersDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const ImportFarmersDialog = ({ open, onOpenChange }: ImportFarmersDialogProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const { addNotification } = useNotifications();

    const farmerTemplate = useFarmerImportTemplate();

    const importMutation = useImportFarmers({
        mutationConfig: {
            onSuccess: (data) => {
                if (data.failureCount === 0) {
                    addNotification({
                        type: 'success',
                        title: 'Nhập Thành Công',
                        message: `Đã nhập thành công ${data.successCount} nông dân!`,
                    });
                    onOpenChange(false);
                    setSelectedFile(null);
                }
            },
            onError: (error: any) => {
                addNotification({
                    type: 'error',
                    title: 'Nhập Thất Bại',
                    message: error.message || 'Đã xảy ra lỗi không xác định',
                });
            },
        },
    });

    const handleDownloadTemplate = async () => {
        try {
            setIsDownloading(true);
            await farmerTemplate.download();
        } catch (error: any) {
            addNotification({
                type: 'error',
                title: 'Tải Thất Bại',
                message: error.message || 'Tải mẫu thất bại',
            });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
            }
        }
    };

    const validateFile = (file: File): boolean => {
        const validTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        if (!validTypes.includes(file.type)) {
            addNotification({
                type: 'error',
                title: 'Loại File Không Hợp Lệ',
                message: 'Vui lòng tải lên file Excel (.xls hoặc .xlsx)',
            });
            return false;
        }
        if (file.size > 10 * 1024 * 1024) {
            addNotification({
                type: 'error',
                title: 'File Quá Lớn',
                message: 'Kích thước file phải nhỏ hơn 10MB',
            });
            return false;
        }
        return true;
    };

    const handleImport = () => {
        if (selectedFile) {
            importMutation.mutate(selectedFile);
        }
    };

    const handleClose = () => {
        if (!importMutation.isPending) {
            setSelectedFile(null);
            importMutation.reset();
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nhập Excel</DialogTitle>
                    <DialogDescription>
                        Tải lên file Excel chứa thông tin nông dân
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Download Template Button */}
                    <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                                    <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                                    Tải Mẫu Nhập
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    Tải mẫu Excel với định dạng đúng để nhập nông dân.
                                    Điền thông tin nông dân bao gồm Số Lượng Thửa Đất cho mỗi nông dân.
                                </p>
                            </div>
                            <Button
                                onClick={handleDownloadTemplate}
                                disabled={isDownloading || importMutation.isPending}
                                variant="outline"
                                size="sm"
                                className="shrink-0"
                            >
                                {isDownloading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Đang tải...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 mr-2" />
                                        Tải Mẫu
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                    {/* File Upload Area */}
                    {!selectedFile && !importMutation.data && (
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${dragActive
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground mb-2">
                                Kéo thả file Excel vào đây, hoặc nhấp để chọn file
                            </p>
                            <input
                                type="file"
                                accept=".xls,.xlsx"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                            />
                            <div className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                                <Upload className="h-4 w-4" />
                                <span className="text-sm font-medium">Chọn File</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                                Định dạng hỗ trợ: .xls, .xlsx (Tối đa 10MB)
                            </p>
                        </div>
                    )}

                    {/* Selected File */}
                    {selectedFile && !importMutation.data && (
                        <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="font-medium">{selectedFile.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                </div>
                                {!importMutation.isPending && (
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Excel Format Guide */}
                    {!importMutation.data && (
                        <div className="border rounded-lg p-4 bg-blue-50">
                            <h4 className="font-medium text-sm mb-2">Định Dạng Excel Mong Đợi:</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-xs">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-2 py-1 text-left">Id (Tùy Chọn)</th>
                                            <th className="px-2 py-1 text-left">Họ Và Tên</th>
                                            <th className="px-2 py-1 text-left">Số Điện Thoại</th>
                                            <th className="px-2 py-1 text-left">Địa Chỉ</th>
                                            <th className="px-2 py-1 text-left">Mã Nông Dân</th>
                                            <th className="px-2 py-1 text-left">Số Lượng Thửa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="px-2 py-1">GUID hoặc để trống</td>
                                            <td className="px-2 py-1">Nguyễn Văn A</td>
                                            <td className="px-2 py-1">0901234567</td>
                                            <td className="px-2 py-1">123 Đường ABC</td>
                                            <td className="px-2 py-1">FARM001</td>
                                            <td className="px-2 py-1">3</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                <strong>Số Lượng Thửa:</strong> Chỉ định số lượng thửa đất mỗi nông dân sở hữu (mặc định: 1).
                                Điều này sẽ tạo số hàng chính xác trong mẫu nhập thửa đất.
                            </p>
                        </div>
                    )}

                    {/* Import Results */}
                    {importMutation.data && (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="border rounded-lg p-4 bg-blue-50">
                                    <p className="text-sm text-muted-foreground">Tổng Số Hàng</p>
                                    <p className="text-2xl font-bold">{importMutation.data.totalRows}</p>
                                </div>
                                <div className="border rounded-lg p-4 bg-green-50">
                                    <p className="text-sm text-muted-foreground">Thành Công</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {importMutation.data.successCount}
                                    </p>
                                </div>
                                <div className="border rounded-lg p-4 bg-red-50">
                                    <p className="text-sm text-muted-foreground">Thất Bại</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {importMutation.data.failureCount}
                                    </p>
                                </div>
                            </div>

                            {/* Errors */}
                            {importMutation.data.errors.length > 0 && (
                                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                        <h4 className="font-medium text-red-900">Lỗi Nhập</h4>
                                    </div>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {importMutation.data.errors.map((error, idx) => (
                                            <div key={idx} className="text-sm bg-white p-3 rounded border">
                                                <p className="font-medium">Hàng {error.rowNumber}</p>
                                                <p className="text-muted-foreground">
                                                    Trường: {error.fieldName}
                                                </p>
                                                <p className="text-red-600">{error.errorMessage}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {importMutation.data.successCount > 0 && (
                                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <p className="text-green-900">
                                            Đã nhập thành công {importMutation.data.successCount} nông dân
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleClose} disabled={importMutation.isPending}>
                            {importMutation.data ? 'Đóng' : 'Hủy'}
                        </Button>
                        {!importMutation.data && (
                            <Button
                                onClick={handleImport}
                                disabled={!selectedFile || importMutation.isPending}
                                className="inline-flex items-center"
                            >
                                {importMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Đang nhập...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Nhập
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};