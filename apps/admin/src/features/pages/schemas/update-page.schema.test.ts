import { describe, expect, it } from 'vitest';
import { updatePageSchema } from './update-page.schema';

const validBase = {
  title: 'About Us',
  bodyText: 'Some content',
  status: 'DRAFT' as const,
};

describe('updatePageSchema', () => {
  it('accepts the minimal valid shape', () => {
    expect(updatePageSchema.safeParse(validBase).success).toBe(true);
  });

  it('rejects an empty title', () => {
    expect(updatePageSchema.safeParse({ ...validBase, title: '' }).success).toBe(false);
  });

  it('rejects PUBLISHED as a status value (only via /publish)', () => {
    expect(updatePageSchema.safeParse({ ...validBase, status: 'PUBLISHED' }).success).toBe(false);
  });

  it('rejects SCHEDULED as a status value (no scheduling on Pages)', () => {
    expect(updatePageSchema.safeParse({ ...validBase, status: 'SCHEDULED' }).success).toBe(false);
  });

  it.each(['DRAFT', 'REVIEW', 'ARCHIVED'])('accepts %s as a status value', (status) => {
    expect(updatePageSchema.safeParse({ ...validBase, status }).success).toBe(true);
  });
});
