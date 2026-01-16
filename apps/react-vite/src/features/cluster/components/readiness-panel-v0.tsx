import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ClusterCurrentSeason } from '../types';

type ReadinessPanelV0Props = {
  readiness: ClusterCurrentSeason['readiness'];
  hasGroups: boolean;
  onViewDetails?: () => void;
  onFormGroups?: () => void;
};

// Hàm dịch văn bản từ tiếng Anh sang tiếng Việt
const translateText = (text: string): string => {
  const translations: Record<string, string> = {
    // Blocking Issues
    'Insufficient farmers (need at least 5, have 0)': 'Không đủ nông dân (cần ít nhất 5, hiện có 0)',
    'Insufficient plots with boundaries (need at least 5, have 0)': 'Không đủ thửa đất có ranh giới (cần ít nhất 5, hiện có 0)',
    // Recommendations
    'Import more farmers to the cluster': 'Nhập thêm nông dân vào cụm',
    'Complete polygon boundaries for more plots': 'Hoàn thành ranh giới đa giác cho các thửa đất',
  };

  // Kiểm tra exact match
  if (translations[text]) {
    return translations[text];
  }

  // Kiểm tra pattern cho các số khác nhau
  // Pattern: Insufficient farmers (need at least X, have Y)
  const farmerMatch = text.match(/Insufficient farmers \(need at least (\d+), have (\d+)\)/);
  if (farmerMatch) {
    return `Không đủ nông dân (cần ít nhất ${farmerMatch[1]}, hiện có ${farmerMatch[2]})`;
  }

  // Pattern: Insufficient plots with boundaries (need at least X, have Y)
  const plotMatch = text.match(/Insufficient plots with boundaries \(need at least (\d+), have (\d+)\)/);
  if (plotMatch) {
    return `Không đủ thửa đất có ranh giới (cần ít nhất ${plotMatch[1]}, hiện có ${plotMatch[2]})`;
  }

  // Nếu không tìm thấy, trả về văn bản gốc
  return text;
};

export const ReadinessPanelV0 = ({
  readiness,
  hasGroups,
  onViewDetails,
  onFormGroups,
}: ReadinessPanelV0Props) => {
  if (!readiness) return null;

  const statusColor = readiness.isReadyToFormGroups ? 'text-chart-1' : 'text-amber-600';
  const statusBg = readiness.isReadyToFormGroups ? 'bg-chart-1/10' : 'bg-amber-500/10';

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 bg-chart-2 rounded-full"></span>
            Trạng Thái Sẵn Sàng
          </CardTitle>
          <CardDescription>Danh sách kiểm tra chuẩn bị mùa vụ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg border ${statusBg}`}>
            <div className="flex items-center gap-3">
              {readiness.isReadyToFormGroups ? (
                <CheckCircle2 className={`w-6 h-6 ${statusColor} flex-shrink-0`} />
              ) : (
                <AlertCircle className={`w-6 h-6 ${statusColor} flex-shrink-0`} />
              )}
              <div>
                <p className="font-semibold text-foreground">
                  {readiness.isReadyToFormGroups ? 'Sẵn Sàng Hình Thành Nhóm' : 'Chưa Sẵn Sàng'}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Điểm Sẵn Sàng: {readiness.readinessScore}%
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between text-sm">
              <span className="text-muted-foreground">Nông Dân Hiện Có</span>
              <span className="font-semibold text-foreground">{readiness.availableFarmers}</span>
            </div>
            <div className="flex items-start justify-between text-sm">
              <span className="text-muted-foreground">Thừa Đất Có Đa Giác</span>
              <span className="font-semibold text-foreground">{readiness.plotsWithPolygon}</span>
            </div>
            <div className="flex items-start justify-between text-sm">
              <span className="text-muted-foreground">Thiếu Đa Giác</span>
              <span className="font-semibold text-destructive">{readiness.plotsWithoutPolygon}</span>
            </div>
            <div className={`flex items-start justify-between text-sm border-t border-border pt-3 p-2 rounded ${readiness.availableSupervisors === 0 ? 'bg-red-50 border border-red-200' : ''
              }`}>
              <span className={`flex items-center gap-1 ${readiness.availableSupervisors === 0 ? 'text-red-700 font-medium' : 'text-muted-foreground'}`}>
                Giám Sát Viên Hiện Có {readiness.availableSupervisors === 0 && <AlertTriangle className="w-4 h-4" />}
              </span>
              <span className={`font-semibold ${readiness.availableSupervisors === 0 ? 'text-red-600' : 'text-foreground'
                }`}>
                {readiness.availableSupervisors}
              </span>
            </div>
          </div>

          {readiness.blockingIssues && readiness.blockingIssues.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold text-destructive uppercase tracking-wide">
                VẤn Đề Cần Giải Quyết
              </h4>
              {readiness.blockingIssues.map((issue, idx) => (
                <div key={idx} className="flex gap-2 text-sm">
                  <span className="text-destructive flex-shrink-0">•</span>
                  <span className="text-foreground">{translateText(issue)}</span>
                </div>
              ))}
            </div>
          )}

          {readiness.recommendations && readiness.recommendations.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-border">
              <h4 className="text-xs font-semibold text-chart-1 uppercase tracking-wide">
                Gợi Ý
              </h4>
              {readiness.recommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-2 text-sm">
                  <Info className="w-4 h-4 text-chart-1 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{translateText(rec)}</span>
                </div>
              ))}
            </div>
          )}

          {!hasGroups && onFormGroups && (
            <div className="pt-4 border-t border-border">
              <Button
                className="w-full"
                onClick={onFormGroups}
                disabled={
                  !readiness.isReadyToFormGroups ||
                  readiness.availablePlots === 0 ||
                  readiness.availableSupervisors === 0
                }
              >
                {readiness.availablePlots === 0
                  ? 'Chưa đủ điều kiện'
                  : readiness.availableSupervisors === 0
                    ? 'Không Có Giám Sát Viên'
                    : !readiness.isReadyToFormGroups
                      ? 'Chưa Sẵn Sàng Hình Thành Nhóm'
                      : 'Hình Thành Nhóm'
                }
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

