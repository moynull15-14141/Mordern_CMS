import { FileText, ImageIcon, Music, Video } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { MediaType } from '../types/media';

export interface MediaThumbnailProps {
  type: MediaType;
  className?: string;
}

const ICON_BY_TYPE: Record<MediaType, typeof ImageIcon> = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  AUDIO: Music,
  DOCUMENT: FileText,
};

/**
 * Icon-only placeholder — `MediaResponseDto` has no resolvable public URL
 * field (only an internal `storageKey`), and no download/streaming
 * endpoint exists on the backend at all ("NO upload engine" — see
 * `create-media-asset.dto.ts`), so no real thumbnail/preview is possible
 * anywhere in this feature. Same limitation already documented for
 * `UserAvatar` (Frontend Milestone 3) and the Articles featured-image
 * picker (Frontend Milestone 5).
 */
export function MediaThumbnail({ type, className }: MediaThumbnailProps) {
  const Icon = ICON_BY_TYPE[type];
  return (
    <div
      className={cn('flex items-center justify-center rounded-md border border-border bg-muted', className)}
      role="img"
      aria-label={`${type.toLowerCase()} file`}
    >
      <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}
