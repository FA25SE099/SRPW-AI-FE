import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Users, Phone, Mail, MapPin, AlertCircle, Bell } from 'lucide-react';

type Supervisor = {
  supervisorId: string;
  name: string;
  email: string;
  phone: string;
  assignedGroups: number;
  totalPlots: number;
  totalArea: number;
  status: 'Available' | 'Assigned' | 'Busy';
};

type SupervisorOverviewCardProps = {
  supervisors?: Supervisor[];
  totalSupervisors: number;
  onViewAll?: () => void;
};

const getStatusInfo = (status: Supervisor['status']) => {
  switch (status) {
    case 'Available':
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Sẵn Sàng',
      };
    case 'Assigned':
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: 'Đã Phân Công',
      };
    case 'Busy':
      return {
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        label: 'Bận',
      };
    default:
      return {
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        label: status,
      };
  }
};

export const SupervisorOverviewCard = ({
  supervisors,
  totalSupervisors,
  onViewAll
}: SupervisorOverviewCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Show empty state UI when no supervisors
  if (!supervisors || supervisors.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div>
              <CardTitle>Giám Sát Viên</CardTitle>
              <CardDescription>Chưa có giám sát viên được phân công</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-orange-50 p-3 mb-4">
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              Chưa Có Giám Sát Viên
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Cụm này chưa có giám sát viên được phân công.
              Giám sát viên cần thiết để quản lý các nhóm và điều phối hoạt động canh tác.
            </p>
            <Button
              variant="default"
              onClick={() => {
                // Alert admin functionality
                if (onViewAll) {
                  onViewAll();
                }
              }}
              className="gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Bell className="w-4 h-4" />
              Thông Báo Quản Trị Viên
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group supervisors by status
  const statusCounts = {
    Available: supervisors.filter(s => s.status === 'Available').length,
    Assigned: supervisors.filter(s => s.status === 'Assigned').length,
    Busy: supervisors.filter(s => s.status === 'Busy').length,
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div>
              <CardTitle>Giám Sát Viên Hiện Có</CardTitle>
              <CardDescription>{totalSupervisors} giám sát viên</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            {isExpanded ? (
              <>
                <span className="text-sm">Thu Gọn</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span className="text-sm">Mở Rộng</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Summary Pills */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200 flex-1">
            <div className="w-2 h-2 rounded-full bg-green-600"></div>
            <span className="text-sm font-medium text-green-700">
              Sẵn Sàng ({statusCounts.Available})
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 flex-1">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <span className="text-sm font-medium text-blue-700">
              Đã Phân Công ({statusCounts.Assigned})
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200 flex-1">
            <div className="w-2 h-2 rounded-full bg-orange-600"></div>
            <span className="text-sm font-medium text-orange-700">
              Bận ({statusCounts.Busy})
            </span>
          </div>
        </div>

        {/* Expanded List View */}
        {isExpanded && (
          <div className="space-y-3">
            {supervisors.map((supervisor) => {
              const statusInfo = getStatusInfo(supervisor.status);

              return (
                <div
                  key={supervisor.supervisorId}
                  className={`p-4 rounded-lg border ${statusInfo.borderColor} ${statusInfo.bgColor} hover:shadow-sm transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{supervisor.name}</h4>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{supervisor.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{supervisor.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supervisor Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Nhóm</div>
                      <div className="text-lg font-bold text-foreground">
                        {supervisor.assignedGroups}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Thửa Đất</div>
                      <div className="text-lg font-bold text-foreground">
                        {supervisor.totalPlots}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Diện Tích</div>
                      <div className="text-lg font-bold text-foreground">
                        {supervisor.totalArea} ha
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Compact List View (when collapsed) */}
        {!isExpanded && (
          <div className="space-y-2">
            {supervisors.slice(0, 3).map((supervisor) => {
              const statusInfo = getStatusInfo(supervisor.status);

              return (
                <div
                  key={supervisor.supervisorId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${statusInfo.color.replace('text-', 'bg-')}`}></div>
                    <div>
                      <div className="font-medium text-sm text-foreground">{supervisor.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {supervisor.assignedGroups} nhóm • {supervisor.totalPlots} thửa đất
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              );
            })}
            {supervisors.length > 3 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  +{supervisors.length - 3} giám sát viên khác
                </button>
              </div>
            )}
          </div>
        )}

        {/* View All Button */}
        {onViewAll && (
          <div className="pt-2">
            <Button variant="outline" onClick={onViewAll} className="w-full">
              Quản Lý Giám Sát Viên
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

