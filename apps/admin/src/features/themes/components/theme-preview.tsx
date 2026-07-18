'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ThemeSettingsFormValues } from '../schemas/theme-settings.schema';

export interface ThemePreviewProps {
  settings: Partial<ThemeSettingsFormValues>;
}

const BUTTON_RADIUS_BY_STYLE: Record<string, string> = {
  square: '0px',
  rounded: '6px',
  pill: '999px',
};

function parseFontFamily(typographyText: string | undefined): string | undefined {
  if (!typographyText?.trim()) return undefined;
  try {
    const parsed = JSON.parse(typographyText) as Record<string, unknown>;
    return typeof parsed.fontFamily === 'string' ? parsed.fontFamily : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Frontend-only, instant-update visualization — no iframe, no call to the
 * public site (out of this milestone's scope; see docs/73_FRONTEND_THEMES.md
 * "Known Limitations"). Renders a small mock header/content/footer using
 * the live form values directly, matching "colors, typography, buttons,
 * header/footer style, spacing, cards" from the brief.
 */
export function ThemePreview({ settings }: ThemePreviewProps) {
  const primary = settings.primaryColor?.trim() || '#3b82f6';
  const secondary = settings.secondaryColor?.trim() || '#f1f5f9';
  const borderRadius =
    settings.borderRadius?.trim() ||
    BUTTON_RADIUS_BY_STYLE[settings.buttonStyle?.trim().toLowerCase() ?? ''] ||
    '6px';
  const fontFamily = useMemo(
    () => parseFontFamily(settings.typographyText),
    [settings.typographyText]
  );
  const containerWidth = settings.containerWidth?.trim() || '100%';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          data-testid="theme-preview-frame"
          className="overflow-hidden rounded-md border border-border"
          style={{ fontFamily }}
        >
          <div
            data-testid="theme-preview-header"
            className="flex items-center justify-between px-4 py-3 text-sm font-semibold"
            style={{ backgroundColor: secondary, color: primary }}
          >
            <span>{settings.headerLayout?.trim() || 'Header'}</span>
            <span className="text-xs font-normal opacity-70">nav · nav · nav</span>
          </div>

          <div
            className="space-y-4 bg-background p-4"
            style={{ maxWidth: containerWidth, margin: '0 auto' }}
          >
            <h2 className="text-lg font-bold" style={{ color: primary }}>
              Sample heading
            </h2>
            <p className="text-sm text-muted-foreground">
              This is body copy rendered with the theme&apos;s typography and colors, updating live
              as you edit.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-border p-3 text-xs" style={{ borderRadius }}>
                Card A
              </div>
              <div className="rounded-md border border-border p-3 text-xs" style={{ borderRadius }}>
                Card B
              </div>
            </div>

            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: primary, borderRadius }}
            >
              Sample Button
            </button>
          </div>

          <div
            data-testid="theme-preview-footer"
            className="px-4 py-3 text-center text-xs"
            style={{ backgroundColor: secondary, color: primary }}
          >
            {settings.footerLayout?.trim() || 'Footer'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
