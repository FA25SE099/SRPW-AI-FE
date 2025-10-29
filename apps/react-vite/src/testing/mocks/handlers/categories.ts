import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { networkDelay } from '../utils';

// Mock rice variety categories
const categories = [
  {
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    categoryName: 'Giống ngắn ngày',
    description: 'Short-day rice varieties (< 100 days)',
    maxGrowthDays: 99,
    isActive: true,
  },
  {
    id: '9f7a5c8d-6b3e-4d2f-8a1c-5e7b9d4f2a6c',
    categoryName: 'Giống dài ngày',
    description: 'Long-day rice varieties (≥ 100 days)',
    maxGrowthDays: 150,
    isActive: true,
  },
];

export const categoriesHandlers = [
  // Get all categories
  http.get(`${env.API_URL}/ricevariety/categories`, async () => {
    await networkDelay();
    return HttpResponse.json({
      succeeded: true,
      data: categories,
      message: 'Successfully retrieved categories',
      errors: null,
    });
  }),
];

