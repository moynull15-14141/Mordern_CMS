/** Shape of the frozen `SeoMeta.twitterCard: Json?` column's known keys.
 * Not schema — a documentation/validation aid only. */
export interface TwitterCardMeta {
  title?: string;
  description?: string;
  image?: string;
  card?: string;
  creator?: string;
  site?: string;
}
