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

type ImportFarmersDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const ImportFarmersDialog = ({ open, onOpenChange }: ImportFarmersDialogProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const farmerTemplate = useFarmerImportTemplate();

    const importMutation = useImportFarmers({
        mutationConfig: {
            onSuccess: (data) => {
                if (data.failureCount === 0) {
                    alert(`Successfully imported ${data.successCount} farmers!`);
                    onOpenChange(false);
                    setSelectedFile(null);
                }
            },
            onError: (error: any) => {
                alert(`Import failed: ${error.message || 'Unknown error'}`);
            },
        },
    });

    const handleDownloadTemplate = async () => {
        try {
            setIsDownloading(true);
            await farmerTemplate.download();
        } catch (error: any) {
            alert(`Failed to download template: ${error.message || 'Unknown error'}`);
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
            alert('Please upload an Excel file (.xls or .xlsx)');
            return false;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
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
                    <DialogTitle>Import Farmers from Excel</DialogTitle>
                    <DialogDescription>
                        Upload an Excel file containing farmer information
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Download Template Button */}
                    <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                                    <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                                    Download Import Template
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    Get the Excel template with the correct format for importing farmers. 
                                    Fill in farmer details including NumberOfPlots for each farmer.
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
                                        Downloading...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Template
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                    {/* File Upload Area */}
                    {!selectedFile && !importMutation.data && (
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground mb-2">
                                Drag and drop your Excel file here, or click to browse
                            </p>
                            <input
                                type="file"
                                accept=".xls,.xlsx"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload">
                                <Button variant="outline" type="button" className="cursor-pointer inline-flex items-center">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Select File
                                </Button>
                            </label>
                            <p className="text-xs text-muted-foreground mt-4">
                                Supported formats: .xls, .xlsx (Max 10MB)
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
                            <h4 className="font-medium text-sm mb-2">Expected Excel Format:</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-xs">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-2 py-1 text-left">Id (Optional)</th>
                                            <th className="px-2 py-1 text-left">FullName</th>
                                            <th className="px-2 py-1 text-left">PhoneNumber</th>
                                            <th className="px-2 py-1 text-left">Address</th>
                                            <th className="px-2 py-1 text-left">FarmCode</th>
                                            <th className="px-2 py-1 text-left">NumberOfPlots</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="px-2 py-1">GUID or empty</td>
                                            <td className="px-2 py-1">John Doe</td>
                                            <td className="px-2 py-1">+1234567890</td>
                                            <td className="px-2 py-1">123 St</td>
                                            <td className="px-2 py-1">FARM001</td>
                                            <td className="px-2 py-1">3</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                <strong>NumberOfPlots:</strong> Specify how many plots each farmer owns (default: 1). 
                                This will generate the correct number of rows in the plot import template.
                            </p>
                        </div>
                    )}

                    {/* Import Results */}
                    {importMutation.data && (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="border rounded-lg p-4 bg-blue-50">
                                    <p className="text-sm text-muted-foreground">Total Rows</p>
                                    <p className="text-2xl font-bold">{importMutation.data.totalRows}</p>
                                </div>
                                <div className="border rounded-lg p-4 bg-green-50">
                                    <p className="text-sm text-muted-foreground">Success</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {importMutation.data.successCount}
                                    </p>
                                </div>
                                <div className="border rounded-lg p-4 bg-red-50">
                                    <p className="text-sm text-muted-foreground">Failures</p>
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
                                        <h4 className="font-medium text-red-900">Import Errors</h4>
                                    </div>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {importMutation.data.errors.map((error, idx) => (
                                            <div key={idx} className="text-sm bg-white p-3 rounded border">
                                                <p className="font-medium">Row {error.rowNumber}</p>
                                                <p className="text-muted-foreground">
                                                    Field: {error.fieldName}
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
                                            Successfully imported {importMutation.data.successCount} farmers
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleClose} disabled={importMutation.isPending}>
                            {importMutation.data ? 'Close' : 'Cancel'}
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
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Import
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