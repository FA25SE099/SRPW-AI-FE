// import { HttpResponse, http } from 'msw';

// import { env } from '@/config/env';
// import { Material, MaterialType } from '@/types/api';

// import { networkDelay } from '../utils';

// // Mock materials data
// let materials: Material[] = [
//   {
//     materialId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
//     name: 'NPK Fertilizer 16-16-8',
//     type: MaterialType.Fertilizer,
//     ammountPerMaterial: 50,
//     unit: 'kg',
//     showout: '50kg',
//     pricePerMaterial: 450000,
//     description: 'High quality NPK fertilizer for rice cultivation',
//     manufacturer: 'Phân bón Phú Mỹ',
//     isActive: true,
//     priceValidFrom: '2024-01-15T00:00:00Z',
//   },
//   {
//     materialId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
//     name: 'Urea 46%',
//     type: MaterialType.Fertilizer,
//     ammountPerMaterial: 50,
//     unit: 'kg',
//     showout: '50kg',
//     pricePerMaterial: 380000,
//     description: 'Nitrogen fertilizer for rapid growth',
//     manufacturer: 'Phân bón Cà Mau',
//     isActive: true,
//     priceValidFrom: '2024-01-15T00:00:00Z',
//   },
//   {
//     materialId: '8d8c6d89-8f52-4a3e-9e12-3b7c4e8f9a1b',
//     name: 'Super Phosphate',
//     type: MaterialType.Fertilizer,
//     ammountPerMaterial: 40,
//     unit: 'kg',
//     showout: '40kg',
//     pricePerMaterial: 320000,
//     description: 'Phosphorus fertilizer for root development',
//     manufacturer: 'Phân bón Lâm Thao',
//     isActive: true,
//     priceValidFrom: '2024-01-15T00:00:00Z',
//   },
//   {
//     materialId: '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
//     name: 'Pesticide Alpha 20EC',
//     type: MaterialType.Pesticide,
//     ammountPerMaterial: 1,
//     unit: 'liter',
//     showout: '1 liter',
//     pricePerMaterial: 180000,
//     description: 'Broad spectrum insecticide',
//     manufacturer: 'Bayer CropScience',
//     isActive: true,
//     priceValidFrom: '2024-01-15T00:00:00Z',
//   },
//   {
//     materialId: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
//     name: 'Fungicide Beta 50WP',
//     type: MaterialType.Pesticide,
//     ammountPerMaterial: 0.5,
//     unit: 'kg',
//     showout: '0.5kg',
//     pricePerMaterial: 220000,
//     description: 'Fungicide for blast disease control',
//     manufacturer: 'Syngenta',
//     isActive: true,
//     priceValidFrom: '2024-01-15T00:00:00Z',
//   },
// ];

// export const materialsHandlers = [
//   // Get all materials (paginated)
//   http.post(`${env.API_URL}/material/get-all`, async ({ request }) => {
//     await networkDelay();

//     const formData = await request.formData();
//     const currentPage = Number(formData.get('currentPage')) || 1;
//     const pageSize = Number(formData.get('pageSize')) || 20;
//     const typeParam = formData.get('type');
//     const type = typeParam !== null ? Number(typeParam) : undefined;

//     // Filter by type if specified
//     let filteredMaterials = materials;
//     if (type !== undefined) {
//       filteredMaterials = materials.filter((m) => m.type === type);
//     }

//     // Pagination
//     const startIndex = (currentPage - 1) * pageSize;
//     const endIndex = startIndex + pageSize;
//     const paginatedMaterials = filteredMaterials.slice(startIndex, endIndex);

//     const totalCount = filteredMaterials.length;
//     const totalPages = Math.ceil(totalCount / pageSize);

//     return HttpResponse.json({
//       succeeded: true,
//       data: paginatedMaterials,
//       currentPage,
//       totalPages,
//       totalCount,
//       pageSize,
//       hasPreviousPage: currentPage > 1,
//       hasNextPage: currentPage < totalPages,
//       message: 'Successfully retrieved materials',
//       errors: null,
//     });
//   }),

//   // Create material
//   http.post(`${env.API_URL}/material`, async ({ request }) => {
//     await networkDelay();

//     const data = (await request.json()) as any;
//     const newMaterial: Material = {
//       materialId: `new-${Date.now()}`,
//       name: data.name,
//       type: data.type,
//       ammountPerMaterial: data.ammountPerMaterial,
//       unit: data.unit,
//       showout: `${data.ammountPerMaterial}${data.unit}`,
//       pricePerMaterial: data.pricePerMaterial,
//       description: data.description,
//       manufacturer: data.manufacturer,
//       isActive: data.isActive,
//       priceValidFrom: data.priceValidFrom,
//     };

//     materials.push(newMaterial);

