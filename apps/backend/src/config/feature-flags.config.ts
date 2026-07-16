import { registerAs } from '@nestjs/config';

export const featureFlagsConfig = registerAs('features', () => ({
  ai: process.env.FEATURE_AI_ENABLED === 'true',
  comments: process.env.FEATURE_COMMENTS_ENABLED === 'true',
  rss: process.env.FEATURE_RSS_ENABLED === 'true',
  search: process.env.FEATURE_SEARCH_ENABLED === 'true',
  analytics: process.env.FEATURE_ANALYTICS_ENABLED === 'true',
  media: process.env.FEATURE_MEDIA_ENABLED === 'true',
}));
