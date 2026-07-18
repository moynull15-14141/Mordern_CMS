'use client';

import type { Control, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ColorInput } from './color-input';

/** Appearance settings editor — mirrors `ThemeSettingsDto`'s exact field
 * set, nothing more. Shared between Create and Edit forms, both nesting
 * this under a `settings` object field. `typography` is edited as raw
 * JSON text (`settings.typographyText`) since the backend keeps it as an
 * open-ended `Record<string, unknown>` — see `theme-settings.schema.ts`. */
export function AppearanceSettingsFields<TFieldValues extends FieldValues>({
  control,
}: {
  control: Control<TFieldValues>;
}) {
  return (
    <div className="space-y-6 rounded-md border border-border p-4">
      <h3 className="text-sm font-medium">Appearance</h3>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={'settings.logo' as never}
          render={({ field }) => (
            <FormItem id="appearance-section-logo">
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="https://…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={'settings.favicon' as never}
          render={({ field }) => (
            <FormItem id="appearance-section-favicon">
              <FormLabel>Favicon URL</FormLabel>
              <FormControl>
                <Input placeholder="https://…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />

      <div id="appearance-section-colors" className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={'settings.primaryColor' as never}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Color</FormLabel>
              <FormControl>
                <ColorInput
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={'settings.secondaryColor' as never}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary Color</FormLabel>
              <FormControl>
                <ColorInput
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />

      <FormField
        control={control}
        name={'settings.typographyText' as never}
        render={({ field }) => (
          <FormItem id="appearance-section-typography">
            <FormLabel>Typography (JSON)</FormLabel>
            <FormControl>
              <Textarea rows={4} className="font-mono text-xs" placeholder="{}" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      <div id="appearance-section-layout" className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={'settings.headerLayout' as never}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Header Layout</FormLabel>
              <FormControl>
                <Input placeholder="centered" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={'settings.footerLayout' as never}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Footer Layout</FormLabel>
              <FormControl>
                <Input placeholder="columns" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={'settings.containerWidth' as never}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Container Width</FormLabel>
              <FormControl>
                <Input placeholder="1200px" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={'settings.borderRadius' as never}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Border Radius</FormLabel>
              <FormControl>
                <Input placeholder="8px" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={'settings.buttonStyle' as never}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Style</FormLabel>
              <FormControl>
                <Input placeholder="rounded" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={'settings.homepageLayout' as never}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Homepage Layout</FormLabel>
              <FormControl>
                <Input placeholder="grid" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={'settings.blogLayout' as never}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blog Layout</FormLabel>
              <FormControl>
                <Input placeholder="list" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />

      <FormField
        control={control}
        name={'settings.customCss' as never}
        render={({ field }) => (
          <FormItem id="appearance-section-custom-css">
            <FormLabel>Custom CSS</FormLabel>
            <FormControl>
              <Textarea rows={6} className="font-mono text-xs" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={'settings.customJs' as never}
        render={({ field }) => (
          <FormItem id="appearance-section-custom-js">
            <FormLabel>Custom JS</FormLabel>
            <FormControl>
              <Textarea rows={6} className="font-mono text-xs" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
