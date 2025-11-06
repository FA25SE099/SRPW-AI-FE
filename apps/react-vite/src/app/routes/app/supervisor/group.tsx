import { Users, MapPin, Activity } from 'lucide-react';

import { ContentLayout } from '@/components/layouts';

const GroupManagementRoute = () => {
    return (
        <ContentLayout title="Group Management">
            <div className="space-y-6">
                {/* Group Info Card */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Group Information</h2>
                        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                            Edit Group
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Group ID</p>
                            <p className="mt-1 text-base text-gray-900">G-034</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Status</p>
                            <p className="mt-1">
                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                    Active
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Region</p>
                            <p className="mt-1 text-base text-gray-900">An Giang Province</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Cluster</p>
                            <p className="mt-1 text-base text-gray-900">Mekong Delta Cluster 1</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Total Farmers</p>
                            <p className="mt-1 text-base text-gray-900">24 members</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Total Area</p>
                            <p className="mt-1 text-base text-gray-900">45.8 hectares</p>
                        </div>
                    </div>
                </div>

                {/* Farmers List */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Farmers in Group</h2>
                        <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                            Add Farmer
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                                        Farmer Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                                        Plots
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                                        Total Area
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {[
                                    { name: 'Nguyen Van A', plots: 2, area: '3.2 ha', status: 'Active' },
                                    { name: 'Tran Thi B', plots: 1, area: '1.8 ha', status: 'Active' },
                                    { name: 'Le Van C', plots: 3, area: '4.5 ha', status: 'Active' },
                                    { name: 'Pham Thi D', plots: 1, area: '2.1 ha', status: 'Active' },
                                    { name: 'Hoang Van E', plots: 2, area: '2.8 ha', status: 'Active' },
                                ].map((farmer, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {farmer.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {farmer.plots}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {farmer.area}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                                {farmer.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button className="text-sm text-blue-600 hover:text-blue-700">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Plots Overview */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-gray-900">Plots Overview</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 bg-blue-50 p-4">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-blue-600" />
                                <p className="text-sm font-medium text-blue-900">Total Plots</p>
                            </div>
                            <p className="mt-2 text-2xl font-bold text-blue-600">32</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-green-50 p-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-green-600" />
                                <p className="text-sm font-medium text-green-900">Active Plots</p>
                            </div>
                            <p className="mt-2 text-2xl font-bold text-green-600">28</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-gray-600" />
                                <p className="text-sm font-medium text-gray-700">Idle Plots</p>
                            </div>
                            <p className="mt-2 text-2xl font-bold text-gray-600">4</p>
                        </div>
                    </div>
                </div>
            </div>
        </ContentLayout>
    );
};

export default GroupManagementRoute;

