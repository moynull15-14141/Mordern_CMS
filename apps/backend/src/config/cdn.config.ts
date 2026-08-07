import { registerAs } from '@nestjs/config';

export const cdnConfig = registerAs('cdn', () => ({
  url: process.env.CDN_URL,
  signedUrlTtlSeconds: process.env.SIGNED_URL_TTL_SECONDS
    ? Number.parseInt(process.env.SIGNED_URL_TTL_SECONDS, 10)
    : 900,
}));
