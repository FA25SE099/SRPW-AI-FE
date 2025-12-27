import { Badge } from '@/components/ui/badge';
import { MaterialDistributionStatus } from '../types';

interface DistributionStatusBadgeProps {
  status: MaterialDistributionStatus;
}

export const DistributionStatusBadge = ({
  status,
}: DistributionStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Pending':
        return {
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'PartiallyConfirmed':
        return {
          label: 'Awaiting Farmer',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'Completed':
        return {
          label: 'Completed',
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'Overdue':
        return {
          label: 'Overdue',
          className: 'bg-red-100 text-red-800 border-red-200',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

