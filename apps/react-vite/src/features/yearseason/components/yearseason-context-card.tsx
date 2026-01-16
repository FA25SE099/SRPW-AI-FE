import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { YearSeasonValidationContext } from '../types';
import { format } from 'date-fns';

type Props = {
  context: YearSeasonValidationContext;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Draft':
      return 'bg-gray-500';
    case 'PlanningOpen':
      return 'bg-blue-500';
    case 'Active':
      return 'bg-green-500';
    case 'Completed':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

export const YearSeasonContextCard = ({ context }: Props) => {
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {context.seasonName} {context.year}
          </CardTitle>
          <Badge className={getStatusColor(context.status)}>
            {context.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
          <div>
            <div className="font-medium">Giai Đoạn Mùa Vụ</div>
            <div className="text-muted-foreground">
              {format(new Date(context.startDate), 'MMM dd, yyyy')} -{' '}
              {format(new Date(context.endDate), 'MMM dd, yyyy')}
            </div>
          </div>
        </div>

        {context.planningWindowEnd && (
          <div className="flex items-start gap-2 text-sm">
            <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <div className="font-medium">Cửa Sổ Lên Kế Hoạch Đóng</div>
              <div className="text-muted-foreground">
                {format(new Date(context.planningWindowEnd), 'MMM dd, yyyy HH:mm')}
                {context.daysUntilPlanningWindowEnd !== undefined &&
                  context.daysUntilPlanningWindowEnd > 0 && (
                    <span className="ml-2 text-orange-600 font-medium">
                      (Còn {context.daysUntilPlanningWindowEnd} ngày)
                    </span>
                  )}
              </div>
            </div>
          </div>
        )}

        {context.groupPlantingDate && (
          <div className="flex items-start gap-2 text-sm">
            <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <div className="font-medium">Ngày Trồng Trung Vị Của Nhóm</div>
              <div className="text-muted-foreground">
                {format(new Date(context.groupPlantingDate), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        )}

        {context.allowedPlantingFlexibilityDays !== undefined &&
          context.allowedPlantingFlexibilityDays > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">Tính Linh Hoạt Trồng</div>
                <div className="text-muted-foreground">
                  ±{context.allowedPlantingFlexibilityDays} days
                </div>
              </div>
            </div>
          )}

        <div className="pt-2 border-t">
          {context.isPlanningWindowOpen ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Cửa sổ lên kế hoạch hiện đang mở</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Cửa sổ lên kế hoạch đã đóng</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

