import { FileText, ImageIcon, Music, Video } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { MediaStatus, MediaType } from '../types/media';

export interface MediaThumbnailProps {
  type: MediaType;
  className?: string;
  /** When `status === 'READY'` and a thumbnail URL is present (Milestone 5
   * real upload pipeline), renders a real `<img>` instead of the icon
   * fallback. Omit either to keep the icon-only placeholder — e.g. for a
   * not-yet-registered local file in the upload queue, or a
   * `PROCESSING`/`FAILED` asset. */
  status?: MediaStatus;
  thumbnailUrl?: string;
  blurPlaceholder?: string | null;
  alt?: string;
}

const ICON_BY_TYPE: Record<MediaType, typeof ImageIcon> = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  AUDIO: Music,
  DOCUMENT: FileText,
};

export function MediaThumbnail({
  type,
  className,
  status,
  thumbnailUrl,
  blurPlaceholder,
  alt,
}: MediaThumbnailProps) {
  if (status === 'READY' && thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- no next/image remote-domain config exists in this app yet
      <img
        src={thumbnailUrl}
        alt={alt ?? ''}
        className={cn('rounded-md border border-border object-cover', className)}
        style={
          blurPlaceholder
            ? { backgroundImage: `url(${blurPlaceholder})`, backgroundSize: 'cover' }
            : undefined
        }
        loading="lazy"
      />
    );
  }

  const Icon = ICON_BY_TYPE[type];
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-md border border-border bg-muted',
        className
      )}
      role="img"
      aria-label={`${type.toLowerCase()} file`}
    >
      <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}
