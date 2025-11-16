import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClusterHistory } from '../types';

type HistoryChartV0Props = {
  data: ClusterHistory | null;
};

export const HistoryChartV0 = ({ data }: HistoryChartV0Props) => {
  if (!data || !data.seasons || data.seasons.length === 0) return null;

  const chartData = data.seasons.map((season) => ({
    season: season.seasonName,
    year: season.year,
    groups: season.groupCount || 0,
    plots: season.plotCount || 0,
    area: season.totalArea || 0,
  }));

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-2 h-2 bg-chart-1 rounded-full"></span>
          Historical Trends
        </CardTitle>
        <CardDescription>Track cluster performance across seasons</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-semibold text-foreground">Season</th>
                <th className="text-right py-2 px-2 font-semibold text-foreground">Groups</th>
                <th className="text-right py-2 px-2 font-semibold text-foreground">Plots</th>
                <th className="text-right py-2 px-2 font-semibold text-foreground">Area (ha)</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-3 px-2 font-medium text-foreground">
                    {row.season} {row.year}
                  </td>
                  <td className="text-right py-3 px-2 text-foreground">{row.groups}</td>
                  <td className="text-right py-3 px-2 text-foreground">{row.plots}</td>
                  <td className="text-right py-3 px-2 text-chart-1 font-semibold">{row.area}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

