import { http, HttpResponse } from 'msw';
import { RiceVarietySeasonAssociation } from '@/types/api';

// Mock rice variety season associations data
const mockAssociations: RiceVarietySeasonAssociation[] = [
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
];

export const riceVarietySeasonsHandlers = [
  // Get all rice variety season associations
  http.get('/api/ricevarietyseason', ({ request }) => {
    const url = new URL(request.url);
    const riceVarietyId = url.searchParams.get('riceVarietyId');
    const seasonId = url.searchParams.get('seasonId');
    const isRecommended = url.searchParams.get('isRecommended');
    
    let filteredAssociations = mockAssociations;
    
    if (riceVarietyId) {
      filteredAssociations = filteredAssociations.filter(assoc => assoc.riceVarietyId === riceVarietyId);
    }
    
    if (seasonId) {
      filteredAssociations = filteredAssociations.filter(assoc => assoc.seasonId === seasonId);
    }
    
    if (isRecommended !== null) {
      const recommendedFilter = isRecommended === 'true';
      filteredAssociations = filteredAssociations.filter(assoc => assoc.isRecommended === recommendedFilter);
    }
    
    return HttpResponse.json({
      succeeded: true,
      data: filteredAssociations,
      message: 'Successfully retrieved rice variety season associations.',
      errors: null,
    });
  }),

  // Create rice variety season association
  http.post('/api/ricevarietyseason', async ({ request }) => {
    const data = await request.json() as any;
    const newAssociation: RiceVarietySeasonAssociation = {
      id: `association-${Date.now()}`,
      riceVarietyId: data.riceVarietyId,
      riceVarietyName: 'Rice Variety Name', // This would come from the rice variety data
      seasonId: data.seasonId,
      seasonName: 'Season Name', // This would come from the season data
      growthDurationDays: data.growthDurationDays,
      expectedYieldPerHectare: data.expectedYieldPerHectare,
      optimalPlantingStart: data.optimalPlantingStart,
      optimalPlantingEnd: data.optimalPlantingEnd,
      riskLevel: data.riskLevel,
      seasonalNotes: data.seasonalNotes,
      isRecommended: data.isRecommended,
      createdAt: new Date().toISOString(),
    };
    
    mockAssociations.push(newAssociation);
    
    return HttpResponse.json({
      succeeded: true,
      data: newAssociation.id,
      message: 'Rice variety season association created successfully',
      errors: null,
    });
  }),

  // Update rice variety season association
  http.put('/api/ricevarietyseason/:id', async ({ request, params }) => {
    const data = await request.json() as any;
    const associationId = params.id as string;
    const associationIndex = mockAssociations.findIndex(a => a.id === associationId);
    
    if (associationIndex === -1) {
      return HttpResponse.json({
        succeeded: false,
        data: null,
        message: 'Rice variety season association not found',
        errors: ['Association not found'],
      }, { status: 404 });
    }
    
    mockAssociations[associationIndex] = {
      ...mockAssociations[associationIndex],
      growthDurationDays: data.growthDurationDays,
      expectedYieldPerHectare: data.expectedYieldPerHectare,
      optimalPlantingStart: data.optimalPlantingStart,
      optimalPlantingEnd: data.optimalPlantingEnd,
      riskLevel: data.riskLevel,
      seasonalNotes: data.seasonalNotes,
      isRecommended: data.isRecommended,
    };
    
    return HttpResponse.json({
      succeeded: true,
      data: associationId,
      message: 'Rice variety season association updated successfully',
      errors: null,
    });
  }),

  // Delete rice variety season association
  http.delete('/api/ricevarietyseason/:id', ({ params }) => {
    const associationId = params.id as string;
    const associationIndex = mockAssociations.findIndex(a => a.id === associationId);
    
    if (associationIndex === -1) {
      return HttpResponse.json({
        succeeded: false,
        data: null,
        message: 'Rice variety season association not found',
        errors: ['Association not found'],
      }, { status: 404 });
    }
    
    mockAssociations.splice(associationIndex, 1);
    
    return HttpResponse.json({
      succeeded: true,
      data: associationId,
      message: 'Rice variety season association deleted successfully',
      errors: null,
    });
  }),
];
