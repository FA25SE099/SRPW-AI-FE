import { ContentLayout } from "@/components/layouts";

const ClusterDashboard = () => {
    return (
        <ContentLayout title="Cluster Manager Dashboard">
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Add dashboard statistics/cards here */}
                    <div className="rounded-lg border bg-card p-6">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Fields</h3>
                        <p className="mt-2 text-3xl font-bold">0</p>
                    </div>
                    {/* Add more cards */}
                </div>
            </div>
        </ContentLayout>
    );
};

export default ClusterDashboard;