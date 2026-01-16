import { Calendar, MapPin, Sprout, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MyGroupResponse } from '@/types/group';
import { formatDate } from '@/utils/format';

interface GroupInfoCardProps {
  group: MyGroupResponse;
}

const InfoItem = ({
  icon: Icon,
  label,
  value
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null | undefined;
}) => {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-base font-medium">{value || 'Not set'}</p>
      </div>
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'readyforoptimization':
      return 'default';
    case 'locked':
      return 'destructive';
    case 'exception':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export const GroupInfoCard = ({ group }: GroupInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{group.groupName}</CardTitle>
          <Badge variant={getStatusColor(group.status)}>
            {group.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <InfoItem
              icon={Calendar}
              label="Mùa Vụ"
              value={`${group.season.seasonName} (${group.season.seasonType})`}
            />
            <InfoItem
              icon={Calendar}
              label="Giai Đoạn Mùa Vụ"
              value={`${group.season.startDate} - ${group.season.endDate}`}
            />
            <InfoItem
              icon={MapPin}
              label="Cụm"
              value={group.clusterName}
            />
          </div>

          <div className="space-y-4">
            <InfoItem
              icon={Sprout}
              label="Giống Gạo"
              value={group.riceVarietyName}
            />
            <InfoItem
              icon={Calendar}
              label="Ngày Trồng"
              value={group.plantingDate ? formatDate(group.plantingDate) : 'Not set'}
            />
            <InfoItem
              icon={Users}
              label="Tổng Diện Tích"
              value={group.totalArea ? `${group.totalArea} hecta` : 'Not calculated'}
            />
          </div>
        </div>

        {/* Production Plans Summary */}
        {group.productionPlans.totalPlans > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-semibold mb-3">Production Plans Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{group.productionPlans.totalPlans}</p>
                <p className="text-xs text-muted-foreground">Total Plans</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{group.productionPlans.activePlans}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{group.productionPlans.draftPlans}</p>
                <p className="text-xs text-muted-foreground">Draft</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{group.productionPlans.approvedPlans}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

