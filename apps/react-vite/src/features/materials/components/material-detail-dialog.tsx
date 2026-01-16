import { Eye, Edit, Package } from 'lucide-react';

import { useMaterial } from '../api/get-material';
import { Material, MaterialType } from '@/types/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type MaterialDetailDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    materialId: string | null;
    onEdit: (material: Material) => void;
};

export const MaterialDetailDialog = ({
    isOpen,
    onClose,
    materialId,
    onEdit,
}: MaterialDetailDialogProps) => {
    const { data: material, isLoading } = useMaterial({
        id: materialId || '',
        queryConfig: {
            enabled: !!materialId && isOpen,
        },
    });

    const handleEdit = () => {
        if (material) {
            onEdit(material);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chi Tiết Vật Liệu</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex h-48 items-center justify-center">
                        <Spinner size="lg" />
                    </div>
                ) : material ? (
                    <div className="space-y-6">
                        {/* Images Section */}
                        {material.imgUrls && material.imgUrls.length > 0 ? (
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-700">Hình Ảnh</h3>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    {material.imgUrls.map((url, index) => (
                                        <div
                                            key={index}
                                            className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-50"
                                        >
                                            <img
                                                src={url}
                                                alt={`${material.name} ${index + 1}`}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-gray-50">
                                <div className="text-center">
                                    <Package className="mx-auto h-8 w-8 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">Không có hình ảnh</p>
                                </div>
                            </div>
                        )}

                        {/* Basic Information */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Tên</label>
                                <p className="mt-1 text-sm text-gray-900">{material.name}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Loại</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {material.type === MaterialType.Fertilizer ? 'Phân Bón' :
                                     material.type === MaterialType.Pesticide ? 'Thuốc Trừ Sâu' :
                                     material.type === MaterialType.Seed ? 'Hạt Giống' : ''}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Số Lượng</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {material.showout || `${material.ammountPerMaterial} ${material.unit}`}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Giá</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {material.pricePerMaterial != null
                                        ? `${material.pricePerMaterial.toLocaleString('vi-VN')} VND`
                                        : 'N/A'}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Nhà Sản Xuất</label>
                                <p className="mt-1 text-sm text-gray-900">{material.manufacturer || 'N/A'}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Trạng Thái</label>
                                <p className="mt-1">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${material.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {material.isActive ? 'Đang Hoạt Động' : 'Không Hoạt Động'}
                                    </span>
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Loại Chia Nhỏ</label>
                                <p className="mt-1">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${material.isPartition
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {material.isPartition ? 'Có Thể Chia Nhỏ' : 'Nguyên Gói'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        {material.description && (
                            <div>
                                <label className="text-sm font-medium text-gray-700">Mô Tả</label>
                                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                    {material.description}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 border-t pt-4">
                            <Button variant="outline" onClick={onClose}>
                                Đóng
                            </Button>
                            <Button onClick={handleEdit} icon={<Edit className="h-4 w-4" />}>
                                Chỉnh Sửa Vật Liệu
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-48 items-center justify-center">
                        <p className="text-gray-500">Không tìm thấy vật liệu</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
