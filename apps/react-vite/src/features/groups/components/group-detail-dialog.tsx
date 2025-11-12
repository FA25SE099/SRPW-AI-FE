'use client';

import { Loader2, Users, MapPin, Calendar, Leaf, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGroupDetail } from "../api/get-groups-detail";
import { format } from "date-fns";

type GroupDetailDialogProps = {
    groupId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const GroupDetailDialog = ({
    groupId,
    open,
    onOpenChange,
}: GroupDetailDialogProps) => {
    console.log("[GroupDetailDialog] Props:", { groupId, open });

    const {
        data: group,  // ← Đổi thành group
        isLoading,
        isError,
        error,
    } = useGroupDetail({
        groupId: groupId!,
        queryConfig: {
            enabled: !!groupId && open,
            refetchOnMount: true,
        },
    });

    console.log("[GroupDetailDialog] Query state:", { isLoading, isError, group });

    const handleClose = () => {
        console.log("[GroupDetailDialog] Closing dialog");
        onOpenChange(false);
    };

    console.log("[GroupDetailDialog] Rendering:", {
        loading: isLoading,
        error: isError,
        hasGroup: !!group,
        open,
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg">
                <DialogHeader className="border-b border-gray-200 pb-5">
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        Group Details
                    </DialogTitle>
                </DialogHeader>

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="size-8 animate-spin text-green-600" />
                        <p className="ml-2">Loading group details...</p>
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <div className="py-12 text-center">
                        <X className="mx-auto size-12 text-red-500 mb-4" />
                        <p className="text-lg font-semibold text-red-600">Failed to load group</p>
                        <p className="mt-2 text-muted-foreground">
                            Error: {error?.message || "Unknown error"}
                        </p>
                        <Button variant="outline" onClick={handleClose} className="mt-4">
                            Close
                        </Button>
                    </div>
                )}

                {/* Success */}
                {!isLoading && !isError && group && (
                    <div className="space-y-6 pt-6">
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex size-16 items-center justify-center rounded-lg bg-green-100 flex-shrink-0">
                                    <Leaf className="size-8 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 leading-snug">
                                        {group.clusterName || "Unnamed Group"}
                                    </h2>
                                    <p className="text-sm text-gray-600 font-mono mt-1">
                                        ID: {groupId}
                                    </p>

                                    <div className="grid grid-cols-2 gap-6 mt-6">
                                        <div>
                                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Supervisor
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-2">
                                                <Users className="size-4 text-green-600" />
                                                {group.supervisorName || "Not assigned"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Rice Variety
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-2">
                                                <Leaf className="size-4 text-green-600" />
                                                {group.riceVarietyName || "Not specified"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Total Area
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-2">
                                                <MapPin className="size-4 text-green-600" />
                                                {group.totalArea?.toFixed(2) || 0} hectares
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Planting Date
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-2">
                                                <Calendar className="size-4 text-green-600" />
                                                {group.plantingDate
                                                    ? format(new Date(group.plantingDate), "dd MMM yyyy")
                                                    : "Not set"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* XÓA PHẦN MESSAGE */}

                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </Button>
                            <Button
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                                disabled
                            >
                                Edit Group
                            </Button>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !isError && !group && open && (
                    <div className="py-12 text-center text-muted-foreground">
                        <p>No group details available.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};