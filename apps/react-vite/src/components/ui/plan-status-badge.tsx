import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

type PlanStatus = 'awaiting-plan' | 'in-progress' | 'completed' | 'pending';

interface PlanStatusBadgeProps {
    status: PlanStatus;
    className?: string;
}

export const PlanStatusBadge = ({ status, className }: PlanStatusBadgeProps) => {
    const getStatusConfig = (status: PlanStatus) => {
        switch (status) {
            case 'awaiting-plan':
                return {
                    label: 'Awaiting Plan',
                    className: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
                };
            case 'in-progress':
                return {
                    label: 'In Progress',
                    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
                };
            case 'completed':
                return {
                    label: 'Completed',
                    className: 'bg-green-100 text-green-700 hover:bg-green-100',
                };
            case 'pending':
                return {
                    label: 'Pending',
                    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
                };
            default:
                return {
                    label: 'Unknown',
                    className: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <Badge
            variant="outline"
            className={cn(config.className, className)}
        >
            {config.label}
        </Badge>
    );
};