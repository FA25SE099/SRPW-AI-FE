import { useState } from 'react';
import { Download, Upload, FileDown, Package, Grid3x3, Table, Plus, Edit, Trash2 } from 'lucide-react';

import { useMaterials } from '../api/get-materials';
import { useDownloadMaterialPriceList } from '../api/download-material-price-list';
import { useDownloadMaterialTemplate } from '../api/download-material-template';
import { ImportMaterialsDialog } from './import-materials-dialog';
import { CreateMaterialDialog } from './create-material-dialog';
import { EditMaterialDialog } from './edit-material-dialog';
import { DeleteMaterialDialog } from './delete-material-dialog';
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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const materialsQuery = useMaterials({
    params: { currentPage, pageSize, type: selectedType },
  });

  const downloadPriceListMutation = useDownloadMaterialPriceList();
  const downloadTemplateMutation = useDownloadMaterialTemplate();

  const handleDownloadPriceList = () => {
    const today = new Date().toISOString();
    downloadPriceListMutation.mutate(today);
  };

  const handleDownloadTemplate = () => {
    downloadTemplateMutation.mutate();
  };


  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setEditDialogOpen(true);
  };

  const handleDelete = (material: Material) => {
    setSelectedMaterial(material);
    setDeleteDialogOpen(true);
  };

  if (materialsQuery.isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const materials = materialsQuery.data;

  return (
    <>
      <div className="space-y-4">
        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant={selectedType === MaterialType.Fertilizer ? 'default' : 'outline'}
              onClick={() => {
                setCurrentPage(1);
                setSelectedType(MaterialType.Fertilizer);
              }}
            >
              Fertilizers
            </Button>
            <Button
              variant={selectedType === MaterialType.Pesticide ? 'default' : 'outline'}
              onClick={() => {
                setCurrentPage(1);
                setSelectedType(MaterialType.Pesticide);
              }}
            >
              Pesticides
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              onClick={() => setCreateDialogOpen(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              Create Material
            </Button>
            {/* View Toggle */}
            <div className="flex gap-1 rounded-md border p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                icon={<Grid3x3 className="h-4 w-4" />}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                icon={<Table className="h-4 w-4" />}
              >
                Table
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadPriceList}
              isLoading={downloadPriceListMutation.isPending}
              icon={<Download className="h-4 w-4" />}
            >
              Price List
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              isLoading={downloadTemplateMutation.isPending}
              icon={<FileDown className="h-4 w-4" />}
            >
              Template
            </Button>
            {/* Import Excel */}
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(true)}
              icon={<Upload className="h-4 w-4" />}
            >
              Import Excel
            </Button>
          </div>
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
                      <div className="rounded-lg bg-blue-100 p-2">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{material.name}</h3>
                        <p className="text-sm text-gray-500">
                          {material.type === MaterialType.Fertilizer
                            ? 'Fertilizer'
                            : 'Pesticide'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${material.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                      {material.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="font-medium">{material.showout || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-medium">
                        {material.pricePerMaterial != null
                          ? `${material.pricePerMaterial.toLocaleString('vi-VN')} VND`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Manufacturer:</span>
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
                      onClick={() => handleEdit(material)}
                      icon={<Edit className="h-3 w-3" />}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(material)}
                      icon={<Trash2 className="h-3 w-3" />}
                      className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Delete
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
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Manufacturer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {materials.data.map((material) => (
                      <tr key={material.materialId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                              <Package className="h-4 w-4 text-blue-600" />
                            </div>
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
                            ? 'Fertilizer'
                            : 'Pesticide'}
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
                            {material.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(material)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(material)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
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
            <p className="text-gray-500">No materials found</p>
          </div>
        )}

        {/* Pagination */}
        {materials && materials.totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, materials.totalCount)} of{' '}
              {materials.totalCount} results
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!materials.hasPrevious}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!materials.hasNext}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
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
    </>
  );
};