//     return HttpResponse.json({
//       succeeded: true,
//       data: newMaterial.materialId,
//       message: 'Material created successfully',
//       errors: null,
//     });
//   }),

//   // Update material
//   http.put(`${env.API_URL}/material/:id`, async ({ params, request }) => {
//     await networkDelay();

//     const { id } = params;
//     const data = (await request.json()) as any;

//     const index = materials.findIndex((m) => m.materialId === id);
//     if (index === -1) {
//       return HttpResponse.json(
//         {
//           succeeded: false,
//           data: null,
//           message: 'Material not found',
//           errors: ['Material does not exist'],
//         },
//         { status: 404 },
//       );
//     }

//     materials[index] = {
//       ...materials[index],
//       name: data.name,
//       type: data.type,
//       ammountPerMaterial: data.ammountPerMaterial,
//       unit: data.unit,
//       showout: `${data.ammountPerMaterial}${data.unit}`,
//       pricePerMaterial: data.pricePerMaterial,
//       description: data.description,
//       manufacturer: data.manufacturer,
//       isActive: data.isActive,
//       priceValidFrom: data.priceValidFrom,
//     };

//     return HttpResponse.json({
//       succeeded: true,
//       data: id,
//       message: 'Material updated successfully',
//       errors: null,
//     });
//   }),

//   // Delete material
//   http.delete(`${env.API_URL}/material/:id`, async ({ params }) => {
//     await networkDelay();

//     const { id } = params;

//     const index = materials.findIndex((m) => m.materialId === id);
//     if (index === -1) {
//       return HttpResponse.json(
//         {
//           succeeded: false,
//           data: null,
//           message: 'Material not found',
//           errors: ['Material does not exist'],
//         },
//         { status: 404 },
//       );
//     }

//     // Soft delete - mark as inactive
//     materials[index].isActive = false;
//     // Or hard delete - remove from array
//     // materials.splice(index, 1);

//     return HttpResponse.json({
//       succeeded: true,
//       data: id,
//       message: 'Material deleted successfully',
//       errors: null,
//     });
//   }),

//   // Download material price list
//   http.post(`${env.API_URL}/material/download-excel`, async () => {
//     await networkDelay();

//     // Mock Excel file download
//     const blob = new Blob(['Mock Excel Content'], {
//       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     });

//     return new HttpResponse(blob, {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//         'Content-Disposition': `attachment; filename="Bảng giá sản phẩm.xlsx"`,
//       },
//     });
//   }),

//   // Download sample template
//   http.get(`${env.API_URL}/material/download-create-sample-excel`, async () => {
//     await networkDelay();

//     const blob = new Blob(['Mock Template Content'], {
//       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     });

//     return new HttpResponse(blob, {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//         'Content-Disposition': 'attachment; filename="Material_Sample_Template.xlsx"',
//       },
//     });
//   }),

//   // Import create materials
//   http.post(`${env.API_URL}/material/import-create-excel`, async ({ request }) => {
//     await networkDelay();

//     const formData = await request.formData();
//     const file = formData.get('excelFile');

//     if (!file) {
//       return HttpResponse.json(
//         {
//           succeeded: false,
//           data: null,
//           message: 'No file provided',
//           errors: ['Excel file is required'],
//         },
//         { status: 400 },
//       );
//     }

//     // Mock: simulate importing 3 materials
//     const newMaterials = [
//       {
//         materialId: `import-${Date.now()}-1`,
//         name: 'Imported Material 1',
//         type: MaterialType.Fertilizer,
//         ammountPerMaterial: 25,
//         unit: 'kg',
//         showout: '25kg',
//         pricePerMaterial: 250000,
//         description: 'Imported from Excel',
//         manufacturer: 'Test Manufacturer',
//         isActive: true,
//         priceValidFrom: new Date().toISOString(),
//       },
//     ];

//     materials.push(...newMaterials);

//     return HttpResponse.json({
//       succeeded: true,
//       data: newMaterials,
//       message: `Successfully imported ${newMaterials.length} materials`,
//       errors: null,
//     });
//   }),

//   // Import update materials
//   http.post(`${env.API_URL}/material/import-update-excel`, async ({ request }) => {
//     await networkDelay();

//     const formData = await request.formData();
//     const file = formData.get('excelFile');

//     if (!file) {
//       return HttpResponse.json(
//         {
//           succeeded: false,
//           data: null,
//           message: 'No file provided',
//           errors: ['Excel file is required'],
//         },
//         { status: 400 },
//       );
//     }

//     // Mock: simulate updating materials
//     return HttpResponse.json({
//       succeeded: true,
//       data: materials.slice(0, 2),
//       message: 'Successfully updated 2 materials',
//       errors: null,
//     });
//   }),
// ];

