import { http, HttpResponse } from 'msw';
import { Season } from '@/types/api';

// Mock seasons data
const mockSeasons: Season[] = [
  {
    id: 'season-1',
    seasonName: 'Đông Xuân 2024',
    startDate: '11/01',
    endDate: '04/30',
    seasonType: 'Winter-Spring',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    // ✨ NEW: Farmer selection fields
    riceVarietyId: null,
    allowFarmerSelection: true,
    farmerSelectionWindowStart: '2024-10-01T00:00:00Z',
    farmerSelectionWindowEnd: '2024-10-31T00:00:00Z',
  },
  {
    id: 'season-2',
    seasonName: 'Hè Thu 2024',
    startDate: '05/01',
    endDate: '10/31',
    seasonType: 'Summer-Autumn',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    // Traditional mode - variety assigned by expert
    riceVarietyId: 'variety-1',
    allowFarmerSelection: false,
    farmerSelectionWindowStart: null,
    farmerSelectionWindowEnd: null,
  },
  {
    id: 'season-3',
    seasonName: 'Đông Xuân 2023',
    startDate: '11/01',
    endDate: '04/30',
    seasonType: 'Winter-Spring',
    isActive: false,
    createdAt: '2023-01-15T00:00:00Z',
    riceVarietyId: 'variety-2',
    allowFarmerSelection: false,
    farmerSelectionWindowStart: null,
    farmerSelectionWindowEnd: null,
  },
];

export const seasonsHandlers = [
  // Get all seasons
  http.get('/api/season', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const isActive = url.searchParams.get('isActive');
    
    let filteredSeasons = mockSeasons;
    
    if (search) {
      filteredSeasons = filteredSeasons.filter(season => 
        season.seasonName.toLowerCase().includes(search.toLowerCase()) ||
        season.seasonType.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (isActive !== null) {
      const activeFilter = isActive === 'true';
      filteredSeasons = filteredSeasons.filter(season => season.isActive === activeFilter);
    }
    
    return HttpResponse.json({
      succeeded: true,
      data: filteredSeasons,
      message: 'Successfully retrieved all seasons.',
      errors: null,
    });
  }),

  // Create season
  http.post('/api/season', async ({ request }) => {
    const data = await request.json() as any;
    const newSeason: Season = {
      id: `season-${Date.now()}`,
      seasonName: data.seasonName,
      startDate: data.startDate,
      endDate: data.endDate,
      seasonType: data.seasonType,
      isActive: data.isActive,
      createdAt: new Date().toISOString(),
      // ✨ NEW: Farmer selection fields
      riceVarietyId: data.riceVarietyId || null,
      allowFarmerSelection: data.allowFarmerSelection || false,
      farmerSelectionWindowStart: data.farmerSelectionWindowStart || null,
      farmerSelectionWindowEnd: data.farmerSelectionWindowEnd || null,
    };
    
    mockSeasons.push(newSeason);
    
    return HttpResponse.json({
      succeeded: true,
      data: newSeason.id,
      message: 'Season created successfully',
      errors: null,
    });
  }),

  // Update season
  http.put('/api/season/:id', async ({ request, params }) => {
    const data = await request.json() as any;
    const seasonId = params.id as string;
    const seasonIndex = mockSeasons.findIndex(s => s.id === seasonId);
    
    if (seasonIndex === -1) {
      return HttpResponse.json({
        succeeded: false,
        data: null,
        message: 'Season not found',
        errors: ['Season not found'],
      }, { status: 404 });
    }
    
    mockSeasons[seasonIndex] = {
      ...mockSeasons[seasonIndex],
      seasonName: data.seasonName,
      startDate: data.startDate,
      endDate: data.endDate,
      seasonType: data.seasonType,
      isActive: data.isActive,
      // ✨ NEW: Update farmer selection fields
      riceVarietyId: data.riceVarietyId !== undefined ? data.riceVarietyId : mockSeasons[seasonIndex].riceVarietyId,
      allowFarmerSelection: data.allowFarmerSelection !== undefined ? data.allowFarmerSelection : mockSeasons[seasonIndex].allowFarmerSelection,
      farmerSelectionWindowStart: data.farmerSelectionWindowStart !== undefined ? data.farmerSelectionWindowStart : mockSeasons[seasonIndex].farmerSelectionWindowStart,
      farmerSelectionWindowEnd: data.farmerSelectionWindowEnd !== undefined ? data.farmerSelectionWindowEnd : mockSeasons[seasonIndex].farmerSelectionWindowEnd,
    };
    
    return HttpResponse.json({
      succeeded: true,
      data: seasonId,
      message: 'Season updated successfully',
      errors: null,
    });
  }),

  // Delete season
  http.delete('/api/season/:id', ({ params }) => {
    const seasonId = params.id as string;
    const seasonIndex = mockSeasons.findIndex(s => s.id === seasonId);
    
    if (seasonIndex === -1) {
      return HttpResponse.json({
        succeeded: false,
        data: null,
        message: 'Season not found',
        errors: ['Season not found'],
      }, { status: 404 });
    }
    
    // Soft delete - set isActive to false
    mockSeasons[seasonIndex].isActive = false;
    
    return HttpResponse.json({
      succeeded: true,
      data: seasonId,
      message: 'Season deleted successfully',
      errors: null,
    });
  }),
];
