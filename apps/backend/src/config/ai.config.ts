import { registerAs } from '@nestjs/config';

/** AI stays optional: enabled defaults to false. No provider SDK is wired here. */
export const aiConfig = registerAs('ai', () => ({
  enabled: process.env.AI_ENABLED === 'true',
  provider: process.env.AI_PROVIDER ?? 'openai',
  model: process.env.AI_MODEL ?? '',
  apiKey: process.env.AI_API_KEY ?? '',
  baseUrl: process.env.AI_BASE_URL ?? '',
  timeout: parseInt(process.env.AI_TIMEOUT_MS ?? '30000', 10),
  temperature: parseFloat(process.env.AI_TEMPERATURE ?? '0.7'),
  maxTokens: parseInt(process.env.AI_MAX_TOKENS ?? '2048', 10),
  retry: parseInt(process.env.AI_RETRY_ATTEMPTS ?? '2', 10),
}));
