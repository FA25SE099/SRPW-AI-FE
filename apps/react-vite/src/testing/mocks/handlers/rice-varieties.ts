import { http, HttpResponse } from 'msw';
import { RiceVarietyWithSeasons } from '@/types/api';

// Mock rice varieties data with associated seasons
const mockRiceVarieties: RiceVarietyWithSeasons[] = [
  {
    id: 'rice-1',
    varietyName: 'ST25',
    categoryId: 'category-1',
    categoryName: 'Giống ngắn ngày',
    baseGrowthDurationDays: 95,
    baseYieldPerHectare: 6.5,
    description: 'Giống lúa chất lượng cao, được xếp hạng ngon nhất thế giới',
    characteristics: 'Hạt dài, thơm, chống chịu hạn tốt',
    isActive: true,
    associatedSeasons: [
      {
        id: 'association-1',
        riceVarietyId: 'rice-1',
        riceVarietyName: 'ST25',
        seasonId: 'season-1',
        seasonName: 'Đông Xuân 2024',
        growthDurationDays: 95,
        expectedYieldPerHectare: 6.5,
        optimalPlantingStart: '12/01',
        optimalPlantingEnd: '01/15',
        riskLevel: 0,
        seasonalNotes: 'Best performance in winter-spring season with proper irrigation',
        isRecommended: true,
        createdAt: '2024-01-15T00:00:00Z',
      },
      {
        id: 'association-2',
        riceVarietyId: 'rice-1',
        riceVarietyName: 'ST25',
        seasonId: 'season-2',
        seasonName: 'Hè Thu 2024',
        growthDurationDays: 90,
        expectedYieldPerHectare: 5.8,
        optimalPlantingStart: '05/01',
        optimalPlantingEnd: '06/15',
        riskLevel: 1,
        seasonalNotes: 'Good performance but requires careful water management',
        isRecommended: false,
        createdAt: '2024-01-15T00:00:00Z',
      },
    ],
  },
  {
    id: 'rice-2',
    varietyName: 'OM5451',
    categoryId: 'category-2',
    categoryName: 'Giống dài ngày',
    baseGrowthDurationDays: 120,
    baseYieldPerHectare: 7.2,
    description: 'Giống lúa năng suất cao',
    characteristics: 'Thân to, chống chịu sâu bệnh tốt',
    isActive: true,
    associatedSeasons: [
      {
        id: 'association-3',
        riceVarietyId: 'rice-2',
        riceVarietyName: 'OM5451',
        seasonId: 'season-1',
        seasonName: 'Đông Xuân 2024',
        growthDurationDays: 120,
        expectedYieldPerHectare: 7.2,
        optimalPlantingStart: '11/15',
        optimalPlantingEnd: '12/30',
        riskLevel: 0,
        seasonalNotes: 'Excellent for winter-spring cultivation',
        isRecommended: true,
        createdAt: '2024-01-15T00:00:00Z',
      },
    ],
  },
  {
    id: 'rice-3',
    varietyName: 'IR64',
    categoryId: 'category-1',
    categoryName: 'Giống ngắn ngày',
    baseGrowthDurationDays: 100,
    baseYieldPerHectare: 6.0,
    description: 'Giống lúa phổ biến, dễ trồng',
    characteristics: 'Thích ứng rộng, chống chịu tốt',
    isActive: true,
    associatedSeasons: [],
  },
];

