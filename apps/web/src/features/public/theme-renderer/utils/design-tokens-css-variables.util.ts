import type { PublicTheme } from '../../types/theme.types';

function set(vars: Record<string, string>, name: string, value: string | undefined | null): void {
  if (typeof value === 'string' && value.trim() !== '') {
    vars[name] = value;
  }
}

/**
 * Milestone 8 (Advanced Site Design System) — turns `theme.designTokens`
 * into the site's real CSS custom properties. Reuses the EXISTING
 * `--sportingspy-*` variable names wherever a 1:1 semantic match already
 * exists (`colors.brand.primary` → `--sportingspy-color-primary`,
 * `colors.border.default` → `--sportingspy-color-border`, …) — this is
 * why `ThemeButton`/`ThemeCard` (Milestone 13.x) need ZERO code changes
 * to become theme-token-aware: they already read those exact variable
 * names, previously always the static `globals.css` fallback, now
 * overridden here when a theme actually sets them. Only genuinely new
 * concepts (buttons/cards/forms component tokens, the extended spacing
 * scale, container/section spacing, typography per-style sizes) get new
 * variable names.
 *
 * A pre-M8 theme (`designTokens` null/absent) produces an empty object —
 * every consumer falls through to whatever `buildExtendedThemeCssVariables`
 * already sets (legacy flat fields) or, below that, `globals.css`'s
 * static defaults. Nothing here is ever a required field.
 */
export function buildDesignTokenCssVariables(theme: PublicTheme | null): Record<string, string> {
  const tokens = theme?.designTokens;
  if (!tokens) return {};

  const vars: Record<string, string> = {};

  // Colors — reuses existing variable names for the fields that already
  // had one (primary/secondary/accent/background/surface/border/text/muted).
  const brand = tokens.colors?.brand;
  set(vars, '--sportingspy-color-primary', brand?.primary);
  set(vars, '--sportingspy-color-secondary', brand?.secondary);
  set(vars, '--sportingspy-color-accent', brand?.accent ?? brand?.secondary);

  const bg = tokens.colors?.background;
  set(vars, '--sportingspy-color-background', bg?.page);
  set(vars, '--sportingspy-color-surface', bg?.surface);
  set(vars, '--sportingspy-color-surface-elevated', bg?.surfaceElevated);
  set(vars, '--sportingspy-color-section', bg?.section);
  set(vars, '--sportingspy-color-background-inverse', bg?.inverse);

  const text = tokens.colors?.text;
  set(vars, '--sportingspy-color-text', text?.primary);
  set(vars, '--sportingspy-color-text-secondary', text?.secondary);
  set(vars, '--sportingspy-color-muted', text?.muted);
  set(vars, '--sportingspy-color-text-inverse', text?.inverse);
  set(vars, '--sportingspy-color-link', text?.link);

  const border = tokens.colors?.border;
  set(vars, '--sportingspy-color-border', border?.default);
  set(vars, '--sportingspy-color-border-strong', border?.strong);
  set(vars, '--sportingspy-color-border-focus', border?.focus);

  const status = tokens.colors?.status;
  set(vars, '--sportingspy-color-success', status?.success);
  set(vars, '--sportingspy-color-warning', status?.warning);
  set(vars, '--sportingspy-color-error', status?.error);
  set(vars, '--sportingspy-color-info', status?.info);

  // Typography
  const families = tokens.typography?.fontFamilies;
  set(vars, '--sportingspy-font-family', families?.body);
  set(vars, '--sportingspy-font-family-heading', families?.heading);
  set(vars, '--sportingspy-font-family-ui', families?.ui);
  set(vars, '--sportingspy-font-family-mono', families?.mono);

  const styles = tokens.typography?.styles;
  for (const key of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'button'] as const) {
    const style = styles?.[key];
    if (!style) continue;
    set(vars, `--sportingspy-${key}-font-size`, style.fontSize);
    set(vars, `--sportingspy-${key}-font-weight`, style.fontWeight);
    set(vars, `--sportingspy-${key}-line-height`, style.lineHeight);
    set(vars, `--sportingspy-${key}-letter-spacing`, style.letterSpacing);
  }

  // Spacing — extends the existing xs/sm/md/lg/xl scale.
  const spacing = tokens.spacing;
  if (spacing) {
    for (const key of ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl', 'xxxxl'] as const) {
      set(vars, `--sportingspy-spacing-${key}`, spacing[key]);
    }
  }

  // Container
  const container = tokens.container;
  set(vars, '--sportingspy-container-width', container?.maxWidth);
  set(vars, '--sportingspy-container-wide-width', container?.wideWidth);
  set(vars, '--sportingspy-container-padding-x', container?.paddingX);
  set(vars, '--sportingspy-section-spacing', container?.sectionSpacing);

  // Buttons
  const buttons = tokens.buttons;
  set(vars, '--sportingspy-radius', buttons?.radius);
  set(vars, '--sportingspy-border-radius', buttons?.radius);
  set(vars, '--sportingspy-button-height', buttons?.height);
  set(vars, '--sportingspy-button-padding-x', buttons?.paddingX);
  set(vars, '--sportingspy-button-shadow', buttons?.shadow);

  // Cards
  const cards = tokens.cards;
  set(vars, '--sportingspy-card-background', cards?.background ?? bg?.surface);
  set(vars, '--sportingspy-card-border', cards?.border ?? border?.default);
  set(vars, '--sportingspy-card-radius', cards?.radius ?? buttons?.radius);
  set(vars, '--sportingspy-card-shadow', cards?.shadow);
  set(vars, '--sportingspy-card-padding', cards?.padding);

  // Forms
  const forms = tokens.forms;
  set(vars, '--sportingspy-form-input-height', forms?.inputHeight);
  set(vars, '--sportingspy-form-input-radius', forms?.inputRadius);
  set(vars, '--sportingspy-form-input-border', forms?.inputBorder);
  set(vars, '--sportingspy-form-input-background', forms?.inputBackground);
  set(vars, '--sportingspy-form-label-color', forms?.labelColor);
  set(vars, '--sportingspy-form-focus-color', forms?.focusColor ?? border?.focus);
  set(vars, '--sportingspy-form-error-color', forms?.errorColor ?? status?.error);
  set(vars, '--sportingspy-form-helper-color', forms?.helperColor ?? text?.muted);

  // Page background (solid/gradient/image) — a single CSS `background`
  // shorthand-compatible value; `solid` also mirrors into
  // `--sportingspy-color-background` so `body`'s existing rule keeps working.
  const background = tokens.background;
  if (background?.value) {
    if (background.type === 'image') {
      set(vars, '--sportingspy-page-background', `url(${background.value})`);
    } else {
      set(vars, '--sportingspy-page-background', background.value);
      if (background.type === 'solid') {
        set(vars, '--sportingspy-color-background', background.value);
      }
    }
  }

  // Header / Footer
  const header = tokens.header;
  set(vars, '--sportingspy-header-height', header?.height);
  set(vars, '--sportingspy-header-background', header?.background ?? bg?.surface);
  set(vars, '--sportingspy-header-text', header?.textColor ?? text?.primary);

  const footer = tokens.footer;
  set(vars, '--sportingspy-footer-background', footer?.background ?? bg?.inverse);
  set(vars, '--sportingspy-footer-text', footer?.textColor ?? text?.inverse);

  return vars;
}
