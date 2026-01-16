import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react';

type PlotStatus = 'Ready' | 'Pending' | 'Issue';

type Plot = {
    plotId: string;
    plotName: string;
    crop: string;
    area: number;
    plantingDate: string;
    owner: string;
    status: PlotStatus;
};

type PlotsOverviewCardProps = {
    plots?: Plot[];
    totalPlots: number;
    onViewAll?: () => void;
};

const getStatusInfo = (status: PlotStatus) => {
    switch (status) {
        case 'Ready':
            return {
                icon: CheckCircle,
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                label: 'Sẵn Sàng',
            };
        case 'Pending':
            return {
                icon: Clock,
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
                label: 'Đang Chờ',
            };
        case 'Issue':
            return {
                icon: AlertCircle,
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                label: 'Có Vấn Đề',
            };
        default:
            return {
                icon: CheckCircle,
                color: 'text-gray-600',
                bgColor: 'bg-gray-50',
                label: status,
            };
    }
};

export const PlotsOverviewCard = ({ plots, totalPlots, onViewAll }: PlotsOverviewCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!plots || plots.length === 0) {
        return null;
    }

    // Group plots by status
    const plotsByStatus = plots.reduce((acc, plot) => {
        if (!acc[plot.status]) {
            acc[plot.status] = [];
        }
        acc[plot.status].push(plot);
        return acc;
    }, {} as Record<PlotStatus, Plot[]>);

    const statusCounts = {
        Ready: plotsByStatus['Ready']?.length || 0,
        Pending: plotsByStatus['Pending']?.length || 0,
        Issue: plotsByStatus['Issue']?.length || 0,
    };

    return (
        <Card className="border-border">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <CardTitle>Tổng Quan Thừa Đất</CardTitle>
                            <CardDescription>{totalPlots} thừa đất</CardDescription>
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
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                            Sẵn Sàng ({statusCounts.Ready})
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200 flex-1">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-700">
                            Đang Chờ ({statusCounts.Pending})
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200 flex-1">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-700">
                            Có Vấn Đề ({statusCounts.Issue})
                        </span>
                    </div>
                </div>

                {/* Expanded Table View */}
                {isExpanded && (
                    <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Trạng Thái
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Tên Thửa
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Giống Lúa
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Diện Tích
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Ngày Giống
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Chủ Sở Hữu
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-background divide-y divide-border">
                                    {plots.map((plot) => {
                                        const statusInfo = getStatusInfo(plot.status);
                                        const StatusIcon = statusInfo.icon;

                                        return (
                                            <tr key={plot.plotId} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                                                        <span className={`text-sm font-medium ${statusInfo.color}`}>
                                                            {statusInfo.label}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-foreground">{plot.plotName}</span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                                        {plot.crop}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                                                    {plot.area} ha
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                                                    {plot.plantingDate}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                                                    {plot.owner}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* View All Button */}
                {onViewAll && (
                    <div className="pt-2">
                        <Button variant="outline" onClick={onViewAll} className="w-full">
                            Xem Tất Cả Thửa Đất
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

