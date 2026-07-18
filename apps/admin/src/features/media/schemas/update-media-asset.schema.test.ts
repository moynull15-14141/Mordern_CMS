import { describe, expect, it } from 'vitest';
import { updateMediaAssetSchema } from './update-media-asset.schema';

describe('updateMediaAssetSchema', () => {
  it('accepts the minimal valid shape', () => {
    expect(updateMediaAssetSchema.safeParse({ status: 'READY' }).success).toBe(true);
  });

  it('rejects an invalid status value', () => {
    expect(updateMediaAssetSchema.safeParse({ status: 'DELETED' }).success).toBe(false);
  });

  it('accepts all 4 real status values', () => {
    for (const status of ['PROCESSING', 'READY', 'FAILED', 'ARCHIVED']) {
      expect(updateMediaAssetSchema.safeParse({ status }).success).toBe(true);
    }
  });
});
