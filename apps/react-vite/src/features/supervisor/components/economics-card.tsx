import { TrendingUp, TrendingDown, DollarSign, Award } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EconomicsOverview } from '@/types/group';
import { cn } from '@/utils/cn';

interface EconomicsCardProps {
  economics: EconomicsOverview;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const getPerformanceBadgeVariant = (rating: string) => {
  switch (rating.toLowerCase()) {
    case 'excellent':
      return 'default';
    case 'good':
      return 'secondary';
    case 'fair':
      return 'outline';
    default:
      return 'destructive';
  }
};

export const EconomicsCard = ({ economics }: EconomicsCardProps) => {
  const costVariancePositive = economics.costVariancePercentage < 0;
  const yieldVariancePositive = economics.yieldVariancePercentage > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Economic Summary</CardTitle>
          <Badge variant={getPerformanceBadgeVariant(economics.performanceRating)}>
            <Award className="mr-1 h-3 w-3" />
            {economics.performanceRating}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Yield Performance */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Yield Performance</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Expected Yield</p>
              <p className="text-xl font-bold">{economics.expectedYield} tons</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Actual Yield</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">{economics.actualYield} tons</p>
                {yieldVariancePositive ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
            <span className="text-sm">Yield Variance:</span>
            <span 
              className={cn(
                "text-lg font-bold",
                yieldVariancePositive ? "text-green-600" : "text-red-600"
              )}
            >
              {yieldVariancePositive ? '+' : ''}
              {economics.yieldVariancePercentage.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Cost Analysis</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Estimated Cost</p>
              <p className="text-lg font-semibold">
                {formatCurrency(economics.totalEstimatedCost)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Actual Cost</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">
                  {formatCurrency(economics.totalActualCost)}
                </p>
                {costVariancePositive ? (
                  <TrendingDown className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
            <span className="text-sm">Cost Variance:</span>
            <span 
              className={cn(
                "text-lg font-bold",
                costVariancePositive ? "text-green-600" : "text-red-600"
              )}
            >
              {economics.costVariancePercentage.toFixed(2)}%
            </span>
            <span className="text-xs text-muted-foreground">
              ({costVariancePositive ? 'Under' : 'Over'} budget)
            </span>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="p-4 border-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Profit Margin</span>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">
                {economics.profitMargin.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Expected</p>
            <p className="text-sm font-medium">{economics.expectedYield}t</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Achieved</p>
            <p className="text-sm font-medium text-green-600">{economics.actualYield}t</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Rating</p>
            <p className="text-sm font-medium">{economics.performanceRating}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

