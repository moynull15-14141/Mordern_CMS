import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ThemeSettingsDto } from './theme-settings.dto';

describe('ThemeSettingsDto validation', () => {
  it('accepts an empty object (every field optional)', async () => {
    const dto = plainToInstance(ThemeSettingsDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts a fully-populated valid payload', async () => {
    const dto = plainToInstance(ThemeSettingsDto, {
      logo: 'https://example.com/logo.png',
      favicon: 'https://example.com/favicon.ico',
      primaryColor: '#112233',
      secondaryColor: '#fff',
      typography: { fontFamily: 'Inter' },
      headerLayout: 'centered',
      footerLayout: 'columns',
      containerWidth: '1200px',
      borderRadius: '8px',
      buttonStyle: 'rounded',
      homepageLayout: 'grid',
      blogLayout: 'list',
      customCss: 'body { color: red; }',
      customJs: 'console.log(1)',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts a valid 3-digit hex color', async () => {
    const dto = plainToInstance(ThemeSettingsDto, { primaryColor: '#abc' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts a valid 6-digit hex color', async () => {
    const dto = plainToInstance(ThemeSettingsDto, { primaryColor: '#a1b2c3' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid primaryColor (no #)', async () => {
    const dto = plainToInstance(ThemeSettingsDto, { primaryColor: '112233' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'primaryColor')).toBe(true);
  });

  it('rejects an invalid primaryColor (wrong length)', async () => {
    const dto = plainToInstance(ThemeSettingsDto, { primaryColor: '#12345' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'primaryColor')).toBe(true);
  });

  it('rejects an invalid secondaryColor', async () => {
    const dto = plainToInstance(ThemeSettingsDto, { secondaryColor: 'not-a-color' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'secondaryColor')).toBe(true);
  });

  it('accepts an arbitrary typography object', async () => {
    const dto = plainToInstance(ThemeSettingsDto, {
      typography: { fontFamily: 'Inter', baseSize: 16 },
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a non-string headerLayout', async () => {
    const dto = plainToInstance(ThemeSettingsDto, { headerLayout: 123 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'headerLayout')).toBe(true);
  });
});