export const riceVarietiesHandlers = [
  // Get all rice varieties
  http.get('/api/ricevariety', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const isActive = url.searchParams.get('isActive');
    const categoryId = url.searchParams.get('categoryId');
    
    let filteredVarieties = mockRiceVarieties;
    
    if (search) {
      filteredVarieties = filteredVarieties.filter(variety => 
        variety.varietyName.toLowerCase().includes(search.toLowerCase()) ||
        variety.characteristics?.toLowerCase().includes(search.toLowerCase()) ||
        variety.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (isActive !== null) {
      const activeFilter = isActive === 'true';
      filteredVarieties = filteredVarieties.filter(variety => variety.isActive === activeFilter);
    }
    
    if (categoryId) {
      filteredVarieties = filteredVarieties.filter(variety => variety.categoryId === categoryId);
    }
    
    return HttpResponse.json({
      succeeded: true,
      data: filteredVarieties,
      message: 'Successfully retrieved all rice varieties.',
      errors: null,
    });
  }),

  // Create rice variety
  http.post('/api/ricevariety/create', async ({ request }) => {
    const data = await request.json() as any;
    const newVariety: RiceVarietyWithSeasons = {
      id: `rice-${Date.now()}`,
      varietyName: data.varietyName,
      categoryId: data.categoryId,
      categoryName: data.categoryId === 'category-1' ? 'Giống ngắn ngày' : 'Giống dài ngày',
      baseGrowthDurationDays: data.baseGrowthDurationDays,
      baseYieldPerHectare: data.baseYieldPerHectare,
      description: data.description,
      characteristics: data.characteristics,
      isActive: data.isActive,
      associatedSeasons: [],
    };
    
    mockRiceVarieties.push(newVariety);
    
    return HttpResponse.json({
      succeeded: true,
      data: newVariety.id,
      message: 'Rice variety created successfully',
      errors: null,
    });
  }),

  // Update rice variety
  http.put('/api/ricevariety/:id', async ({ request, params }) => {
    const data = await request.json() as any;
    const varietyId = params.id as string;
    const varietyIndex = mockRiceVarieties.findIndex(v => v.id === varietyId);
    
    if (varietyIndex === -1) {
      return HttpResponse.json({
        succeeded: false,
        data: null,
        message: 'Rice variety not found',
        errors: ['Rice variety not found'],
      }, { status: 404 });
    }
    
    mockRiceVarieties[varietyIndex] = {
      ...mockRiceVarieties[varietyIndex],
      varietyName: data.varietyName,
      categoryId: data.categoryId,
      categoryName: data.categoryId === 'category-1' ? 'Giống ngắn ngày' : 'Giống dài ngày',
      baseGrowthDurationDays: data.baseGrowthDurationDays,
      baseYieldPerHectare: data.baseYieldPerHectare,
      description: data.description,
      characteristics: data.characteristics,
      isActive: data.isActive,
    };
    
    return HttpResponse.json({
      succeeded: true,
      data: varietyId,
      message: 'Rice variety updated successfully',
      errors: null,
    });
  }),

  // Delete rice variety
  http.delete('/api/ricevariety/:id', ({ params }) => {
    const varietyId = params.id as string;
    const varietyIndex = mockRiceVarieties.findIndex(v => v.id === varietyId);
    
    if (varietyIndex === -1) {
      return HttpResponse.json({
        succeeded: false,
        data: null,
        message: 'Rice variety not found',
        errors: ['Rice variety not found'],
      }, { status: 404 });
    }
    
    // Soft delete - set isActive to false
    mockRiceVarieties[varietyIndex].isActive = false;
    
    return HttpResponse.json({
      succeeded: true,
      data: varietyId,
      message: 'Rice variety deleted successfully',
      errors: null,
    });
  }),

  // Download rice varieties
  http.post('/api/ricevariety/download-excel', async ({ request }) => {
    const data = await request.json() as any;
    // Mock Excel download - in real implementation, this would return a file
    return HttpResponse.json({
      succeeded: true,
      data: 'Excel file generated successfully',
      message: 'Rice varieties exported to Excel',
      errors: null,
    });
  }),

  // Download rice variety template
  http.get('/api/ricevariety/download-sample-excel', () => {
    // Mock Excel template download
    return HttpResponse.json({
      succeeded: true,
      data: 'Template file generated successfully',
      message: 'Rice variety template downloaded',
      errors: null,
    });
  }),
];
