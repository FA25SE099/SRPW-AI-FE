"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGroupDetail } from "@/features/groups/api/get-groups-detail";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
};

export const ProductionPlanDetail = ({
  isOpen,
  onClose,
  groupId,
}: Props) => {
  const { data, isLoading } = useGroupDetail({ groupId });

  const plan = data?.productionPlans?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Production Plan Details</DialogTitle>
        </DialogHeader>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* No plan */}
        {!isLoading && !plan && (
          <p className="text-center text-muted-foreground py-8">
            This group has no production plan yet.
          </p>
        )}

        {/* Plan info */}
        {!isLoading && plan && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{plan.planName}</h2>
              <Badge
                variant={
                  plan.status === "Completed"
                    ? "default"
                    : plan.status === "InProgress"
                      ? "secondary"
                      : "outline"
                }
              >
                {plan.status}
              </Badge>
            </div>

            {/* Information grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Base Planting Date</p>
                <p className="font-medium">
                  {plan.basePlantingDate?.slice(0, 10)}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Total Area</p>
                <p className="font-medium">{plan.totalArea} ha</p>
              </div>

              <div className="col-span-2 mt-2">
                <p className="text-muted-foreground">Plan ID</p>
                <p className="font-mono text-sm">{plan.id}</p>
              </div>
            </div>

            {/* Additional details (future expansion) */}
            {/* Nếu API trả tasks, stages, anh sẽ thêm render ở đây */}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
