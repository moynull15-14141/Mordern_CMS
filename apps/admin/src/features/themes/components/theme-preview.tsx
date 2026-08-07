'use client';

import { useMemo, useState } from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ThemeSettingsFormValues } from '../schemas/theme-settings.schema';

export interface ThemePreviewProps {
  settings: Partial<ThemeSettingsFormValues>;
}

const BUTTON_RADIUS_BY_STYLE: Record<string, string> = {
  square: '0px',
  rounded: '6px',
  pill: '999px',
};

type DeviceMode = 'desktop' | 'tablet' | 'mobile';
const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: '100%',
  tablet: '420px',
  mobile: '300px',
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
 * public site (same scope decision Milestone 12 made; see
 * docs/73_FRONTEND_THEMES.md "Known Limitations"). Milestone 8 extends it
 * to prefer `settings.designTokens` (the new Site Design tabs) over the
 * legacy flat fields when both are present — never the other way around,
 * so a pre-M8 theme's preview is pixel-identical to before — and adds a
 * Desktop/Tablet/Mobile width toggle plus a form input + alert row so the
 * preview actually demonstrates "header, navigation, hero, heading,
 * paragraph, buttons, cards, form, alerts, footer" per the spec.
 */
export function ThemePreview({ settings }: ThemePreviewProps) {
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const tokens = settings.designTokens;

  const primary =
    tokens?.colors?.brand?.primary?.trim() || settings.primaryColor?.trim() || '#3b82f6';
  const secondary =
    tokens?.colors?.background?.surface?.trim() || settings.secondaryColor?.trim() || '#f1f5f9';
  const pageBackground = tokens?.colors?.background?.page?.trim() || '#ffffff';
  const textColor = tokens?.colors?.text?.primary?.trim() || '#111827';
  const mutedColor = tokens?.colors?.text?.muted?.trim() || '#6b7280';
  const errorColor = tokens?.colors?.status?.error?.trim() || '#dc2626';
  const borderColor = tokens?.colors?.border?.default?.trim() || '#e5e7eb';
  const cardBackground = tokens?.cards?.background?.trim() || pageBackground;

  const borderRadius =
    tokens?.buttons?.radius?.trim() ||
    settings.borderRadius?.trim() ||
    BUTTON_RADIUS_BY_STYLE[settings.buttonStyle?.trim().toLowerCase() ?? ''] ||
    '6px';
  const cardRadius = tokens?.cards?.radius?.trim() || borderRadius;

  const fontFamily = useMemo(() => {
    return (
      tokens?.typography?.fontFamilies?.body?.trim() || parseFontFamily(settings.typographyText)
    );
  }, [tokens?.typography?.fontFamilies?.body, settings.typographyText]);

  const containerWidth =
    tokens?.container?.maxWidth?.trim() || settings.containerWidth?.trim() || '100%';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Live Preview</CardTitle>
        <div className="flex items-center gap-1" role="group" aria-label="Preview device">
          <Button
            type="button"
            variant={device === 'desktop' ? 'secondary' : 'ghost'}
            size="icon"
            aria-label="Desktop"
            aria-pressed={device === 'desktop'}
            onClick={() => setDevice('desktop')}
          >
            <Monitor className="size-4" />
          </Button>
          <Button
            type="button"
            variant={device === 'tablet' ? 'secondary' : 'ghost'}
            size="icon"
            aria-label="Tablet"
            aria-pressed={device === 'tablet'}
            onClick={() => setDevice('tablet')}
          >
            <Tablet className="size-4" />
          </Button>
          <Button
            type="button"
            variant={device === 'mobile' ? 'secondary' : 'ghost'}
            size="icon"
            aria-label="Mobile"
            aria-pressed={device === 'mobile'}
            onClick={() => setDevice('mobile')}
          >
            <Smartphone className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div
          data-testid="theme-preview-frame"
          className="mx-auto overflow-hidden rounded-md border border-border transition-[width]"
          style={{
            fontFamily,
            width: DEVICE_WIDTHS[device],
            maxWidth: '100%',
            background: pageBackground,
          }}
        >
          <div
            data-testid="theme-preview-header"
            className="flex items-center justify-between px-4 py-3 text-sm font-semibold"
            style={{ backgroundColor: secondary, color: primary }}
          >
            <span>{settings.headerLayout?.trim() || 'Header'}</span>
            <span className="text-xs font-normal opacity-70">nav · nav · nav</span>
          </div>

          <div className="space-y-4 p-4" style={{ maxWidth: containerWidth, margin: '0 auto' }}>
            <h2 className="text-lg font-bold" style={{ color: primary }}>
              Sample heading
            </h2>
            <p className="text-sm" style={{ color: mutedColor }}>
              This is body copy rendered with the theme&apos;s typography and colors, updating live
              as you edit.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div
                className="p-3 text-xs"
                style={{
                  borderRadius: cardRadius,
                  border: `1px solid ${borderColor}`,
                  background: cardBackground,
                  color: textColor,
                }}
              >
                Card A
              </div>
              <div
                className="p-3 text-xs"
                style={{
                  borderRadius: cardRadius,
                  border: `1px solid ${borderColor}`,
                  background: cardBackground,
                  color: textColor,
                }}
              >
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

            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: textColor }}>
                Email address
              </label>
              <input
                readOnly
                value=""
                placeholder="you@example.com"
                className="w-full px-3 py-2 text-xs"
                style={{
                  borderRadius: tokens?.forms?.inputRadius?.trim() || '4px',
                  border: `1px solid ${borderColor}`,
                }}
              />
            </div>

            <div
              className="rounded p-2 text-xs"
              style={{
                borderLeft: `3px solid ${errorColor}`,
                background: `${errorColor}1a`,
                color: errorColor,
              }}
            >
              This is a sample alert.
            </div>
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
