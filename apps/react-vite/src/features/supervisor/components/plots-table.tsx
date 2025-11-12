import { CheckCircle2, XCircle, User, MapPin, Phone, Home } from 'lucide-react';

import {
  TableElement,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlotDetail } from '@/types/group';
import { cn } from '@/utils/cn';

interface PlotsTableProps {
  plots: PlotDetail[];
  onViewPolygon?: (plot: PlotDetail) => void;
}

const getStatusColor = (hasPolygon: boolean) => {
  return hasPolygon ? 'default' : 'destructive';
};

export const PlotsTable = ({ plots, onViewPolygon }: PlotsTableProps) => {
  const plotsWithPolygon = plots.filter(p => p.hasPolygon).length;
  const plotsWithoutPolygon = plots.filter(p => !p.hasPolygon).length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 border rounded-lg">
          <MapPin className="h-8 w-8 text-blue-600" />
          <div>
            <p className="text-2xl font-bold">{plots.length}</p>
            <p className="text-sm text-muted-foreground">Total Plots</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
          <div>
            <p className="text-2xl font-bold text-green-600">{plotsWithPolygon}</p>
            <p className="text-sm text-muted-foreground">With Polygon</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-red-50 dark:bg-red-950">
          <XCircle className="h-8 w-8 text-red-600" />
          <div>
            <p className="text-2xl font-bold text-red-600">{plotsWithoutPolygon}</p>
            <p className="text-sm text-muted-foreground">Missing Polygon</p>
          </div>
        </div>
      </div>

      {/* Plots Table */}
      <div className="border rounded-lg">
        <TableElement>
          <TableHeader>
            <TableRow>
              <TableHead>Plot ID</TableHead>
              <TableHead>Tờ / Thửa</TableHead>
              <TableHead>Area (ha)</TableHead>
              <TableHead>Soil Type</TableHead>
              <TableHead>Polygon</TableHead>
              <TableHead>Farmer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plots.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No plots assigned to this group yet.
                </TableCell>
              </TableRow>
            ) : (
              plots.map((plot) => (
                <TableRow 
                  key={plot.plotId}
                  className={cn(
                    !plot.hasPolygon && "bg-red-50 dark:bg-red-950/20"
                  )}
                >
                  <TableCell className="font-mono text-xs">
                    {plot.plotId.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {plot.soTo && plot.soThua ? (
                        <>
                          <span className="font-medium">Tờ {plot.soTo}</span>
                          <span className="text-muted-foreground"> / </span>
                          <span className="font-medium">Thửa {plot.soThua}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{plot.area}</span>
                  </TableCell>
                  <TableCell>
                    {plot.soilType || (
                      <span className="text-muted-foreground">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(plot.hasPolygon)}>
                      {plot.hasPolygon ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Assigned
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Missing
                        </span>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {plot.farmerName || 'Unknown'}
                        </span>
                      </div>
                      {plot.farmCode && (
                        <div className="text-xs text-muted-foreground">
                          Code: {plot.farmCode}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {plot.farmerPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{plot.farmerPhone}</span>
                        </div>
                      )}
                      {plot.farmerAddress && (
                        <div className="flex items-center gap-2">
                          <Home className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{plot.farmerAddress}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{plot.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {plot.hasPolygon && onViewPolygon && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewPolygon(plot)}
                      >
                        View Map
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </TableElement>
      </div>
    </div>
  );
};

