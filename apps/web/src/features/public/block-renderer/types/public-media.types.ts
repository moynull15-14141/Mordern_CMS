/** Mirrors `PublicMediaResponseDto`
 * (`apps/backend/src/modules/media/dto/public-media-response.dto.ts`). */
export interface PublicMediaUrls {
  original?: string;
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  webp?: string;
  avif?: string;
}

export interface PublicMedia {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';
  urls: PublicMediaUrls;
  altText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  blurPlaceholder: string | null;
  dominantColor: string | null;
}
