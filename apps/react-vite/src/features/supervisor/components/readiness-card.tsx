import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { GroupReadinessInfo } from '@/types/group';
import { cn } from '@/utils/cn';

interface ReadinessCardProps {
  readiness: GroupReadinessInfo;
}

const CheckItem = ({
  passed,
  label
}: {
  passed: boolean;
  label: string;
}) => {
  return (
    <div className="flex items-center gap-2">
      {passed ? (
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      ) : (
        <XCircle className="h-5 w-5 text-red-600" />
      )}
      <span className={cn(
        "text-sm",
        passed ? "text-foreground" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  );
};

export const ReadinessCard = ({ readiness }: ReadinessCardProps) => {
  const getColorClass = () => {
    if (readiness.isReady) return 'text-green-600';
    if (readiness.readinessScore >= 75) return 'text-orange-600';
    return 'text-red-600';
  };

  const getBadgeVariant = () => {
    if (readiness.isReady) return 'default';
    if (readiness.readinessScore >= 75) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sẵn Sàng Kế Hoạch Sản Xuất</span>
          <Badge variant={getBadgeVariant()}>
            {readiness.readinessLevel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Điểm Sẵn Sàng</span>
            <span className={cn("text-2xl font-bold", getColorClass())}>
              {readiness.readinessScore}%
            </span>
          </div>
          <Progress value={readiness.readinessScore} className="h-3" />
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Danh Sách Yêu Cầu</h4>
          <div className="space-y-2">
            <CheckItem
              passed={readiness.hasRiceVariety}
              label="Đã Chọn Giống Lúa"
            />
            <CheckItem
              passed={readiness.hasTotalArea}
              label="Đã Xác Định Tổng Diện Tích"
            />
            <CheckItem
              passed={readiness.hasPlots}
              label="Đã Phân Công Tất Cả Thửa Đất"
            />
            {/* <CheckItem 
              passed={readiness.allPlotsHavePolygons} 
              label={`All Polygons (${readiness.plotsWithPolygon}/${readiness.totalPlots})`}
            /> */}
          </div>
        </div>

        {/* Blocking Issues */}
        {readiness.blockingIssues.length > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Vấn Đề Cản Trở</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-disc list-inside space-y-1">
                {readiness.blockingIssues.map((issue, index) => (
                  <li key={index} className="text-sm">{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Warnings */}
        {readiness.warnings.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Cảnh Báo</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-disc list-inside space-y-1">
                {readiness.warnings.map((warning, index) => (
                  <li key={index} className="text-sm">{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Ready Status */}
        {readiness.isReady && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900 dark:text-green-100">Sẵn Sàng Tạo Kế Hoạch Sản Xuất</AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              Đã đáp ứng tất cả yêu cầu. Bạn có thể tạo kế hoạch sản xuất cho nhóm này.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

