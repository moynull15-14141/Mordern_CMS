import sharp from 'sharp';
import { ImageProcessingService } from './image-processing.service';

/**
 * The one place in this codebase's backend test suite where a genuinely
 * real (non-mocked, offline, no-network) test is both possible and
 * valuable — this exercises the actual `sharp` pipeline end to end. The
 * fixture is generated in-memory via `sharp` itself (a small synthetic
 * gradient PNG) rather than checked into git, so the test stays
 * self-contained and deterministic without a binary fixture file.
 */
describe('ImageProcessingService', () => {
  let service: ImageProcessingService;
  let fixtureBuffer: Buffer;

  beforeAll(async () => {
    service = new ImageProcessingService();
    fixtureBuffer = await sharp({
      create: { width: 800, height: 600, channels: 3, background: { r: 200, g: 60, b: 40 } },
    })
      .png()
      .toBuffer();
  });

  it('reports the real source dimensions', async () => {
    const result = await service.process(fixtureBuffer);
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
  });

  it('produces a resized, never-upscaled variant for every configured size', async () => {
    const result = await service.process(fixtureBuffer);
    const byName = new Map(result.variants.map((variant) => [variant.name, variant]));

    const thumbnail = byName.get('thumbnail')!;
    expect(thumbnail.width).toBeLessThanOrEqual(200);
    expect(thumbnail.height).toBeLessThanOrEqual(200);
    expect(thumbnail.buffer.length).toBeGreaterThan(0);

    const large = byName.get('large')!;
    expect(large.width).toBeLessThanOrEqual(1920);
    // Source is smaller than the 1920 cap, so `large` must equal the source size (never upscaled).
    expect(large.width).toBe(800);
    expect(large.height).toBe(600);
  });

  it('produces a WebP and an AVIF variant of the large size', async () => {
    const result = await service.process(fixtureBuffer);
    const webp = result.variants.find((variant) => variant.name === 'webp')!;
    const avif = result.variants.find((variant) => variant.name === 'avif')!;
    expect(webp.format).toBe('webp');
    expect(avif.format).toBe('avif');
    expect(webp.buffer.length).toBeGreaterThan(0);
    expect(avif.buffer.length).toBeGreaterThan(0);
  });

  it('produces a small inline base64 blur placeholder', async () => {
    const result = await service.process(fixtureBuffer);
    expect(result.blurPlaceholder).toMatch(/^data:image\/jpeg;base64,/);
    expect(result.blurPlaceholder.length).toBeLessThan(5000);
  });

  it('derives a dominant color close to the fixture background', async () => {
    const result = await service.process(fixtureBuffer);
    expect(result.dominantColor).toMatch(/^#[0-9a-f]{6}$/);
    // Fixture background is rgb(200, 60, 40) ≈ #c83c28 — allow resize/color-management drift.
    const r = Number.parseInt(result.dominantColor.slice(1, 3), 16);
    const g = Number.parseInt(result.dominantColor.slice(3, 5), 16);
    const b = Number.parseInt(result.dominantColor.slice(5, 7), 16);
    expect(r).toBeGreaterThan(g);
    expect(r).toBeGreaterThan(b);
  });

  it('returns undefined exif for a synthetic image with no EXIF data', async () => {
    const result = await service.process(fixtureBuffer);
    expect(result.exif).toBeUndefined();
  });
});
