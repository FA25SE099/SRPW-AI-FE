import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { networkDelay } from '../utils';

import { authHandlers } from './auth';
import { categoriesHandlers } from './categories';
import { commentsHandlers } from './comments';
import { discussionsHandlers } from './discussions';
import { riceVarietiesHandlers } from './rice-varieties';
import { riceVarietySeasonsHandlers } from './rice-variety-seasons';
import { seasonsHandlers } from './seasons';
import { teamsHandlers } from './teams';
import { usersHandlers } from './users';
import { yearseasonHandlers } from './yearseason';

export const handlers = [
  ...authHandlers,
  ...categoriesHandlers,
  ...commentsHandlers,
  ...discussionsHandlers,
  ...riceVarietiesHandlers,
  ...riceVarietySeasonsHandlers,
  ...seasonsHandlers,
  ...teamsHandlers,
  ...usersHandlers,
  ...yearseasonHandlers,
  http.get(`${env.API_URL}/healthcheck`, async () => {
    await networkDelay();
    return HttpResponse.json({ ok: true });
  }),
];
