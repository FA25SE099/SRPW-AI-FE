import { Calendar, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ContentLayout } from '@/components/layouts';
import { paths } from '@/config/paths';

const PlansRoute = () => {
    const navigate = useNavigate();

    return (
        <ContentLayout title="Kế Hoạch Sản Xuất">
            <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Tất Cả Kế Hoạch Sản Xuất</h2>
                        <button
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                            onClick={() => navigate(paths.app.supervisor.group.getHref())}
                        >
                            <Plus className="h-4 w-4" />
                            Tạo Kế Hoạch Mới
                        </button>
                    </div>

                    {/* Plans List */}
                    <div className="space-y-4">
                        {[
                            {
                                name: 'Winter-Spring 2024',
                                variety: 'OM5451',
                                area: '45.8 ha',
                                startDate: 'Jan 15, 2024',
                                status: 'Approved',
                                progress: 'Day 45/120',
                                statusColor: 'green',
                            },
                            {
                                name: 'Emergency Pest Control',
                                variety: 'N/A',
                                area: '12.3 ha',
                                startDate: 'Mar 1, 2024',
                                status: 'Pending',
                                progress: 'Awaiting approval',
                                statusColor: 'orange',
                            },
                            {
                                name: 'Summer-Autumn 2024 (Draft)',
                                variety: 'IR50404',
                                area: '45.8 ha',
                                startDate: 'May 1, 2024',
                                status: 'Draft',
                                progress: 'Planning phase',
                                statusColor: 'gray',
                            },
                            {
                                name: 'Winter-Spring 2023 (Completed)',
                                variety: 'OM5451',
                                area: '45.8 ha',
                                startDate: 'Jan 10, 2023',
                                status: 'Completed',
                                progress: 'Finished',
                                statusColor: 'blue',
                            },
                        ].map((plan, idx) => (
                            <div
                                key={idx}
                                className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                            >
                                <div className="mb-3 flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                                            <span
                                                className={`rounded px-2 py-0.5 text-xs font-medium ${plan.statusColor === 'green'
                                                        ? 'bg-green-100 text-green-700'
                                                        : plan.statusColor === 'orange'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : plan.statusColor === 'blue'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {plan.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Giống Lúa: {plan.variety} • Diện Tích: {plan.area}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Ngày Bắt Đầu: {plan.startDate}
                                        </p>
                                        <p className="text-xs text-gray-500">{plan.progress}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                                        Xem Chi Tiết
                                    </button>
                                    {plan.status !== 'Completed' && (
                                        <button className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                                            Chỉnh Sửa
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ContentLayout>
    );
};

export default PlansRoute;

