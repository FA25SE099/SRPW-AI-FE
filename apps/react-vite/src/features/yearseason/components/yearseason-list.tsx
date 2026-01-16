import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
import { YearSeasonListItem, YearSeasonSummary } from '../types';
import { format } from 'date-fns';

type YearSeasonListProps = {
  yearSeasons: YearSeasonListItem[] | YearSeasonSummary[];
  clusterName?: string; // Optional cluster name for display
  isLoading?: boolean;
  onView?: (yearSeasonId: string) => void;
  onEdit?: (yearSeasonId: string) => void;
  onDelete?: (yearSeasonId: string) => void;
  onCreate?: () => void;
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

export const YearSeasonList = ({
  yearSeasons,
  clusterName,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onCreate,
}: YearSeasonListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredSeasons = yearSeasons.filter((season) => {
    // Handle both YearSeasonListItem and YearSeasonSummary
    const seasonClusterName = 'clusterName' in season ? season.clusterName : (clusterName || '');
    
    const matchesSearch =
      season.seasonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seasonClusterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      season.riceVarietyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || season.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Create */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo mùa vụ, cụm hoặc giống lúa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">Tất Cả Trạng Thái</option>
            <option value="Draft">Bản Nháp</option>
            <option value="PlanningOpen">Mở Lập Kế Hoạch</option>
            <option value="Active">Đang Hoạt Động</option>
            <option value="Completed">Đã Hoàn Thành</option>
          </select>
        </div>
        {onCreate && (
          <Button onClick={onCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo Mùa Vụ Năm
          </Button>
        )}
      </div>

      {/* YearSeason Cards */}
      {filteredSeasons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Không tìm thấy mùa vụ năm
            </p>
            <p className="text-sm text-muted-foreground">
              {searchTerm || filterStatus !== 'all'
                ? 'Thử điều chỉnh bộ lọc của bạn'
                : 'Tạo mùa vụ năm đầu tiên để bắt đầu'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSeasons.map((season) => (
            <Card key={season.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {season.seasonName} {season.year}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {'clusterName' in season ? season.clusterName : clusterName}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(season.status)} text-white`}>
                    {season.status === 'Draft' ? 'Bản Nháp' :
                     season.status === 'PlanningOpen' ? 'Mở Lập Kế Hoạch' :
                     season.status === 'Active' ? 'Đang Hoạt Động' :
                     season.status === 'Completed' ? 'Đã Hoàn Thành' : season.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {format(new Date(season.startDate), 'MMM dd')} -{' '}
                      {format(new Date(season.endDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Giống Lúa:</span>
                    <span className="font-medium">{season.riceVarietyName}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  {onView && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(season.id)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(season.id)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Chỉnh Sửa
                    </Button>
                  )}
                  {onDelete && season.status === 'Draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(season.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

