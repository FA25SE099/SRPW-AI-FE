import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { networkDelay } from '../utils';

import { authHandlers } from './auth';
import { categoriesHandlers } from './categories';
import { commentsHandlers } from './comments';
import { discussionsHandlers } from './discussions';
import { materialsHandlers } from './materials';
import { riceVarietiesHandlers } from './rice-varieties';
import { riceVarietySeasonsHandlers } from './rice-variety-seasons';
import { seasonsHandlers } from './seasons';
import { teamsHandlers } from './teams';
import { usersHandlers } from './users';

export const handlers = [
  ...authHandlers,
  ...categoriesHandlers,
  ...commentsHandlers,
  ...discussionsHandlers,
  ...materialsHandlers,
  ...riceVarietiesHandlers,
  ...riceVarietySeasonsHandlers,
  ...seasonsHandlers,
  ...teamsHandlers,
  ...usersHandlers,
  http.get(`${env.API_URL}/healthcheck`, async () => {
    await networkDelay();
    return HttpResponse.json({ ok: true });
  }),
];
