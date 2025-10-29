import { useState } from "react";
import { ContentLayout } from "@/components/layouts";
import { Users, MapPin, Phone, Mail, Download, Search, Loader2 } from "lucide-react";
import { useFarmers } from "@/features/farmers/api/get-farmers";

const ClusterFarmers = () => {
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(9); // 9 items để fit grid 3 columns
    const [searchTerm, setSearchTerm] = useState("");

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

    if (isLoading) {
        return (
            <ContentLayout title="Farmers Management">
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </ContentLayout>
        );
    }

    if (isError) {
        return (
            <ContentLayout title="Farmers Management">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <p className="text-red-500 text-lg font-semibold">Failed to load farmers</p>
                        <p className="text-muted-foreground mt-2">Please try again later</p>
                    </div>
                </div>
            </ContentLayout>
        );
    }

    return (
        <ContentLayout title="Farmers Management">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Farmers Directory</h2>
                        <p className="text-muted-foreground">Manage all farmers in your cluster</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name, phone, or code..."
                                className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-64"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPageNumber(1);
                                }}
                            />
                        </div>
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                            Import Farmer
                        </button>
                        <button className="px-4 py-2 border rounded-md hover:bg-muted text-sm flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <h3 className="text-sm font-medium text-muted-foreground">Total Farmers</h3>
                        </div>
                        <p className="mt-2 text-3xl font-bold">{totalCount}</p>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-600" />
                            <h3 className="text-sm font-medium text-muted-foreground">Active Farmers</h3>
                        </div>
                        <p className="mt-2 text-3xl font-bold">
                            {farmers.filter((f) => f.isActive).length}
                        </p>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-purple-600" />
                            <h3 className="text-sm font-medium text-muted-foreground">Current Page</h3>
                        </div>
                        <p className="mt-2 text-3xl font-bold">{farmers.length}</p>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-orange-600" />
                            <h3 className="text-sm font-medium text-muted-foreground">Total Plots</h3>
                        </div>
                        <p className="mt-2 text-3xl font-bold">
                            {farmers.reduce((sum, f) => sum + f.plotCount, 0)}
                        </p>
                    </div>
                </div>

                {/* Farmers Grid */}
                {farmers.length === 0 ? (
                    <div className="col-span-full text-center py-12 border rounded-lg">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No farmers found</p>
                        <p className="text-muted-foreground mt-2">
                            {searchTerm ? "Try adjusting your search" : "Start by importing farmers"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {farmers.map((farmer) => (
                            <div key={farmer.farmerId} className="rounded-lg border bg-card p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{farmer.fullName}</h3>
                                            <span className="text-xs text-muted-foreground">{farmer.farmCode}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {farmer.isActive && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{farmer.phoneNumber}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{farmer.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>
                                            Last: {new Date(farmer.lastActivityAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Total Plots:</span>
                                        <span className="font-medium">{farmer.plotCount}</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <button className="flex-1 px-4 py-2 border rounded-md hover:bg-muted text-sm">
                                        View Details
                                    </button>
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
                            <button
                                onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Previous
                            </button>
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
                                        <button
                                            key={pageNum}
                                            onClick={() => setPageNumber(pageNum)}
                                            className={`px-3 py-2 rounded-md text-sm ${currentPage === pageNum
                                                ? 'bg-primary text-primary-foreground'
                                                : 'border hover:bg-muted'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ContentLayout>
    );
};

export const Component = ClusterFarmers;
export default ClusterFarmers;