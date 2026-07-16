export interface FeatureFlags {
  ai: boolean;
  comments: boolean;
  rss: boolean;
  search: boolean;
  analytics: boolean;
  media: boolean;
}

export type FeatureFlagName = keyof FeatureFlags;
