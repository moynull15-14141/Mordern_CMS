import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DesignTokensDto } from './design-tokens.dto';
import { ThemeSettingsDto } from './theme-settings.dto';

describe('DesignTokensDto validation', () => {
  it('accepts an empty object (every field optional)', async () => {
    const dto = plainToInstance(DesignTokensDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts a fully-populated valid payload across every group', async () => {
    const dto = plainToInstance(DesignTokensDto, {
      version: 1,
      preset: 'modern',
      colors: {
        brand: { primary: '#111827', secondary: '#6b7280', accent: '#f59e0b' },
        background: {
          page: '#ffffff',
          surface: '#f9fafb',
          surfaceElevated: '#fff',
          section: '#f3f4f6',
          inverse: '#111827',
        },
        text: {
          primary: '#111827',
          secondary: '#374151',
          muted: '#6b7280',
          inverse: '#ffffff',
          link: '#2563eb',
        },
        border: { default: '#e5e7eb', strong: '#9ca3af', focus: '#2563eb' },
        status: { success: '#16a34a', warning: '#d97706', error: '#dc2626', info: '#2563eb' },
      },
      typography: {
        fontFamilies: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif',
          ui: 'Inter, sans-serif',
          mono: 'monospace',
        },
        styles: {
          h1: {
            fontSize: '2.5rem',
            fontWeight: '700',
            lineHeight: '1.2',
            letterSpacing: '-0.02em',
            textTransform: 'none',
          },
          body: { fontSize: '1rem', fontWeight: '400', lineHeight: '1.6' },
          button: { fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' },
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        xxl: '3rem',
        xxxl: '4rem',
        xxxxl: '6rem',
      },
      container: {
        maxWidth: '1200px',
        wideWidth: '1440px',
        fullWidth: '100%',
        paddingX: '1.5rem',
        sectionSpacing: '4rem',
      },
      buttons: {
        radius: '0.5rem',
        height: '2.5rem',
        paddingX: '1.25rem',
        shadow: 'none',
        variants: {
          primary: { background: '#111827', text: '#ffffff', hoverBackground: '#1f2937' },
          outline: { background: '#ffffff', text: '#111827', border: '#111827' },
        },
      },
      cards: {
        background: '#ffffff',
        border: '#e5e7eb',
        radius: '0.75rem',
        shadow: 'sm',
        padding: '1.5rem',
      },
      forms: {
        inputHeight: '2.5rem',
        inputRadius: '0.375rem',
        inputBorder: '#d1d5db',
        focusColor: '#2563eb',
        errorColor: '#dc2626',
      },
      background: { type: 'solid', value: '#ffffff' },
      header: {
        sticky: true,
        height: '4rem',
        background: '#ffffff',
        showCta: true,
        ctaLabel: 'Get Started',
        ctaHref: '/contact',
      },
      footer: {
        background: '#111827',
        textColor: '#ffffff',
        copyrightText: '© 2026',
        socialLinks: [{ platform: 'twitter', href: 'https://twitter.com/x' }],
      },
      responsive: {
        tablet: { containerPaddingX: '1rem' },
        mobile: { containerPaddingX: '1rem', typographyScale: '0.9' },
      },
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid brand primary color', async () => {
    const dto = plainToInstance(DesignTokensDto, { colors: { brand: { primary: 'not-a-color' } } });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects an invalid background type', async () => {
    const dto = plainToInstance(DesignTokensDto, { background: { type: 'video' } });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'background')).toBe(true);
  });

  it('rejects an invalid typography textTransform value', async () => {
    const dto = plainToInstance(DesignTokensDto, {
      typography: { styles: { h1: { textTransform: 'sparkle' } } },
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects a status color that is not a valid hex', async () => {
    const dto = plainToInstance(DesignTokensDto, { colors: { status: { success: 'green' } } });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('nests correctly inside ThemeSettingsDto — end-to-end validation chain', async () => {
    const dto = plainToInstance(ThemeSettingsDto, {
      primaryColor: '#112233',
      designTokens: { colors: { brand: { primary: '#111827' } } },
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('propagates a nested designTokens validation error up through ThemeSettingsDto', async () => {
    const dto = plainToInstance(ThemeSettingsDto, {
      designTokens: { colors: { brand: { primary: 'not-a-color' } } },
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'designTokens')).toBe(true);
  });

  it('accepts ThemeSettingsDto with no designTokens at all (pre-M8 theme)', async () => {
    const dto = plainToInstance(ThemeSettingsDto, { primaryColor: '#112233' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.designTokens).toBeUndefined();
  });
});
