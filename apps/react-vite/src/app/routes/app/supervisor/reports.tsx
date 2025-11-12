import { Download, TrendingUp, BarChart3 } from 'lucide-react';

import { ContentLayout } from '@/components/layouts';

const ReportsRoute = () => {
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
                    <div className="space-y-3">
                        {[
                            { 
                                name: 'Monthly Production Summary', 
                                date: 'March 2024', 
                                type: 'PDF',
                                description: 'Overview of all production activities'
                            },
                            { 
                                name: 'Farmer Performance Analysis', 
                                date: 'Q1 2024', 
                                type: 'Excel',
                                description: 'Individual farmer metrics and comparisons'
                            },
                            { 
                                name: 'Material Usage Report', 
                                date: 'Feb 2024', 
                                type: 'PDF',
                                description: 'Fertilizer and pesticide consumption'
                            },
                            { 
                                name: 'Yield Comparison Report', 
                                date: '2023-2024', 
                                type: 'PDF',
                                description: 'Year-over-year yield analysis'
                            },
                            { 
                                name: 'Financial Summary', 
                                date: 'Q1 2024', 
                                type: 'Excel',
                                description: 'Costs, revenues, and profitability'
                            },
                        ].map((report, idx) => (
                            <div
                                key={idx}
                                className="flex items-start justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900">{report.name}</p>
                                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                            {report.type}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">{report.description}</p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Period: {report.date}
                                    </p>
                                </div>
                                <button className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                                    <Download className="h-4 w-4" />
                                    Download
                                </button>
                            </div>
                        ))}
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

