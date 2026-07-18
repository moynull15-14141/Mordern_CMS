import { inferMediaTypeFromMimeType } from '../constants/media.constants';
import type { MediaType } from '../types/media';

export interface ExtractedFileMetadata {
  filename: string;
  mimeType: string;
  filesize: string;
  type: MediaType;
  width?: number;
  height?: number;
  duration?: number;
}

/**
 * Real, browser-only metadata extraction from a locally-picked `File` —
 * genuinely useful (pre-fills the registration form) and honest about what
 * it is: nothing here transfers the file anywhere. `width`/`height` come
 * from decoding the image locally (`Image` element); `duration` (and
 * `width`/`height` for video) from a hidden `<video>`/`<audio>` element's
 * `loadedmetadata` event. Both use a local `URL.createObjectURL` that the
 * caller must revoke.
 */
export async function extractFileMetadata(file: File): Promise<ExtractedFileMetadata> {
  const type = inferMediaTypeFromMimeType(file.type);
  const base: ExtractedFileMetadata = {
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    filesize: String(file.size),
    type,
  };

  if (type === 'IMAGE') {
    const dimensions = await readImageDimensions(file).catch(() => null);
    return dimensions ? { ...base, ...dimensions } : base;
  }

  if (type === 'VIDEO' || type === 'AUDIO') {
    const media = await readAvMetadata(file, type).catch(() => null);
    return media ? { ...base, ...media } : base;
  }

  return base;
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image dimensions.'));
    };
    image.src = url;
  });
}

function readAvMetadata(
  file: File,
  type: 'VIDEO' | 'AUDIO',
): Promise<{ duration: number; width?: number; height?: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const element = document.createElement(type === 'VIDEO' ? 'video' : 'audio');
    element.preload = 'metadata';
    element.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const duration = Math.round(element.duration);
      if (type === 'VIDEO' && element instanceof HTMLVideoElement) {
        resolve({ duration, width: element.videoWidth, height: element.videoHeight });
      } else {
        resolve({ duration });
      }
    };
    element.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read media duration.'));
    };
    element.src = url;
  });
}
