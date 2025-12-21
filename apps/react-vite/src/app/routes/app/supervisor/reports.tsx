import { TrendingUp, BarChart3, FileText, FileSpreadsheet, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentLayout } from '@/components/layouts';

const getFileTypeIcon = (type: string) => {
    switch (type) {
        case 'PDF':
            return <FileText className="h-5 w-5" />;
        case 'Excel':
            return <FileSpreadsheet className="h-5 w-5" />;
        default:
            return <FileText className="h-5 w-5" />;
    }
};

const getFileTypeColor = (type: string) => {
    switch (type) {
        case 'PDF':
            return 'text-red-600 bg-red-50';
        case 'Excel':
            return 'text-green-600 bg-green-50';
        default:
            return 'text-gray-600 bg-gray-50';
    }
};

const getReportTypeColor = (name: string) => {
    // Use different colors based on report name keywords
    if (name.toLowerCase().includes('production') || name.toLowerCase().includes('summary')) {
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    if (name.toLowerCase().includes('performance') || name.toLowerCase().includes('farmer')) {
        return 'bg-green-100 text-green-800 border-green-300';
    }
    if (name.toLowerCase().includes('material') || name.toLowerCase().includes('usage')) {
        return 'bg-purple-100 text-purple-800 border-purple-300';
    }
    if (name.toLowerCase().includes('yield') || name.toLowerCase().includes('comparison')) {
        return 'bg-orange-100 text-orange-800 border-orange-300';
    }
    if (name.toLowerCase().includes('financial')) {
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300';
};

const ReportsRoute = () => {
    const handleViewDetails = (reportId: string) => {
        // Handle view details action
        console.log('View details for report:', reportId);
    };

    return (
        <ContentLayout title="Reports & Analytics">
            <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 bg-blue-50 p-6 shadow-sm">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                            <p className="text-sm font-medium text-blue-900">Avg Yield/Ha</p>
                        </div>
                        <p className="mt-3 text-3xl font-bold text-blue-600">6.8 tons</p>
                        <p className="mt-1 text-xs text-blue-700">+12% vs last season</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-green-50 p-6 shadow-sm">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                            <p className="text-sm font-medium text-green-900">Plan Success Rate</p>
                        </div>
                        <p className="mt-3 text-3xl font-bold text-green-600">87%</p>
                        <p className="mt-1 text-xs text-green-700">Target: 85%</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-purple-50 p-6 shadow-sm">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-purple-600" />
                            <p className="text-sm font-medium text-purple-900">Cost Efficiency</p>
                        </div>
                        <p className="mt-3 text-3xl font-bold text-purple-600">93%</p>
                        <p className="mt-1 text-xs text-purple-700">Within budget</p>
                    </div>
                </div>

                {/* Reports List */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Available Reports</h2>
                        <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                            Generate New Report
                        </button>
                    </div>
                    <div className="space-y-4">
                        {[
                            { 
                                id: '1',
                                name: 'Monthly Production Summary', 
                                date: 'March 2024', 
                                type: 'PDF',
                                description: 'Overview of all production activities'
                            },
                            { 
                                id: '2',
                                name: 'Farmer Performance Analysis', 
                                date: 'Q1 2024', 
                                type: 'Excel',
                                description: 'Individual farmer metrics and comparisons'
                            },
                            { 
                                id: '3',
                                name: 'Material Usage Report', 
                                date: 'Feb 2024', 
                                type: 'PDF',
                                description: 'Fertilizer and pesticide consumption'
                            },
                            { 
                                id: '4',
                                name: 'Yield Comparison Report', 
                                date: '2023-2024', 
                                type: 'PDF',
                                description: 'Year-over-year yield analysis'
                            },
                            { 
                                id: '5',
                                name: 'Financial Summary', 
                                date: 'Q1 2024', 
                                type: 'Excel',
                                description: 'Costs, revenues, and profitability'
                            },
                        ].map((report) => {
                            const typeColor = getFileTypeColor(report.type);
                            const typeIcon = getFileTypeIcon(report.type);
                            const borderColor = getReportTypeColor(report.name);

                            return (
                                <div
                                    key={report.id}
                                    className={`rounded-lg border-2 ${borderColor} p-4 shadow-sm hover:shadow-md transition-shadow`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`p-2 rounded-lg ${typeColor}`}>
                                                    {typeIcon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                                                            {report.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">{report.description}</p>

                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    Period: <span className="font-medium text-gray-900">{report.date}</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 ml-4">
                                            <Button
                                                onClick={() => handleViewDetails(report.id)}
                                                variant="outline"
                                                size="sm"
                                                className="whitespace-nowrap"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-gray-900">Season Overview</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                            <p className="text-sm text-gray-600">Total Area Planted</p>
                            <p className="mt-1 text-xl font-bold text-gray-900">45.8 ha</p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                            <p className="text-sm text-gray-600">Expected Harvest</p>
                            <p className="mt-1 text-xl font-bold text-gray-900">311 tons</p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4">
                            <p className="text-sm text-gray-600">Total Investment</p>
                            <p className="mt-1 text-xl font-bold text-gray-900">$42,500</p>
                        </div>
                        <div className="border-l-4 border-orange-500 pl-4">
                            <p className="text-sm text-gray-600">Days Remaining</p>
                            <p className="mt-1 text-xl font-bold text-gray-900">75 days</p>
                        </div>
                    </div>
                </div>
            </div>
        </ContentLayout>
    );
};

export default ReportsRoute;

