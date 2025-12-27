import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

type YearSeasonInfoPanelProps = {
  yearSeasonId: string;
  seasonName: string;
  year: number;
  status: string;
  startDate: string;
  endDate: string;
  planningWindowStart?: string;
  planningWindowEnd?: string;
  isPlanningWindowOpen?: boolean;
  daysUntilPlanningWindowEnd?: number;
  allowedPlantingFlexibilityDays?: number;
  riceVarietyName?: string;
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

export const YearSeasonInfoPanel = ({
  seasonName,
  year,
  status,
  startDate,
  endDate,
  planningWindowStart,
  planningWindowEnd,
  isPlanningWindowOpen,
  daysUntilPlanningWindowEnd,
  allowedPlantingFlexibilityDays,
  riceVarietyName,
}: YearSeasonInfoPanelProps) => {
  const getAlertInfo = () => {
    // Planning window closed
    if (planningWindowEnd && !isPlanningWindowOpen) {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
        color: 'border-red-200 bg-red-50',
        textColor: 'text-red-900',
        message: 'Planning window is closed. You cannot create new production plans.',
      };
    }

    // Planning window closing soon (< 3 days)
    if (
      isPlanningWindowOpen &&
      daysUntilPlanningWindowEnd !== undefined &&
      daysUntilPlanningWindowEnd <= 3 &&
      daysUntilPlanningWindowEnd > 0
    ) {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
        color: 'border-orange-200 bg-orange-50',
        textColor: 'text-orange-900',
        message: `Planning window closes in ${daysUntilPlanningWindowEnd} ${daysUntilPlanningWindowEnd === 1 ? 'day' : 'days'}. Create your production plan soon!`,
      };
    }

    // Planning window open
    if (isPlanningWindowOpen) {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        color: 'border-green-200 bg-green-50',
        textColor: 'text-green-900',
        message: 'Planning window is open. You can create production plans now.',
      };
    }

    // Default info
    return {
      icon: <Info className="h-5 w-5 text-blue-600" />,
      color: 'border-blue-200 bg-blue-50',
      textColor: 'text-blue-900',
      message: 'Season information',
    };
  };

  const alertInfo = getAlertInfo();

  return (
    <Card className={`${alertInfo.color} border-2`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {alertInfo.icon}
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`font-semibold text-lg ${alertInfo.textColor}`}>
                  {seasonName} {year}
                </h3>
                <p className={`text-sm ${alertInfo.textColor} opacity-90 mt-1`}>
                  {alertInfo.message}
                </p>
              </div>
              <Badge className={`${getStatusColor(status)} text-white`}>
                {status}
              </Badge>
            </div>

            {/* Season Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {/* Season Period */}
              <div className="flex items-start gap-2">
                <Calendar className={`h-4 w-4 mt-0.5 ${alertInfo.textColor} opacity-70`} />
                <div>
                  <div className={`font-medium ${alertInfo.textColor}`}>Season Period</div>
                  <div className={`${alertInfo.textColor} opacity-80`}>
                    {format(new Date(startDate), 'MMM dd, yyyy')} -{' '}
                    {format(new Date(endDate), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>

              {/* Planning Window */}
              {planningWindowStart && planningWindowEnd && (
                <div className="flex items-start gap-2">
                  <Clock className={`h-4 w-4 mt-0.5 ${alertInfo.textColor} opacity-70`} />
                  <div>
                    <div className={`font-medium ${alertInfo.textColor}`}>
                      Planning Window
                      {isPlanningWindowOpen && (
                        <Badge className="ml-2 bg-green-500 text-white text-xs">Open</Badge>
                      )}
                      {!isPlanningWindowOpen && (
                        <Badge className="ml-2 bg-red-500 text-white text-xs">Closed</Badge>
                      )}
                    </div>
                    <div className={`${alertInfo.textColor} opacity-80`}>
                      {format(new Date(planningWindowStart), 'MMM dd')} -{' '}
                      {format(new Date(planningWindowEnd), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              )}

              {/* Rice Variety */}
              {riceVarietyName && (
                <div className="flex items-start gap-2">
                  <Info className={`h-4 w-4 mt-0.5 ${alertInfo.textColor} opacity-70`} />
                  <div>
                    <div className={`font-medium ${alertInfo.textColor}`}>Rice Variety</div>
                    <div className={`${alertInfo.textColor} opacity-80`}>{riceVarietyName}</div>
                  </div>
                </div>
              )}

              {/* Planting Flexibility */}
              {allowedPlantingFlexibilityDays !== undefined && allowedPlantingFlexibilityDays > 0 && (
                <div className="flex items-start gap-2">
                  <Calendar className={`h-4 w-4 mt-0.5 ${alertInfo.textColor} opacity-70`} />
                  <div>
                    <div className={`font-medium ${alertInfo.textColor}`}>Planting Flexibility</div>
                    <div className={`${alertInfo.textColor} opacity-80`}>
                      ±{allowedPlantingFlexibilityDays} days from group median
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Countdown for closing window */}
            {isPlanningWindowOpen &&
              daysUntilPlanningWindowEnd !== undefined &&
              daysUntilPlanningWindowEnd > 0 &&
              daysUntilPlanningWindowEnd <= 7 && (
                <div className={`text-sm font-medium ${alertInfo.textColor} pt-2 border-t`}>
                  ⏰ {daysUntilPlanningWindowEnd} {daysUntilPlanningWindowEnd === 1 ? 'day' : 'days'} remaining to create production plans
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

