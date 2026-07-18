import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { extractFileMetadata } from './extract-file-metadata';

const originalImage = global.Image;
const originalCreateElement = document.createElement.bind(document);

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:mock');
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  global.Image = originalImage;
  document.createElement = originalCreateElement;
  vi.restoreAllMocks();
});

function makeFile(name: string, type: string, size: number): File {
  const file = new File([new Uint8Array(size)], name, { type });
  return file;
}

describe('extractFileMetadata', () => {
  it('extracts filename/mimeType/filesize/type for a document (no dimension probing)', async () => {
    const file = makeFile('report.pdf', 'application/pdf', 12345);
    const result = await extractFileMetadata(file);
    expect(result).toEqual({
      filename: 'report.pdf',
      mimeType: 'application/pdf',
      filesize: '12345',
      type: 'DOCUMENT',
    });
  });

  it('extracts width/height for an image via a local Image element', async () => {
    class FakeImage {
      naturalWidth = 800;
      naturalHeight = 600;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    // @ts-expect-error test stub
    global.Image = FakeImage;

    const file = makeFile('photo.jpg', 'image/jpeg', 2048);
    const result = await extractFileMetadata(file);
    expect(result).toMatchObject({ type: 'IMAGE', width: 800, height: 600 });
  });

  it('falls back to base metadata if image dimension reading fails', async () => {
    class FailingImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }
    // @ts-expect-error test stub
    global.Image = FailingImage;

    const file = makeFile('broken.jpg', 'image/jpeg', 10);
    const result = await extractFileMetadata(file);
    expect(result).toEqual({ filename: 'broken.jpg', mimeType: 'image/jpeg', filesize: '10', type: 'IMAGE' });
  });

  it('extracts duration/dimensions for a video via a hidden <video> element', async () => {
    document.createElement = ((tag: string) => {
      if (tag === 'video') {
        const el = {
          preload: '',
          duration: 12.4,
          videoWidth: 1920,
          videoHeight: 1080,
          onloadedmetadata: null as (() => void) | null,
          onerror: null as (() => void) | null,
          set src(_value: string) {
            queueMicrotask(() => el.onloadedmetadata?.());
          },
        };
        Object.setPrototypeOf(el, HTMLVideoElement.prototype);
        return el as unknown as HTMLVideoElement;
      }
      return originalCreateElement(tag);
    }) as typeof document.createElement;

    const file = makeFile('clip.mp4', 'video/mp4', 4096);
    const result = await extractFileMetadata(file);
    expect(result).toMatchObject({ type: 'VIDEO', duration: 12, width: 1920, height: 1080 });
  });

  it('extracts duration for audio via a hidden <audio> element', async () => {
    document.createElement = ((tag: string) => {
      if (tag === 'audio') {
        const el = {
          preload: '',
          duration: 30.0,
          onloadedmetadata: null as (() => void) | null,
          onerror: null as (() => void) | null,
          set src(_value: string) {
            queueMicrotask(() => el.onloadedmetadata?.());
          },
        };
        return el as unknown as HTMLAudioElement;
      }
      return originalCreateElement(tag);
    }) as typeof document.createElement;

    const file = makeFile('song.mp3', 'audio/mpeg', 8192);
    const result = await extractFileMetadata(file);
    expect(result).toMatchObject({ type: 'AUDIO', duration: 30 });
  });
});
