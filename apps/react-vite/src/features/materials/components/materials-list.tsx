import { useState } from 'react';
import { Download, Upload, FileDown, Package, Grid3x3, Table, Plus, Edit, Trash2, Eye } from 'lucide-react';

import { useMaterials } from '../api/get-materials';
import { useDownloadMaterialPriceList } from '../api/download-material-price-list';
import { useDownloadMaterialTemplate } from '../api/download-material-template';
import { ImportMaterialsDialog } from './import-materials-dialog';
import { CreateMaterialDialog } from './create-material-dialog';
import { EditMaterialDialog } from './edit-material-dialog';
import { DeleteMaterialDialog } from './delete-material-dialog';
import { MaterialDetailDialog } from './material-detail-dialog';
import { Material, MaterialType } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

type ViewMode = 'grid' | 'table';

export const MaterialsList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedType, setSelectedType] = useState<MaterialType>(MaterialType.Pesticide);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isPartitionFilter, setIsPartitionFilter] = useState<boolean | undefined>(undefined);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [priceDateTime, setPriceDateTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [tempDateTime, setTempDateTime] = useState<string>(new Date().toISOString().slice(0, 16));

  const { data: materials, isLoading } = useMaterials({
    params: {
      currentPage,
      pageSize,
      type: selectedType,
      dateTime: priceDateTime,
      isPartition: isPartitionFilter,
    },
  });

  const downloadPriceListMutation = useDownloadMaterialPriceList();
  const downloadTemplateMutation = useDownloadMaterialTemplate();

  const handleDownloadPriceList = () => {
    const today = new Date().toISOString();
    downloadPriceListMutation.mutate(today);
  };

  const handleDownloadTemplate = () => {
    downloadTemplateMutation.mutate(undefined);
  };


  const handleView = (material: Material) => {
    setSelectedMaterialId(material.materialId);
    setDetailDialogOpen(true);
  };

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setEditDialogOpen(true);
  };

  const handleEditFromDetail = (material: Material) => {
    setSelectedMaterial(material);
    setEditDialogOpen(true);
  };

  const handleDelete = (material: Material) => {
    setSelectedMaterial(material);
    setDeleteDialogOpen(true);
  };

  const handleApplyDateTime = () => {
    setPriceDateTime(tempDateTime);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={selectedType === MaterialType.Fertilizer ? 'default' : 'outline'}
            onClick={() => {
              setCurrentPage(1);
              setSelectedType(MaterialType.Fertilizer);
            }}
          >
            Phân Bón
          </Button>
          <Button
            variant={selectedType === MaterialType.Pesticide ? 'default' : 'outline'}
            onClick={() => {
              setCurrentPage(1);
              setSelectedType(MaterialType.Pesticide);
            }}
          >
            Thuốc Trừ Sâu
          </Button>
          <Button
            variant={selectedType === MaterialType.Seed ? 'default' : 'outline'}
            onClick={() => {
              setCurrentPage(1);
              setSelectedType(MaterialType.Seed);
            }}
          >
            Hạt Giống
          </Button>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Giá tại:</label>
            <input
              type="datetime-local"
              value={tempDateTime}
              onChange={(e) => setTempDateTime(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleApplyDateTime}
            >
              Áp Dụng
            </Button>
          </div>          <Button
            variant="default"
            onClick={() => setCreateDialogOpen(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Tạo Vật Liệu
          </Button>

          {/* View Toggle */}
          <div className="flex gap-1 rounded-md border p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              icon={<Grid3x3 className="h-4 w-4" />}
            >
              Lưới
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              icon={<Table className="h-4 w-4" />}
            >
              Bảng
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={handleDownloadPriceList}
            isLoading={downloadPriceListMutation.isPending}
            icon={<Download className="h-4 w-4" />}
          >
            Bảng Giá
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            isLoading={downloadTemplateMutation.isPending}
            icon={<FileDown className="h-4 w-4" />}
          >
            Mẫu
          </Button>
          {/* Import Excel */}
          <Button
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
            icon={<Upload className="h-4 w-4" />}
          >
            Nhập Excel
          </Button>
        </div>

        {/* Materials Display - Grid or Table */}
        {materials && materials.data.length > 0 ? (
          viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {materials.data.map((material) => (
                <div
                  key={material.materialId}
                  className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {material.imgUrls && material.imgUrls.length > 0 ? (
                        <img
                          src={material.imgUrls[0]}
                          alt={material.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="rounded-lg bg-blue-100 p-2">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{material.name}</h3>
                        <p className="text-sm text-gray-500">
                          {material.type === MaterialType.Fertilizer
                            ? 'Phân Bón'
                            : material.type === MaterialType.Pesticide
                              ? 'Thuốc Trừ Sâu'
                              : material.type === MaterialType.Seed
                                ? 'Hạt Giống'
                                : ''}
                          {material.isPartition && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                              Có Thể Chia Nhỏ
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${material.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                      {material.isActive ? 'Đang Hoạt Động' : 'Không Hoạt Động'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Số Lượng:</span>
                      <span className="font-medium">{material.showout || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Giá:</span>
                      <span className="font-medium">
                        {material.pricePerMaterial != null
                          ? `${material.pricePerMaterial.toLocaleString('vi-VN')} VND`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Nhà Sản Xuất:</span>
                      <span className="truncate font-medium pl-2 text-right" title={material.manufacturer || 'N/A'}>
                        {material.manufacturer || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {material.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                      {material.description}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2 border-t pt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(material)}
                      icon={<Eye className="h-3 w-3" />}
                      className="flex-1"
                    >
                      Xem
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(material)}
                      icon={<Edit className="h-3 w-3" />}
                      className="flex-1"
                    >
                      Chỉnh Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(material)}
                      icon={<Trash2 className="h-3 w-3" />}
                      className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="rounded-lg border bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loại
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số Lượng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nhà Sản Xuất
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng Thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chia Nhỏ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao Tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {materials.data.map((material) => (
                      <tr key={material.materialId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {material.imgUrls && material.imgUrls.length > 0 ? (
                              <img
                                src={material.imgUrls[0]}
                                alt={material.name}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="rounded-lg bg-blue-100 p-2">
                                <Package className="h-4 w-4 text-blue-600" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {material.name}
                              </div>
                              {material.description && (
                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                  {material.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {material.type === MaterialType.Fertilizer
                            ? 'Phân Bón'
                            : material.type === MaterialType.Pesticide
                              ? 'Thuốc Trừ Sâu'
                              : material.type === MaterialType.Seed
                                ? 'Hạt Giống'
                                : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {material.showout || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {material.pricePerMaterial != null
                            ? `${material.pricePerMaterial.toLocaleString('vi-VN')} VND`
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {material.manufacturer || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${material.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                              }`}
                          >
                            {material.isActive ? 'Đang Hoạt Động' : 'Không Hoạt Động'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${material.isPartition
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                              }`}
                          >
                            {material.isPartition ? 'Có Thể Chia Nhỏ' : 'Nguyên Gói'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleView(material)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Xem Chi Tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(material)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Chỉnh Sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(material)}
                              className="text-red-600 hover:text-red-900"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
            <p className="text-gray-500">Không tìm thấy vật liệu</p>
          </div>
        )}

        {/* Pagination */}
        {materials && materials.totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-gray-700">
              Hiển thị {(currentPage - 1) * pageSize + 1} đến{' '}
              {Math.min(currentPage * pageSize, materials.totalCount)} trong{' '}
              {materials.totalCount} kết quả
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!materials.hasPrevious}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                disabled={!materials.hasNext}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      <ImportMaterialsDialog
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
      />

      <CreateMaterialDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      <EditMaterialDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        material={selectedMaterial}
      />

      <DeleteMaterialDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        material={selectedMaterial}
      />

      <MaterialDetailDialog
        isOpen={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        materialId={selectedMaterialId}
        onEdit={handleEditFromDetail}
      />
    </>
  );
};