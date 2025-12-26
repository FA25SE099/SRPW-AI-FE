import { http, HttpResponse } from 'msw';

// Helper function to calculate season dates
const calculateSeasonDates = (seasonStartDate: string, seasonEndDate: string, year: number) => {
  // Parse MM/DD format
  const [startMonth, startDay] = seasonStartDate.split('/').map(Number);
  const [endMonth, endDay] = seasonEndDate.split('/').map(Number);

  // Check if season crosses years (e.g., Dec to Apr)
  const crossesYears = endMonth < startMonth;

  // Calculate start date
  const startDate = new Date(year, startMonth - 1, startDay);

  // Calculate end date (next year if crossing years)
  const endYear = crossesYears ? year + 1 : year;
  const endDate = new Date(endYear, endMonth - 1, endDay);

  // Calculate duration
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Helper to format date as MM/DD/YYYY (matching backend format)
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Suggested farmer selection window (30 days before start to 7 days before start)
  const suggestedFarmerSelectionWindowStart = new Date(startDate);
  suggestedFarmerSelectionWindowStart.setDate(suggestedFarmerSelectionWindowStart.getDate() - 30);
  const suggestedFarmerSelectionWindowEnd = new Date(startDate);
  suggestedFarmerSelectionWindowEnd.setDate(suggestedFarmerSelectionWindowEnd.getDate() - 7);

  // Suggested planning window (6 days before start to 3 days before start)
  const suggestedPlanningWindowStart = new Date(startDate);
  suggestedPlanningWindowStart.setDate(suggestedPlanningWindowStart.getDate() - 6);
  const suggestedPlanningWindowEnd = new Date(startDate);
  suggestedPlanningWindowEnd.setDate(suggestedPlanningWindowEnd.getDate() - 3);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    crossesYears,
    durationDays,
    suggestedFarmerSelectionWindowStart: formatDate(suggestedFarmerSelectionWindowStart),
    suggestedFarmerSelectionWindowEnd: formatDate(suggestedFarmerSelectionWindowEnd),
    suggestedPlanningWindowStart: formatDate(suggestedPlanningWindowStart),
    suggestedPlanningWindowEnd: formatDate(suggestedPlanningWindowEnd),
  };
};

// Valid season status values
type SeasonStatus = 'Draft' | 'PlanningOpen' | 'Active' | 'Completed';

const validStatuses: SeasonStatus[] = ['Draft', 'PlanningOpen', 'Active', 'Completed'];

export const yearseasonHandlers = [
  // Calculate season dates
  http.get('/api/yearseason/calculate-dates', ({ request }) => {
    const url = new URL(request.url);
    const seasonId = url.searchParams.get('seasonId');
    const yearStr = url.searchParams.get('year');

    if (!seasonId) {
      return HttpResponse.json({
        succeeded: false,
        data: null,
        message: null,
        errors: ['SeasonId is required'],
      }, { status: 400 });
    }

    if (!yearStr) {
      return HttpResponse.json({
        succeeded: false,
        data: null,
        message: null,
        errors: ['Year is required'],
      }, { status: 400 });
    }

    const year = parseInt(yearStr);
    if (year < 2000 || year > 2100) {
      return HttpResponse.json({
        succeeded: false,
        data: null,
        message: null,
        errors: ['Year must be between 2000 and 2100'],
      }, { status: 400 });
    }

    // Mock seasons data (matching seasons.ts)
    const mockSeasons = {
      'season-1': {
        id: 'season-1',
        name: 'Đông Xuân',
        startDate: '12/01',
        endDate: '04/30',
      },
      'season-2': {
        id: 'season-2',
        name: 'Hè Thu',
        startDate: '05/01',
        endDate: '10/31',
      },
      'season-3': {
        id: 'season-3',
        name: 'Đông Xuân',
        startDate: '12/01',
        endDate: '04/30',
      },
    };

    const season = mockSeasons[seasonId as keyof typeof mockSeasons];

    // If season not found in mock data, return a default Đông Xuân season
    const seasonData = season || {
      id: seasonId,
      name: 'Đông Xuân',
      startDate: '12/01',
      endDate: '04/30',
    };

    const calculatedDates = calculateSeasonDates(seasonData.startDate, seasonData.endDate, year);

    return HttpResponse.json({
      succeeded: true,
      data: {
        seasonId: seasonData.id,
        seasonName: seasonData.name,
        year: year,
        seasonStartDateFormat: seasonData.startDate,
        seasonEndDateFormat: seasonData.endDate,
        ...calculatedDates,
      },
      message: 'Season dates calculated successfully',
      errors: [],
    });
  }),

  // Update year season status
  http.patch('/api/yearseason/:id/status', async ({ params, request }) => {
    const { id } = params;

    if (!id) {
      return HttpResponse.json({
        succeeded: false,
        data: null,
        message: null,
        errors: ['Year season ID is required'],
      }, { status: 400 });
    }

    try {
      const body = await request.json() as { id?: string; status: string };

      // Backend validation: Route ID must match command ID
      if (body.id && body.id !== id) {
        return HttpResponse.json({
          succeeded: false,
          data: null,
          message: 'Route ID does not match command ID',
          errors: ['Route ID does not match command ID'],
        }, { status: 400 });
      }

      if (!body.status) {
        return HttpResponse.json({
          succeeded: false,
          data: null,
          message: null,
          errors: ['Status is required'],
        }, { status: 400 });
      }

      if (!validStatuses.includes(body.status as SeasonStatus)) {
        return HttpResponse.json({
          succeeded: false,
          data: null,
          message: null,
          errors: [`Invalid status. Valid values are: ${validStatuses.join(', ')}`],
        }, { status: 400 });
      }

      // Simulate successful status update
      return HttpResponse.json({
        succeeded: true,
        data: {
          id: id,
          status: body.status,
          updatedAt: new Date().toISOString(),
        },
        message: `Year season status updated to ${body.status} successfully`,
        errors: [],
      });
    } catch (error) {
      return HttpResponse.json({
        succeeded: false,
        data: null,
        message: null,
        errors: ['Invalid request body'],
      }, { status: 400 });
    }
  }),
];

