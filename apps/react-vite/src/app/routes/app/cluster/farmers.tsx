import { ContentLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Phone, Mail, Download } from "lucide-react";

const mockFarmer = [
    {
        farmerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        fullName: "John Doe",
        address: "123 Farm Street",
        phoneNumber: "0939419649",
        isActive: true,
        isVerified: true,
        lastActivityAt: "2024-01-15T10:30:00Z",
        farmCode: "FARM001",
        plotCount: 5
    },
    {
        farmerId: "f08a13bc-ce4d-4663-94ac-fe50f50d6772",
        fullName: "John Văn Doe",
        address: "36 Farm Street",
        phoneNumber: "0903891204",
        isActive: true,
        isVerified: true,
        lastActivityAt: "2024-01-15T10:35:00Z",
        farmCode: "FARM002",
        plotCount: 6
    }
];

const ClusterFarmers = () => {
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
                        <button className="px-4 py-2 border rounded-md hover:bg-muted flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Download Template
                        </button>
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                            Import Farmer
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
                        <p className="mt-2 text-3xl font-bold">{mockFarmer.length}</p>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-600" />
                            <h3 className="text-sm font-medium text-muted-foreground">Active Farmers</h3>
                        </div>
                        <p className="mt-2 text-3xl font-bold">
                            {mockFarmer.filter((f) => f.isActive).length}
                        </p>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-purple-600" />
                            <h3 className="text-sm font-medium text-muted-foreground">Verified</h3>
                        </div>
                        <p className="mt-2 text-3xl font-bold">
                            {mockFarmer.filter((f) => f.isVerified).length}
                        </p>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-orange-600" />
                            <h3 className="text-sm font-medium text-muted-foreground">Total Plots</h3>
                        </div>
                        <p className="mt-2 text-3xl font-bold">
                            {mockFarmer.reduce((sum, f) => sum + f.plotCount, 0)}
                        </p>
                    </div>
                </div>

                {/* Farmers Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {mockFarmer.map((farmer) => (
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
                                    {farmer.isVerified && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                            Verified
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
                                    <span>Last activity: {new Date(farmer.lastActivityAt).toLocaleDateString()}</span>
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
                                <button className="px-4 py-2 border rounded-md hover:bg-muted text-sm flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Export
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ContentLayout>
    );
};

export const Component = ClusterFarmers;
export default ClusterFarmers;