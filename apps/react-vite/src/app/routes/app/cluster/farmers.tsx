import { useState } from "react";
import { ContentLayout } from "@/components/layouts";
import { Users, MapPin, Phone, Mail, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { useNotifications } from "@/components/ui/notifications";
import { useFarmers } from "@/features/farmers/api/get-farmers";
import { ImportFarmersDialog } from "@/features/farmers/components/import-farmers-dialog";
import { useExportFarmers } from "@/features/farmers/api/export-farmers";
import { FarmerDetailDialog } from "@/features/farmers/components/farmer-detail-dialog";

const ClusterFarmers = () => {
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(9);
    const [searchTerm, setSearchTerm] = useState("");
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    const { addNotification } = useNotifications();

    const { data, isLoading, isError } = useFarmers({
        params: {
            pageNumber,
            pageSize,
            searchTerm: searchTerm || undefined,
        },
    });

    const farmers = data?.data || [];
    const totalPages = data?.totalPages || 0;
    const totalCount = data?.totalCount || 0;
    const currentPage = data?.currentPage || 1;

    const exportMutation = useExportFarmers({
        mutationConfig: {
            onSuccess: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `farmers_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                addNotification({
                    type: 'success',
                    title: 'Export Successful',
                    message: 'Farmers data has been exported successfully',
                });
            },
            onError: (error: any) => {
                addNotification({
                    type: 'error',
                    title: 'Export Failed',
                    message: error.message || 'Unknown error occurred',
                });
            },
        },
    });

    const handleExport = () => {
        const today = new Date().toISOString();
        exportMutation.mutate(today);
    };

    const handleViewDetails = (farmerId: string) => {
        setSelectedFarmerId(farmerId);
        setDetailDialogOpen(true);
    };

    if (isLoading) {
        return (
            <ContentLayout title="Farmers Management">
                <div className="flex h-96 items-center justify-center">
                    <Spinner size="lg" />
                </div>
            </ContentLayout>
        );
    }

    if (isError) {
        return (
            <ContentLayout title="Farmers Management">
                <div className="flex h-96 items-center justify-center">
                    <div className="text-center">
                        <p className="text-lg font-semibold text-red-500">Failed to load farmers</p>
                        <p className="mt-2 text-muted-foreground">Please try again later</p>
                    </div>
                </div>
            </ContentLayout>
        );
    }

    return (
        <ContentLayout title="Farmers Management">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground">Manage all farmers in your cluster</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 transform text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name, phone, or code..."
                                className="w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPageNumber(1);
                                }}
                            />
                        </div>
                        <Button
                            onClick={() => setImportDialogOpen(true)}
                        >
                            Import Farmer
                        </Button>
                        <Button
                            onClick={handleExport}
                            disabled={exportMutation.isPending}
                            isLoading={exportMutation.isPending}
                            variant="outline"
                            icon={<Download className="size-4" />}
                        >
                            Export
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <Users className="size-5 text-blue-600" />
                            <h3 className="text-sm font-medium text-muted-foreground">Total Farmers</h3>
                        </div>
                        <p className="mt-2 text-3xl font-bold">{totalCount}</p>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <Users className="size-5 text-green-600" />
                            <h3 className="text-sm font-medium text-muted-foreground">Active Farmers</h3>
                        </div>
                        <p className="mt-2 text-3xl font-bold">
                            {farmers.filter((f) => f.isActive).length}
                        </p>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <Users className="size-5 text-purple-600" />
                            <h3 className="text-sm font-medium text-muted-foreground">Current Page</h3>
                        </div>
                        <p className="mt-2 text-3xl font-bold">{farmers.length}</p>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <MapPin className="size-5 text-orange-600" />
                            <h3 className="text-sm font-medium text-muted-foreground">Total Plots</h3>
                        </div>
                        <p className="mt-2 text-3xl font-bold">
                            {farmers.reduce((sum, f) => sum + f.plotCount, 0)}
                        </p>
                    </div>
                </div>

                {/* Farmers Grid */}
                {farmers.length === 0 ? (
                    <div className="col-span-full rounded-lg border py-12 text-center">
                        <Users className="mx-auto mb-4 size-12 text-muted-foreground" />
                        <p className="text-lg font-medium">No farmers found</p>
                        <p className="mt-2 text-muted-foreground">
                            {searchTerm ? "Try adjusting your search" : "Start by importing farmers"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {farmers.map((farmer) => (
                            <div key={farmer.farmerId} className="rounded-lg border bg-card p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
                                            <Users className="size-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{farmer.fullName}</h3>
                                            <span className="text-xs text-muted-foreground">{farmer.farmCode}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {farmer.isActive && (
                                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="size-4" />
                                        <span>{farmer.phoneNumber}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="size-4" />
                                        <span>{farmer.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="size-4" />
                                        <span>
                                            Last: {new Date(farmer.lastActivityAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 border-t pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Total Plots:</span>
                                        <span className="font-medium">{farmer.plotCount}</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <Button
                                        onClick={() => handleViewDetails(farmer.farmerId)}
                                        variant="outline"
                                        className="flex-1"
                                        size="sm"
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t pt-4">
                        <p className="text-sm text-muted-foreground">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} farmers
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                variant="outline"
                                size="sm"
                            >
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = idx + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = idx + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + idx;
                                    } else {
                                        pageNum = currentPage - 2 + idx;
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            onClick={() => setPageNumber(pageNum)}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            className="min-w-[40px]"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                variant="outline"
                                size="sm"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <FarmerDetailDialog
                farmerId={selectedFarmerId}
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
            />
            <ImportFarmersDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
            />
        </ContentLayout>
    );
};

export const Component = ClusterFarmers;
export default ClusterFarmers;