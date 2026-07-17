import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ThemePreference } from '../constants/user.constants';
import { NotificationPreferenceDto, UpdatePreferencesDto } from './update-preferences.dto';

describe('NotificationPreferenceDto validation', () => {
  it('accepts an empty payload (all fields optional)', async () => {
    const dto = plainToInstance(NotificationPreferenceDto, {});
    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts valid booleans', async () => {
    const dto = plainToInstance(NotificationPreferenceDto, { email: true, inApp: false });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a non-boolean email flag', async () => {
    const dto = plainToInstance(NotificationPreferenceDto, { email: 'yes' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });
});

describe('UpdatePreferencesDto validation', () => {
  it('accepts an entirely empty payload (PATCH semantics)', async () => {
    const dto = plainToInstance(UpdatePreferencesDto, {});
    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts a valid theme enum value', async () => {
    const dto = plainToInstance(UpdatePreferencesDto, { theme: ThemePreference.DARK });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects an invalid theme value', async () => {
    const dto = plainToInstance(UpdatePreferencesDto, { theme: 'NEON' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'theme')).toBe(true);
  });

  it('accepts object-shaped editorPreference/dashboardPreference/accessibilityPreference', async () => {
    const dto = plainToInstance(UpdatePreferencesDto, {
      editorPreference: { fontSize: 14 },
      dashboardPreference: { widgets: ['a'] },
      accessibilityPreference: { highContrast: true },
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a non-object editorPreference', async () => {
    const dto = plainToInstance(UpdatePreferencesDto, { editorPreference: 'not-an-object' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'editorPreference')).toBe(true);
  });

  it('accepts a nested notificationPreference object', async () => {
    const dto = plainToInstance(UpdatePreferencesDto, {
      notificationPreference: { email: true, inApp: false },
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a non-string language', async () => {
    const dto = plainToInstance(UpdatePreferencesDto, { language: 123 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'language')).toBe(true);
  });
});
