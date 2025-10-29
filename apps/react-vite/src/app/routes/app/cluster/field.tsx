import { ContentLayout } from "@/components/layouts";
import { MapPin, Calendar, TrendingUp } from "lucide-react";

const mockFields = [
    {
        id: 1,
        name: "Rice Field A1",
        location: "Long An Province",
        area: "5.2 hectares",
        cropType: "Rice",
        plantingDate: "2024-01-15",
        expectedHarvest: "2024-05-20",
        status: "Growing",
        farmer: "Nguyen Van A",
    },
    {
        id: 2,
        name: "Rice Field B2",
        location: "Dong Thap Province",
        area: "3.8 hectares",
        cropType: "Rice",
        plantingDate: "2024-02-01",
        expectedHarvest: "2024-06-10",
        status: "Growing",
        farmer: "Tran Thi B",
    },
    {
        id: 3,
        name: "Rice Field C3",
        location: "An Giang Province",
        area: "4.5 hectares",
        cropType: "Rice",
        plantingDate: "2024-01-20",
        expectedHarvest: "2024-05-25",
        status: "Harvesting",
        farmer: "Le Van C",
    },
    {
        id: 4,
        name: "Rice Field D4",
        location: "Tien Giang Province",
        area: "6.1 hectares",
        cropType: "Rice",
        plantingDate: "2023-12-10",
        expectedHarvest: "2024-04-15",
        status: "Preparation",
        farmer: "Pham Thi D",
    },
];

const ClusterField = () => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "Growing":
                return "bg-green-100 text-green-800";
            case "Harvesting":
                return "bg-yellow-100 text-yellow-800";
            case "Preparation":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <ContentLayout title="Fields Management">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Fields Overview</h2>
                        <p className="text-muted-foreground">
                            Manage and monitor all rice fields in your cluster
                        </p>
                    </div>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                        Add New Field
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Total Fields
                            </h3>
                        </div>
                        <p className="mt-2 text-3xl font-bold">{mockFields.length}</p>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Total Area
                            </h3>
                        </div>
                        <p className="mt-2 text-3xl font-bold">19.6 ha</p>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-purple-600" />
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Active Fields
                            </h3>
                        </div>
                        <p className="mt-2 text-3xl font-bold">
                            {mockFields.filter((f) => f.status === "Growing").length}
                        </p>
                    </div>
                </div>

                {/* Fields Table */}
                <div className="rounded-lg border bg-card">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">All Fields</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium">Field Name</th>
                                        <th className="text-left py-3 px-4 font-medium">Location</th>
                                        <th className="text-left py-3 px-4 font-medium">Area</th>
                                        <th className="text-left py-3 px-4 font-medium">Farmer</th>
                                        <th className="text-left py-3 px-4 font-medium">Planting Date</th>
                                        <th className="text-left py-3 px-4 font-medium">Status</th>
                                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockFields.map((field) => (
                                        <tr key={field.id} className="border-b hover:bg-muted/50">
                                            <td className="py-3 px-4 font-medium">{field.name}</td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {field.location}
                                            </td>
                                            <td className="py-3 px-4">{field.area}</td>
                                            <td className="py-3 px-4">{field.farmer}</td>
                                            <td className="py-3 px-4">{field.plantingDate}</td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                        field.status
                                                    )}`}
                                                >
                                                    {field.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button className="text-blue-600 hover:underline text-sm">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </ContentLayout>
    );
};

export const Component = ClusterField;
export default ClusterField;