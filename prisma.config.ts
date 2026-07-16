import path from 'node:path';
import { defineConfig } from 'prisma/config';

const nodeEnv = process.env.NODE_ENV ?? 'development';

// Prisma CLI skips its default dotenv auto-loading once a config file is
// present, and our env files live under config/env/ rather than a root
// .env. Mirrors apps/backend/src/config/config.module.ts's resolution so
// `prisma` CLI commands and the NestJS app read the same variables.
try {
  process.loadEnvFile(path.join('config', 'env', `${nodeEnv}.env`));
} catch {
  // Optional: DATABASE_URL may already be exported (CI, Docker, shell session).
}

export default defineConfig({
  schema: path.join('config', 'prisma', 'schema.prisma'),
  migrations: {
    path: path.join('config', 'prisma', 'migrations'),
    seed:
      'ts-node --transpile-only --project config/prisma/tsconfig.seed.json config/prisma/seed.ts',
  },
});
