import { useFarmerPlots } from '../api/get-farmer-plots';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FarmerPlot } from '@/features/farmers/api/get-farmer-detail';
import { Sprout } from 'lucide-react';
type FarmerPlotsListProps = {
    farmerId: string;
};
export const FarmerPlotsList = ({ farmerId }: FarmerPlotsListProps) => {
    const { data, isLoading, isError } = useFarmerPlots(farmerId);
    if (isLoading) {
        return <Spinner size="lg" />;
    }
    if (isError || !data) {
        return <div>Error fetching plots.</div>;
    }
    return (
        <div className="space-y-4">
            {data.plots.map((plot: FarmerPlot) => (
                <Card key={plot.plotId}>
                    <CardHeader>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <Sprout className="h-5 w-5 text-green-600" />
                                <div>
                                    <h4 className="font-semibold">
                                        Thửa {plot.soThua} - Tờ {plot.soTo}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">{plot.varietyName}</p>
                                </div>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-xs ${plot.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                {plot.status}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Area</p>
                                <p className="font-medium">{plot.area} ha</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Soil Type</p>
                                <p className="font-medium">{plot.soilType}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Plot ID</p>
                                <p className="font-mono text-xs">{plot.plotId}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
