/** Shape of the frozen `SeoMeta.robots: Json?` column's known keys, matching
 * the real, documented robots meta-tag directive names — not invented. */
export interface RobotsDirectives {
  index?: boolean;
  noindex?: boolean;
  follow?: boolean;
  nofollow?: boolean;
  nosnippet?: boolean;
  'max-image-preview'?: 'none' | 'standard' | 'large';
  'max-video-preview'?: number;
  'max-snippet'?: number;
}
