import { describe, expect, it } from 'vitest';
import { createMediaAssetSchema } from './create-media-asset.schema';

const valid = {
  type: 'IMAGE' as const,
  storageKey: 'uploads/2026/01/photo.jpg',
  mimeType: 'image/jpeg',
  filesize: '204800',
};

describe('createMediaAssetSchema', () => {
  it('accepts the minimal valid shape', () => {
    expect(createMediaAssetSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an empty storageKey', () => {
    expect(createMediaAssetSchema.safeParse({ ...valid, storageKey: '' }).success).toBe(false);
  });

  it('rejects a storageKey with ".." path traversal', () => {
    expect(createMediaAssetSchema.safeParse({ ...valid, storageKey: '../etc/passwd' }).success).toBe(false);
  });

  it('rejects a storageKey with a leading slash', () => {
    expect(createMediaAssetSchema.safeParse({ ...valid, storageKey: '/etc/passwd' }).success).toBe(false);
  });

  it('rejects a non-numeric filesize', () => {
    expect(createMediaAssetSchema.safeParse({ ...valid, filesize: 'abc' }).success).toBe(false);
  });

  it('rejects a zero filesize', () => {
    expect(createMediaAssetSchema.safeParse({ ...valid, filesize: '0' }).success).toBe(false);
  });

  it('rejects a mimeType inconsistent with the declared type', () => {
    const result = createMediaAssetSchema.safeParse({ ...valid, type: 'VIDEO', mimeType: 'image/jpeg' });
    expect(result.success).toBe(false);
  });

  it('accepts DOCUMENT with any mimeType (no fixed prefix)', () => {
    expect(
      createMediaAssetSchema.safeParse({ ...valid, type: 'DOCUMENT', mimeType: 'application/pdf' }).success,
    ).toBe(true);
  });

  it('rejects a non-UUID folderId', () => {
    expect(createMediaAssetSchema.safeParse({ ...valid, folderId: 'not-a-uuid' }).success).toBe(false);
  });
});
