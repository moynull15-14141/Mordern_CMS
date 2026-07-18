import { describe, expect, it } from 'vitest';
import { renameMediaAssetSchema } from './rename-media-asset.schema';

describe('renameMediaAssetSchema', () => {
  it('accepts a valid filename', () => {
    expect(renameMediaAssetSchema.safeParse({ filename: 'photo.jpg' }).success).toBe(true);
  });

  it('rejects an empty filename', () => {
    expect(renameMediaAssetSchema.safeParse({ filename: '' }).success).toBe(false);
  });

  it('rejects a filename over 300 characters', () => {
    expect(renameMediaAssetSchema.safeParse({ filename: 'a'.repeat(301) }).success).toBe(false);
  });
});
