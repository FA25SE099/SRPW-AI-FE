import { BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react';

import { ContentLayout } from '@/components/layouts';
import { Tabs } from '@/components/ui/tabs';

const ReportsRoute = () => {
    const tabs = [
        {
            id: 'approval-performance',
            label: 'Approval Performance',
            icon: BarChart3,
        },
        { id: 'response-times', label: 'Response Times', icon: LineChart },
        { id: 'group-analytics', label: 'Group Analytics', icon: PieChart },
        { id: 'trends', label: 'Trends', icon: TrendingUp },
    ];

    return (
        <ContentLayout title="Reports & Analytics">
            <Tabs tabs={tabs}>
                {(activeTab) => (
                    <>
                        {activeTab === 'approval-performance' && (
                            <div className="space-y-6">
                                <div className="rounded-lg border border-gray-200 bg-white p-6">
                                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                                        Approval Performance
                                    </h3>
                                    <div className="flex h-64 items-center justify-center rounded bg-gray-50">
                                        <p className="text-gray-400">Approval Performance Chart</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                                        <p className="text-sm text-gray-600">Avg Approval Time</p>
                                        <p className="mt-2 text-3xl font-bold text-gray-900">
                                            2.4h
                                        </p>
                                        <p className="mt-1 text-xs text-green-600">
                                            ↓ 15% from last month
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                                        <p className="text-sm text-gray-600">Total Approvals</p>
                                        <p className="mt-2 text-3xl font-bold text-gray-900">142</p>
                                        <p className="mt-1 text-xs text-green-600">
                                            ↑ 23% from last month
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                                        <p className="text-sm text-gray-600">Rejection Rate</p>
                                        <p className="mt-2 text-3xl font-bold text-gray-900">
                                            3.2%
                                        </p>
                                        <p className="mt-1 text-xs text-red-600">
                                            ↑ 0.5% from last month
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'response-times' && (
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h3 className="mb-4 text-lg font-bold text-gray-900">
                                    Emergency Response Times
                                </h3>
                                <div className="flex h-64 items-center justify-center rounded bg-gray-50">
                                    <p className="text-gray-400">Response Times Chart</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'group-analytics' && (
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h3 className="mb-4 text-lg font-bold text-gray-900">
                                    Group Performance Analytics
                                </h3>
                                <div className="flex h-64 items-center justify-center rounded bg-gray-50">
                                    <p className="text-gray-400">Group Analytics Chart</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'trends' && (
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h3 className="mb-4 text-lg font-bold text-gray-900">
                                    Performance Trends
                                </h3>
                                <div className="flex h-64 items-center justify-center rounded bg-gray-50">
                                    <p className="text-gray-400">Trends Chart</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Tabs>
        </ContentLayout>
    );
};

export default ReportsRoute;
