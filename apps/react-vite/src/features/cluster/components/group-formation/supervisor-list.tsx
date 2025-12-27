import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SupervisorForAssignment } from '../../types';

type SupervisorListProps = {
  supervisors: SupervisorForAssignment[];
  selectedSupervisorId?: string;
  onSelectSupervisor?: (supervisorId: string) => void;
};

export const SupervisorList = ({
  supervisors,
  selectedSupervisorId,
  onSelectSupervisor,
}: SupervisorListProps) => {
  const availableSupervisors = supervisors.filter((s) => s.isAvailable);
  const unavailableSupervisors = supervisors.filter((s) => !s.isAvailable);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-base">
            Available Supervisors ({availableSupervisors.length})
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Click to view details or assign to a group
        </p>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
        {/* Available Supervisors */}
        {availableSupervisors.length > 0 ? (
          availableSupervisors.map((supervisor) => (
            <div
              key={supervisor.supervisorId}
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                selectedSupervisorId === supervisor.supervisorId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onSelectSupervisor?.(supervisor.supervisorId)}
            >
              <div className="space-y-2">
                {/* Name and Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {supervisor.fullName}
                    </div>
                    {supervisor.phoneNumber && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{supervisor.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                </div>

                {/* Workload Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Groups</div>
                    <div className="font-semibold">{supervisor.currentGroupCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Area Used</div>
                    <div className="font-semibold">
                      {supervisor.currentTotalArea.toFixed(1)} ha
                    </div>
                  </div>
                  {supervisor.maxAreaCapacity && (
                    <div className="col-span-2">
                      <div className="text-muted-foreground">Remaining</div>
                      <div className="font-semibold text-green-600">
                        {(supervisor.remainingAreaCapacity ?? 
                          (supervisor.maxAreaCapacity - supervisor.currentTotalArea)).toFixed(1)} ha
                      </div>
                    </div>
                  )}
                </div>

                {/* Area Capacity Bar */}
                {supervisor.maxAreaCapacity && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Area Capacity</span>
                      <span className="font-medium">
                        {Math.round(
                          (supervisor.currentTotalArea / supervisor.maxAreaCapacity) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (supervisor.currentTotalArea / supervisor.maxAreaCapacity) * 100 > 90
                            ? 'bg-red-600'
                            : (supervisor.currentTotalArea / supervisor.maxAreaCapacity) * 100 > 75
                              ? 'bg-orange-500'
                              : 'bg-green-600'
                        }`}
                        style={{
                          width: `${Math.min(
                            (supervisor.currentTotalArea / supervisor.maxAreaCapacity) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {supervisor.maxAreaCapacity && 
                 (supervisor.remainingAreaCapacity ?? 
                  (supervisor.maxAreaCapacity - supervisor.currentTotalArea)) < 10 && (
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                    Low remaining capacity
                  </Badge>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No available supervisors
          </div>
        )}

        {/* Unavailable Supervisors */}
        {unavailableSupervisors.length > 0 && (
          <>
            <div className="pt-2 mt-2 border-t">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <h4 className="text-sm font-semibold text-orange-900">
                  Unavailable ({unavailableSupervisors.length})
                </h4>
              </div>
            </div>
            {unavailableSupervisors.map((supervisor) => (
              <div
                key={supervisor.supervisorId}
                className="p-3 rounded-lg border border-orange-200 bg-orange-50/50 opacity-60"
              >
                <div className="space-y-2">
                  {/* Name and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {supervisor.fullName}
                      </div>
                      {supervisor.phoneNumber && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{supervisor.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                    <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  </div>

                  {/* Unavailable Reason */}
                  {supervisor.unavailableReason && (
                    <div className="text-xs text-orange-700 font-medium">
                      {supervisor.unavailableReason}
                    </div>
                  )}

                  {/* Workload Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Groups</div>
                      <div className="font-semibold">{supervisor.currentGroupCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Area Used</div>
                      <div className="font-semibold">
                        {supervisor.currentTotalArea.toFixed(1)} ha
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};

