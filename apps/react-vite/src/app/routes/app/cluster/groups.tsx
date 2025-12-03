import { useState } from "react"
import { ContentLayout } from "@/components/layouts"
import { Users, MapPin, AlertTriangle, Plus, TrendingUp } from "lucide-react"
import { useGroups } from "@/features/groups/api/get-groups"
import { GroupDetailDialog } from "@/features/groups/components/group-detail-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

const ClusterGroups = () => {
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)

    const groupsQuery = useGroups()
    const response = groupsQuery.data;
    const isLoading = groupsQuery.isLoading;
    const isError = groupsQuery.isError;

    const groups = Array.isArray(response) ? response : response?.data || []

    const handleViewDetails = (groupId: string) => {
        setSelectedGroupId(groupId)
        setDetailDialogOpen(true)
    }

    const getStatusColor = (status: string) => {
        const statusMap: Record<string, string> = {
            Active: "bg-green-100 text-green-800 border-green-200",
            Draft: "bg-gray-100 text-gray-800 border-gray-200",
            Locked: "bg-red-100 text-red-800 border-red-200",
            ReadyForOptimization: "bg-blue-100 text-blue-800 border-blue-200",
            Exception: "bg-orange-100 text-orange-800 border-orange-200",
        }
        return statusMap[status] || "bg-gray-100 text-gray-800 border-gray-200"
    }

    if (isLoading) {
        return (
            <ContentLayout title="Groups Management">
                <div className="flex h-96 items-center justify-center">
                    <Spinner size="lg" className="text-green-600" />
                </div>
            </ContentLayout>
        )
    }

    if (isError) {
        return (
            <ContentLayout title="Groups Management">
                <div className="flex h-96 items-center justify-center">
                    <div className="text-center">
                        <AlertTriangle className="mx-auto mb-4 size-12 text-red-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Failed to load groups</h3>
                        <p className="mt-2 text-sm text-gray-600">Please try again later</p>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="mt-6"
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            </ContentLayout>
        )
    }

    return (
        <ContentLayout title="Groups Management">
            {/* Page Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-5 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-snug">Groups</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        {response?.message || "Manage and monitor all farm groups"}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                                    <Users className="size-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Groups</p>
                                    <p className="text-2xl font-bold text-gray-900 leading-snug mt-1">{groups.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                                    <TrendingUp className="size-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Active</p>
                                    <p className="text-2xl font-bold text-gray-900 leading-snug mt-1">
                                        {groups.filter((g: any) => g.status === "Active").length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-gray-100">
                                    <AlertTriangle className="size-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Draft</p>
                                    <p className="text-2xl font-bold text-gray-900 leading-snug mt-1">
                                        {groups.filter((g: any) => g.status === "Draft").length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                                    <MapPin className="size-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Area</p>
                                    <p className="text-2xl font-bold text-gray-900 leading-snug mt-1">
                                        {groups.reduce((sum: number, g: any) => sum + g.totalArea, 0).toFixed(1)} <span className="text-base font-normal text-gray-600">ha</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Groups Grid */}
                {groups.length === 0 ? (
                    <div className="bg-white border border-gray-200 border-dashed rounded-lg py-16 text-center">
                        <Users className="mx-auto mb-4 size-16 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900">No groups yet</h3>
                        <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
                            Start by creating your first group to organize farm operations
                        </p>
                        <Button
                            className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
                        >
                            <Plus className="size-4" />
                            Create your first group
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {groups.map((group: any) => (
                            <div
                                key={group.groupId}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-150 flex flex-col"
                            >
                                {/* Card Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-12 items-center justify-center rounded-lg bg-green-100">
                                            <Users className="size-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900">Group</h3>
                                            <p className="text-xs text-gray-500 font-mono mt-0.5">
                                                {group.groupId.slice(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded border ${getStatusColor(group.status)}`}>
                                        {group.status}
                                    </span>
                                </div>

                                {/* Card Content - Fixed Height */}
                                <div className="flex-1 pb-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                                        <MapPin className="size-4 text-green-600 flex-shrink-0" />
                                        <span className="font-medium">{group.totalArea} hectares</span>
                                    </div>
                                    {/* ✅ Always render this div to maintain consistent height */}
                                    <div className="min-h-[20px]">
                                        {group.area && (
                                            <p className="text-xs text-gray-500">
                                                📍 Coordinates available
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Card Actions */}
                                <div className="mt-4">
                                    <Button
                                        onClick={() => handleViewDetails(group.groupId)}
                                        variant="outline"
                                        className="w-full border-green-600 text-green-600 hover:bg-green-50 font-medium"
                                        size="sm"
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Dialog */}
            <GroupDetailDialog
                groupId={selectedGroupId}
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
            />
        </ContentLayout>
    )
}

export const Component = ClusterGroups
export default ClusterGroups