import { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit, Eye, Calendar, Activity, AlertTriangle, AlertTriangleIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useEmergencyProtocols } from '../api/get-emergency-protocols';
import { CreateEmergencyProtocolDialog } from './create-emergency-protocol-dialog';
import { ProtocolsManagementTabs } from './protocols-management-tabs';
import { EmergencyProtocolDetailDialog } from './emergency-protocol-detail-dialog';

type ActiveTab = 'emergency' | 'protocols';

export const EmergencyProtocolsList = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('emergency');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingProtocol, setEditingProtocol] = useState<any>(null);
    const [detailProtocol, setDetailProtocol] = useState<any>(null);

    const pageSize = 10;

    const protocolsQuery = useEmergencyProtocols({
        params: { currentPage, pageSize, searchTerm: searchTerm },
    });

    const protocols = protocolsQuery.data?.data || [];

    return (
        <div>
            <div className="space-y-6">
                <div className="bg-white border-b border-neutral-200 px-6 py-4 shadow-sm mb-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-3 shadow-lg">
                            <AlertTriangleIcon className="size-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900">
                                Trung Tâm Khẩn Cấp
                            </h1>
                            <p className="text-sm text-neutral-600 mt-1">
                                Quản lý quy trình khẩn cấp và thủ tục phản ứng cho các vấn đề cây trồng quan trọng
                            </p>
                        </div>
                    </div>
                </div>
                {/* Main Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('emergency')}
                            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'emergency'
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Quy Trình Khẩn Cấp
                        </button>
                        <button
                            onClick={() => setActiveTab('protocols')}
                            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'protocols'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Quản Lý Quy Trình
                        </button>
                    </nav>
                </div>

                {/* Emergency Protocols Tab */}
                {activeTab === 'emergency' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm quy trình khẩn cấp..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button onClick={() => setIsCreateOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tạo Quy Trình Khẩn Cấp
                            </Button>
                        </div>

                        {protocolsQuery.isLoading ? (
                            <div className="p-8 text-center">
                                <Spinner size="lg" />
                            </div>
                        ) : protocols.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 bg-white rounded-lg border">
                                Không tìm thấy quy trình khẩn cấp
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {protocols.map((protocol: any) => (
                                    <div
                                        key={protocol.id}
                                        className="bg-white rounded-lg border hover:shadow-lg transition-shadow p-6 space-y-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                                    {protocol.planName}
                                                </h3>
                                                <p className="text-sm text-gray-500">{protocol.categoryName}</p>
                                            </div>
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${protocol.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {protocol.isActive ? 'Đang Hoạt Động' : 'Không Hoạt Động'}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {protocol.description || 'Không có mô tả'}
                                        </p>

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>{protocol.totalDurationDays} ngày</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Activity className="h-4 w-4" />
                                                <span>{protocol.totalStages || 0} giai đoạn</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => setDetailProtocol(protocol)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Chi Tiết
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => {
                                                    setEditingProtocol(protocol);
                                                    setIsCreateOpen(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Chỉnh Sửa
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {protocolsQuery.data && protocolsQuery.data.totalPages > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Trang {currentPage} / {protocolsQuery.data.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!protocolsQuery.data.hasPrevious}
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                    >
                                        Trước
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!protocolsQuery.data.hasNext}
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                    >
                                        Sau
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Protocols Management Tab (Pest & Weather) */}
                {activeTab === 'protocols' && <ProtocolsManagementTabs />}
            </div>

            {/* Create/Edit Dialog */}
            <CreateEmergencyProtocolDialog
                isOpen={isCreateOpen}
                onClose={() => {
                    setIsCreateOpen(false);
                    setEditingProtocol(null);
                }}
                protocol={editingProtocol}
            />

            {/* Detail Dialog */}
            <EmergencyProtocolDetailDialog
                isOpen={!!detailProtocol}
                onClose={() => setDetailProtocol(null)}
                protocolId={detailProtocol?.id}
            />
        </div>
    );
};