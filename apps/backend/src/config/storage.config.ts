import { registerAs } from '@nestjs/config';

export const storageConfig = registerAs('storage', () => ({
  provider: process.env.STORAGE_PROVIDER,
  endpoint: process.env.STORAGE_ENDPOINT,
  region: process.env.STORAGE_REGION,
  bucket: process.env.STORAGE_BUCKET,
  accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
  secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
}));
