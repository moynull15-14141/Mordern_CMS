import { describe, expect, it } from 'vitest';
import { scheduleArticleSchema } from './schedule-article.schema';

describe('scheduleArticleSchema', () => {
  it('accepts a future date-time', () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    expect(scheduleArticleSchema.safeParse({ scheduledAt: future }).success).toBe(true);
  });

  it('rejects a past date-time', () => {
    const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(scheduleArticleSchema.safeParse({ scheduledAt: past }).success).toBe(false);
  });

  it('rejects an empty value', () => {
    expect(scheduleArticleSchema.safeParse({ scheduledAt: '' }).success).toBe(false);
  });
});
