import { FileText, Download, Edit } from 'lucide-react';
import { ContentLayout } from '@/components/layouts';

const StandardsRoute = () => {
    const standardPlans = [
        {
            id: 1,
            name: 'Tiêu chuẩn canh tác lúa - Thời gian ngắn',
            crop: 'Lúa (Thời gian ngắn)',
            version: '2.1',
            lastUpdated: '2024-01-15',
            status: 'active',
            farms: 28,
            duration: '90-110 ngày',
        },
        {
            id: 2,
            name: 'Tiêu chuẩn canh tác lúa - Thời gian trung bình',
            crop: 'Lúa (Thời gian trung bình)',
            version: '2.1',
            lastUpdated: '2024-01-15',
            status: 'active',
            farms: 17,
            duration: '120-140 ngày',
        },
    ];

    return (
        <ContentLayout title="Kế hoạch tiêu chuẩn">
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">
                            Quản lý kế hoạch canh tác lúa tiêu chuẩn và giao thức
                        </p>
                    </div>
                    <button className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
                        Tạo tiêu chuẩn mới
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
                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                    {plan.status === 'active' ? 'đang hoạt động' : plan.status}
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                                <div>
                                    <p className="text-xs text-gray-500">Phiên bản</p>
                                    <p className="mt-1 font-medium">{plan.version}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Thời gian</p>
                                    <p className="mt-1 font-medium">{plan.duration}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Trang trại hoạt động</p>
                                    <p className="mt-1 font-medium">{plan.farms}</p>
                                </div>
                            </div>

                            <div className="mt-2">
                                <p className="text-xs text-gray-500">Cập nhật lần cuối</p>
                                <p className="mt-1 text-sm">{plan.lastUpdated}</p>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    <Download className="h-4 w-4" />
                                    Tải xuống
                                </button>
                                <button className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    <Edit className="h-4 w-4" />
                                    Chỉnh sửa
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