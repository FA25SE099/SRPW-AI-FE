import { format, differenceInDays } from 'date-fns';
import { Calendar, Clock, Package, Phone, User, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FarmerDistribution } from '../types';
import { DistributionStatusBadge } from './distribution-status-badge';

interface FarmerDistributionCardProps {
  distribution: FarmerDistribution;
  onBulkConfirm: (plotCultivationId: string) => void;
}

export const FarmerDistributionCard = ({
  distribution,
  onBulkConfirm,
}: FarmerDistributionCardProps) => {
  const isOverdue = distribution.isSupervisorOverdue;
  const daysUntilDeadline = differenceInDays(
    new Date(distribution.supervisorConfirmationDeadline),
    new Date()
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <Card
      className={`transition-all hover:shadow-md ${
        isOverdue ? 'border-red-300 bg-red-50/30' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-gray-500" />
              <h3 className="font-semibold text-lg">{distribution.farmerName}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{distribution.plotName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{distribution.farmerPhone}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <DistributionStatusBadge status={distribution.status} />
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {distribution.totalMaterialCount} Material{distribution.totalMaterialCount > 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Materials List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Materials to Distribute
          </h4>
          <div className="space-y-2">
            {distribution.materials.map((material) => (
              <div
                key={material.distributionId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0">
                    {material.status === 'Completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Package className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {material.materialName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {material.quantity} {material.unit}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    material.status === 'Completed'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }
                >
                  {material.status === 'Completed' ? 'Done' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Scheduled:</span>
            </div>
            <span className="font-medium">
              {formatDate(distribution.scheduledDistributionDate)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Distribution Deadline:</span>
            </div>
            <span
              className={`font-medium ${
                isOverdue ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              {formatDate(distribution.distributionDeadline)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <AlertCircle className="h-4 w-4" />
              <span>Confirm By:</span>
            </div>
            <span
              className={`font-medium ${
                daysUntilDeadline < 0
                  ? 'text-red-600'
                  : daysUntilDeadline <= 1
                    ? 'text-orange-600'
                    : 'text-gray-900'
              }`}
            >
              {formatDate(distribution.supervisorConfirmationDeadline)}
            </span>
          </div>
        </div>

        {/* Overdue Warning */}
        {isOverdue && (
          <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800 font-medium">
              Confirmation overdue by {Math.abs(daysUntilDeadline)} day(s)!
            </p>
          </div>
        )}

        {/* Progress Summary */}
        {distribution.status !== 'Pending' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-900 font-medium">Progress:</span>
              <span className="text-blue-700">
                {distribution.confirmedMaterialCount} / {distribution.totalMaterialCount} materials confirmed
              </span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        {distribution.status === 'Pending' && (
          <Button
            onClick={() => onBulkConfirm(distribution.plotCultivationId)}
            className="w-full"
            variant={isOverdue ? 'destructive' : 'default'}
          >
            <Package className="mr-2 h-4 w-4" />
            Confirm All Materials ({distribution.totalMaterialCount})
          </Button>
        )}

        {distribution.status === 'PartiallyConfirmed' && (
          <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">
                Waiting for farmer confirmation
              </p>
            </div>
            <p className="text-xs text-blue-700">
              Farmer has until {formatDate(distribution.farmerConfirmationDeadline)}
            </p>
          </div>
        )}

        {distribution.status === 'Completed' && (
          <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-900">All Materials Delivered</p>
            </div>
            <div className="text-xs text-green-700 space-y-1">
              <p>Distributed: {formatDate(distribution.actualDistributionDate)}</p>
              <p>
                Confirmed by farmer: {formatDate(distribution.supervisorConfirmedAt)}
              </p>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

