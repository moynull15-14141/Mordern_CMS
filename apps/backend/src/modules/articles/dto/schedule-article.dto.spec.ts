import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ScheduleArticleDto } from './schedule-article.dto';

describe('ScheduleArticleDto validation', () => {
  it('accepts a valid ISO date-time string', async () => {
    const dto = plainToInstance(ScheduleArticleDto, { scheduledAt: '2099-01-01T00:00:00.000Z' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a non-date string', async () => {
    const dto = plainToInstance(ScheduleArticleDto, { scheduledAt: 'not-a-date' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'scheduledAt')).toBe(true);
  });
});
