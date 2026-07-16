import { registerAs } from '@nestjs/config';

/** V1 default is relational/database search; enabled=false means "no external engine wired". */
export const searchConfig = registerAs('search', () => ({
  enabled: process.env.SEARCH_ENABLED === 'true',
  engine: process.env.SEARCH_ENGINE ?? 'database',
  host: process.env.SEARCH_HOST ?? '',
  apiKey: process.env.SEARCH_API_KEY ?? '',
  timeout: parseInt(process.env.SEARCH_TIMEOUT_MS ?? '5000', 10),
}));
