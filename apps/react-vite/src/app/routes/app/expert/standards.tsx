import { FileText, Download, Edit } from 'lucide-react';
import { ContentLayout } from '@/components/layouts';

const StandardsRoute = () => {
    const standardPlans = [
        {
            id: 1,
            name: 'Rice Cultivation Standard',
            crop: 'Rice',
            version: '2.1',
            lastUpdated: '2024-01-15',
            status: 'active',
            farms: 45,
        },
        {
            id: 2,
            name: 'Wheat Growing Guidelines',
            crop: 'Wheat',
            version: '1.8',
            lastUpdated: '2024-01-10',
            status: 'active',
            farms: 32,
        },
        {
            id: 3,
            name: 'Corn Production Protocol',
            crop: 'Corn',
            version: '3.0',
            lastUpdated: '2024-01-05',
            status: 'active',
            farms: 28,
        },
        {
            id: 4,
            name: 'Pest Management Standard',
            crop: 'All Crops',
            version: '1.5',
            lastUpdated: '2023-12-20',
            status: 'review',
            farms: 105,
        },
        {
            id: 5,
            name: 'Organic Farming Standards',
            crop: 'All Crops',
            version: '2.0',
            lastUpdated: '2023-12-15',
            status: 'active',
            farms: 18,
        },
    ];

    return (
        <ContentLayout title="Standard Plans">
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">
                            Manage standard farming plans and protocols
                        </p>
                    </div>
                    <button className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
                        Create New Standard
                    </button>
                </div>

                {/* Standards Grid */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {standardPlans.map((plan) => (
                        <div key={plan.id} className="rounded-lg border bg-white p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-blue-100 p-2">
                                        <FileText className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{plan.name}</h3>
                                        <p className="mt-1 text-sm text-gray-600">{plan.crop}</p>
                                    </div>
                                </div>
                                <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${plan.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                >
                                    {plan.status}
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
                                <div>
                                    <p className="text-xs text-gray-500">Version</p>
                                    <p className="mt-1 font-medium">{plan.version}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Active Farms</p>
                                    <p className="mt-1 font-medium">{plan.farms}</p>
                                </div>
                            </div>

                            <div className="mt-2">
                                <p className="text-xs text-gray-500">Last Updated</p>
                                <p className="mt-1 text-sm">{plan.lastUpdated}</p>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    <Download className="h-4 w-4" />
                                    Download
                                </button>
                                <button className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ContentLayout>
    );
};

export default StandardsRoute;
