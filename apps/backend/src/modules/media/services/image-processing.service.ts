import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

export type ImageVariantName = 'thumbnail' | 'small' | 'medium' | 'large' | 'webp' | 'avif';

export interface ImageVariantOutput {
  name: ImageVariantName;
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
}

export interface ProcessImageResult {
  width: number;
  height: number;
  orientation?: number;
  variants: ImageVariantOutput[];
  blurPlaceholder: string;
  dominantColor: string;
  exif?: Record<string, unknown>;
}

interface VariantSize {
  name: 'thumbnail' | 'small' | 'medium' | 'large';
  maxDimension: number;
}

const VARIANT_SIZES: VariantSize[] = [
  { name: 'thumbnail', maxDimension: 200 },
  { name: 'small', maxDimension: 480 },
  { name: 'medium', maxDimension: 960 },
  { name: 'large', maxDimension: 1920 },
];
const LARGE_VARIANT = VARIANT_SIZES[VARIANT_SIZES.length - 1];

const BLUR_PLACEHOLDER_DIMENSION = 24;
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 80;
const AVIF_QUALITY = 60;

/** Curated EXIF tag allow-list — GPS fields are deliberately never included (privacy). */
const CURATED_EXIF_TAGS = [
  'Make',
  'Model',
  'DateTimeOriginal',
  'ExposureTime',
  'FNumber',
  'ISO',
  'FocalLength',
  'Orientation',
  'Software',
] as const;

/**
 * Real `sharp`-backed image pipeline (Milestone 5) — thumbnail/small/medium/
 * large resizes (never upscaled), WebP+AVIF of the large variant, a blur
 * placeholder, dominant color, and a curated EXIF subset (GPS stripped).
 * Returns in-memory buffers only; `MediaProcessorService` uploads them via
 * `StorageProvider` and persists the resulting keys — this service never
 * touches storage or the database.
 */
@Injectable()
export class ImageProcessingService {
  async process(buffer: Buffer): Promise<ProcessImageResult> {
    const metadata = await sharp(buffer, { failOn: 'none' }).metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;

    const variants: ImageVariantOutput[] = [];
    for (const size of VARIANT_SIZES) {
      const { data, info } = await sharp(buffer, { failOn: 'none' })
        .rotate()
        .resize({
          width: size.maxDimension,
          height: size.maxDimension,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: JPEG_QUALITY })
        .toBuffer({ resolveWithObject: true });
      variants.push({
        name: size.name,
        buffer: data,
        format: 'jpeg',
        width: info.width,
        height: info.height,
      });
    }

    const largePipeline = () =>
      sharp(buffer, { failOn: 'none' }).rotate().resize({
        width: LARGE_VARIANT.maxDimension,
        height: LARGE_VARIANT.maxDimension,
        fit: 'inside',
        withoutEnlargement: true,
      });

    const webp = await largePipeline()
      .webp({ quality: WEBP_QUALITY })
      .toBuffer({ resolveWithObject: true });
    variants.push({
      name: 'webp',
      buffer: webp.data,
      format: 'webp',
      width: webp.info.width,
      height: webp.info.height,
    });

    const avif = await largePipeline()
      .avif({ quality: AVIF_QUALITY })
      .toBuffer({ resolveWithObject: true });
    variants.push({
      name: 'avif',
      buffer: avif.data,
      format: 'avif',
      width: avif.info.width,
      height: avif.info.height,
    });

    const blurBuffer = await sharp(buffer, { failOn: 'none' })
      .rotate()
      .resize(BLUR_PLACEHOLDER_DIMENSION, BLUR_PLACEHOLDER_DIMENSION, { fit: 'inside' })
      .blur()
      .jpeg({ quality: 40 })
      .toBuffer();
    const blurPlaceholder = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;

    const dominantColor = await this.extractDominantColor(buffer);
    const exif = await this.extractExif(buffer);

    return {
      width,
      height,
      orientation: metadata.orientation,
      variants,
      blurPlaceholder,
      dominantColor,
      exif,
    };
  }

  private async extractDominantColor(buffer: Buffer): Promise<string> {
    const { data } = await sharp(buffer, { failOn: 'none' })
      .resize(1, 1, { fit: 'cover' })
      .toColourspace('srgb')
      .raw()
      .toBuffer({ resolveWithObject: true });
    const [r, g, b] = data;
    const toHex = (channel: number) => channel.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  private async extractExif(buffer: Buffer): Promise<Record<string, unknown> | undefined> {
    try {
      const exifr = await import('exifr');
      const raw = (await exifr.parse(buffer, { pick: [...CURATED_EXIF_TAGS] })) as
        Record<string, unknown> | undefined;
      if (!raw) return undefined;

      const curated: Record<string, unknown> = {};
      for (const tag of CURATED_EXIF_TAGS) {
        if (raw[tag] !== undefined) {
          curated[tag] = raw[tag];
        }
      }
      return Object.keys(curated).length > 0 ? curated : undefined;
    } catch {
      return undefined;
    }
  }
}
