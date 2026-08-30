'use client';

import { useState } from 'react';
import type { Control, FieldValues, Path, PathValue } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MenuPickerField } from '@/features/navigation';
import { ColorInput } from './color-input';
import { AppearanceSettingsFields } from './appearance-settings-fields';
import { DESIGN_PRESETS } from '../constants/design-presets';
import { checkContrast } from '../utils/contrast';
import type { DesignTokens } from '../types/design-tokens';

/** A theme-color field: label + `ColorInput`, at a `settings.designTokens.…`
 * path. Generic over the host form's field values so both `CreateThemeForm`
 * and `EditThemeForm` can reuse it without a cast at every call site. */
function ColorField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
}: {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <ColorInput
              value={(field.value as string) ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TextField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
}: {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} value={(field.value as string) ?? ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function SwitchField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
}: {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-md border border-border p-3">
          <FormLabel className="mb-0">{label}</FormLabel>
          <FormControl>
            <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

const SPACING_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl', 'xxxxl'] as const;
const TYPOGRAPHY_STYLE_KEYS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'button'] as const;

/** Live WCAG contrast warning between the two colors that decide "can you
 * read the site's default body text" — Milestone 8 Phase 13. Advisory
 * only; never blocks saving. */
function ContrastWarning<TFieldValues extends FieldValues>({
  control,
}: {
  control: Control<TFieldValues>;
}) {
  const textColor = useWatch({
    control,
    name: 'settings.designTokens.colors.text.primary' as Path<TFieldValues>,
  }) as string | undefined;
  const bgColor = useWatch({
    control,
    name: 'settings.designTokens.colors.background.page' as Path<TFieldValues>,
  }) as string | undefined;

  if (!textColor || !bgColor) return null;
  const result = checkContrast(textColor, bgColor);
  if (!result || result.level === 'aa') return null;

  return (
    <Alert variant={result.level === 'fail' ? 'destructive' : 'warning'}>
      <AlertDescription>⚠ {result.message}</AlertDescription>
    </Alert>
  );
}

/**
 * The Site Design tabbed editor (Milestone 8) — supersedes
 * `AppearanceSettingsFields` as the primary UX (kept, unmodified, under
 * the "Advanced" tab for the legacy flat fields and Custom CSS/JS, per
 * "Advanced controls belong under Advanced/Developer"). Every field here
 * writes to `settings.designTokens.*` — a real typed path
 * (`designTokensSchema`), never raw JSON. Presets populate this same
 * path via `setValue`, after which every field is independently
 * editable — no separate "preset mode."
 */
export function SiteDesignFields<TFieldValues extends FieldValues>({
  control,
}: {
  control: Control<TFieldValues>;
}) {
  const { setValue } = useFormContext<TFieldValues>();
  const [tab, setTab] = useState('presets');

  function applyPreset(tokens: DesignTokens) {
    setValue(
      'settings.designTokens' as Path<TFieldValues>,
      tokens as PathValue<TFieldValues, Path<TFieldValues>>,
      { shouldDirty: true, shouldValidate: true }
    );
  }

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <h3 className="text-sm font-medium">Site Design</h3>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="cards-forms">Cards &amp; Forms</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Start from a look, then customize anything below. Applying a preset overwrites your
            current Colors/Typography/Buttons/Cards/Layout — everything else on this theme stays the
            same.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {DESIGN_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.tokens)}
                className="rounded-md border border-border p-3 text-left transition hover:border-primary"
              >
                <div className="mb-2 flex gap-1">
                  <span
                    className="size-4 rounded-full border border-border"
                    style={{ background: preset.tokens.colors?.brand?.primary }}
                  />
                  <span
                    className="size-4 rounded-full border border-border"
                    style={{ background: preset.tokens.colors?.brand?.secondary }}
                  />
                </div>
                <p className="text-sm font-medium">{preset.label}</p>
                <p className="text-xs text-muted-foreground">{preset.description}</p>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          <ContrastWarning control={control} />

          <p className="text-xs font-medium text-muted-foreground">Brand</p>
          <div className="grid grid-cols-3 gap-4">
            <ColorField
              control={control}
              name={'settings.designTokens.colors.brand.primary' as Path<TFieldValues>}
              label="Primary"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.colors.brand.secondary' as Path<TFieldValues>}
              label="Secondary"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.colors.brand.accent' as Path<TFieldValues>}
              label="Accent"
            />
          </div>

          <p className="text-xs font-medium text-muted-foreground">Background</p>
          <div className="grid grid-cols-3 gap-4">
            <ColorField
              control={control}
              name={'settings.designTokens.colors.background.page' as Path<TFieldValues>}
              label="Page background"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.colors.background.surface' as Path<TFieldValues>}
              label="Surface"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.colors.background.section' as Path<TFieldValues>}
              label="Section"
            />
          </div>

          <p className="text-xs font-medium text-muted-foreground">Text</p>
          <div className="grid grid-cols-3 gap-4">
            <ColorField
              control={control}
              name={'settings.designTokens.colors.text.primary' as Path<TFieldValues>}
              label="Text"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.colors.text.muted' as Path<TFieldValues>}
              label="Muted text"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.colors.text.link' as Path<TFieldValues>}
              label="Links"
            />
          </div>

          <p className="text-xs font-medium text-muted-foreground">Border</p>
          <div className="grid grid-cols-3 gap-4">
            <ColorField
              control={control}
              name={'settings.designTokens.colors.border.default' as Path<TFieldValues>}
              label="Border"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.colors.border.focus' as Path<TFieldValues>}
              label="Focus ring"
            />
          </div>

          <p className="text-xs font-medium text-muted-foreground">Status</p>
          <div className="grid grid-cols-4 gap-4">
            <ColorField
              control={control}
              name={'settings.designTokens.colors.status.success' as Path<TFieldValues>}
              label="Success"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.colors.status.warning' as Path<TFieldValues>}
              label="Warning"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.colors.status.error' as Path<TFieldValues>}
              label="Error"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.colors.status.info' as Path<TFieldValues>}
              label="Info"
            />
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <p className="text-xs font-medium text-muted-foreground">Font families</p>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              control={control}
              name={'settings.designTokens.typography.fontFamilies.heading' as Path<TFieldValues>}
              label="Heading font"
              placeholder="Poppins, sans-serif"
            />
            <TextField
              control={control}
              name={'settings.designTokens.typography.fontFamilies.body' as Path<TFieldValues>}
              label="Body font"
              placeholder="Inter, sans-serif"
            />
          </div>

          <p className="text-xs font-medium text-muted-foreground">Sizes</p>
          <div className="space-y-2">
            {TYPOGRAPHY_STYLE_KEYS.map((key) => (
              <div key={key} className="grid grid-cols-4 items-end gap-2">
                <span className="pb-2 text-xs uppercase text-muted-foreground">{key}</span>
                <TextField
                  control={control}
                  name={
                    `settings.designTokens.typography.styles.${key}.fontSize` as Path<TFieldValues>
                  }
                  label="Size"
                  placeholder="1rem"
                />
                <TextField
                  control={control}
                  name={
                    `settings.designTokens.typography.styles.${key}.fontWeight` as Path<TFieldValues>
                  }
                  label="Weight"
                  placeholder="400"
                />
                <TextField
                  control={control}
                  name={
                    `settings.designTokens.typography.styles.${key}.lineHeight` as Path<TFieldValues>
                  }
                  label="Line height"
                  placeholder="1.5"
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="buttons" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <TextField
              control={control}
              name={'settings.designTokens.buttons.radius' as Path<TFieldValues>}
              label="Radius"
              placeholder="0.5rem"
            />
            <TextField
              control={control}
              name={'settings.designTokens.buttons.height' as Path<TFieldValues>}
              label="Height"
              placeholder="2.75rem"
            />
            <TextField
              control={control}
              name={'settings.designTokens.buttons.paddingX' as Path<TFieldValues>}
              label="Horizontal padding"
              placeholder="1.25rem"
            />
          </div>

          <p className="text-xs font-medium text-muted-foreground">Primary variant</p>
          <div className="grid grid-cols-2 gap-4">
            <ColorField
              control={control}
              name={
                'settings.designTokens.buttons.variants.primary.background' as Path<TFieldValues>
              }
              label="Background"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.buttons.variants.primary.text' as Path<TFieldValues>}
              label="Text"
            />
          </div>

          <p className="text-xs font-medium text-muted-foreground">Outline variant</p>
          <div className="grid grid-cols-2 gap-4">
            <ColorField
              control={control}
              name={'settings.designTokens.buttons.variants.outline.text' as Path<TFieldValues>}
              label="Text / border"
            />
            <ColorField
              control={control}
              name={
                'settings.designTokens.buttons.variants.outline.background' as Path<TFieldValues>
              }
              label="Background"
            />
          </div>
        </TabsContent>

        <TabsContent value="cards-forms" className="space-y-4">
          <p className="text-xs font-medium text-muted-foreground">Cards</p>
          <div className="grid grid-cols-2 gap-4">
            <ColorField
              control={control}
              name={'settings.designTokens.cards.background' as Path<TFieldValues>}
              label="Background"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.cards.border' as Path<TFieldValues>}
              label="Border"
            />
            <TextField
              control={control}
              name={'settings.designTokens.cards.radius' as Path<TFieldValues>}
              label="Radius"
              placeholder="0.75rem"
            />
            <TextField
              control={control}
              name={'settings.designTokens.cards.padding' as Path<TFieldValues>}
              label="Padding"
              placeholder="1.5rem"
            />
          </div>

          <p className="text-xs font-medium text-muted-foreground">Forms</p>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              control={control}
              name={'settings.designTokens.forms.inputHeight' as Path<TFieldValues>}
              label="Input height"
              placeholder="2.5rem"
            />
            <TextField
              control={control}
              name={'settings.designTokens.forms.inputRadius' as Path<TFieldValues>}
              label="Input radius"
              placeholder="0.375rem"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.forms.inputBorder' as Path<TFieldValues>}
              label="Input border"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.forms.focusColor' as Path<TFieldValues>}
              label="Focus color"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.forms.errorColor' as Path<TFieldValues>}
              label="Error color"
            />
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <p className="text-xs font-medium text-muted-foreground">Container</p>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              control={control}
              name={'settings.designTokens.container.maxWidth' as Path<TFieldValues>}
              label="Max width"
              placeholder="1200px"
            />
            <TextField
              control={control}
              name={'settings.designTokens.container.paddingX' as Path<TFieldValues>}
              label="Horizontal padding"
              placeholder="1.5rem"
            />
            <TextField
              control={control}
              name={'settings.designTokens.container.sectionSpacing' as Path<TFieldValues>}
              label="Section spacing"
              placeholder="4rem"
            />
          </div>

          <p className="text-xs font-medium text-muted-foreground">Spacing scale</p>
          <div className="grid grid-cols-4 gap-3">
            {SPACING_KEYS.map((key) => (
              <TextField
                key={key}
                control={control}
                name={`settings.designTokens.spacing.${key}` as Path<TFieldValues>}
                label={key.toUpperCase()}
              />
            ))}
          </div>

          <p className="text-xs font-medium text-muted-foreground">
            Background image or gradient (advanced)
          </p>
          <p className="text-xs text-muted-foreground">
            For a plain color, use <strong>Colors → Background → Page background</strong> instead —
            only set this if you want a gradient or an image behind your entire site.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name={'settings.designTokens.background.type' as Path<TFieldValues>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={(field.value as string) || undefined}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="image">Image URL</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TextField
              control={control}
              name={'settings.designTokens.background.value' as Path<TFieldValues>}
              label="Value"
              placeholder="A CSS gradient, or an image URL"
            />
          </div>
        </TabsContent>

        <TabsContent value="header" className="space-y-4">
          <SwitchField
            control={control}
            name={'settings.designTokens.header.sticky' as Path<TFieldValues>}
            label="Sticky header"
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField
              control={control}
              name={'settings.designTokens.header.height' as Path<TFieldValues>}
              label="Height"
              placeholder="4rem"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.header.background' as Path<TFieldValues>}
              label="Background"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.header.textColor' as Path<TFieldValues>}
              label="Text color"
            />
          </div>
          <MenuPickerField
            control={control}
            name={'settings.designTokens.header.menuId' as Path<TFieldValues>}
            label="Header navigation"
          />
          <div className="grid grid-cols-2 gap-2">
            <SwitchField
              control={control}
              name={'settings.designTokens.header.showBorder' as Path<TFieldValues>}
              label="Show border"
            />
            <SwitchField
              control={control}
              name={'settings.designTokens.header.showShadow' as Path<TFieldValues>}
              label="Show shadow"
            />
          </div>
          <SwitchField
            control={control}
            name={'settings.designTokens.header.showCta' as Path<TFieldValues>}
            label="Show call-to-action button"
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField
              control={control}
              name={'settings.designTokens.header.ctaLabel' as Path<TFieldValues>}
              label="CTA label"
              placeholder="Get Started"
            />
            <TextField
              control={control}
              name={'settings.designTokens.header.ctaHref' as Path<TFieldValues>}
              label="CTA link"
              placeholder="/contact"
            />
          </div>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ColorField
              control={control}
              name={'settings.designTokens.footer.background' as Path<TFieldValues>}
              label="Background"
            />
            <ColorField
              control={control}
              name={'settings.designTokens.footer.textColor' as Path<TFieldValues>}
              label="Text color"
            />
          </div>
          <MenuPickerField
            control={control}
            name={'settings.designTokens.footer.menuId' as Path<TFieldValues>}
            label="Footer navigation"
          />
          <SwitchField
            control={control}
            name={'settings.designTokens.footer.showNewsletter' as Path<TFieldValues>}
            label="Show newsletter signup slot"
          />
          <TextField
            control={control}
            name={'settings.designTokens.footer.contactInfo' as Path<TFieldValues>}
            label="Contact info"
          />
          <TextField
            control={control}
            name={'settings.designTokens.footer.copyrightText' as Path<TFieldValues>}
            label="Copyright text"
            placeholder="© 2026 Acme Inc."
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Legacy appearance fields, and Custom CSS/JS for developers — everything above is the
            recommended way to control your site&apos;s design.
          </p>
          <AppearanceSettingsFields control={control} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
