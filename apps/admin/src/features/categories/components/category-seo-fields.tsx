'use client';

import type { Control, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/** SEO section — mirrors `CategorySeoDto`'s simple fields only
 * (title/description/canonicalUrl/keywords), same shape/simplification as
 * `features/articles/components/seo-fields.tsx` (duplicated rather than
 * cross-imported — every feature stays self-contained, matching the
 * established `features/*` convention). */
export function CategorySeoFields<TFieldValues extends FieldValues>({ control }: { control: Control<TFieldValues> }) {
  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <h3 className="text-sm font-medium">SEO</h3>

      <FormField
        control={control}
        name={'seo.title' as never}
        render={({ field }) => (
          <FormItem>
            <FormLabel>SEO title</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={'seo.description' as never}
        render={({ field }) => (
          <FormItem>
            <FormLabel>SEO description</FormLabel>
            <FormControl>
              <Textarea rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={'seo.canonicalUrl' as never}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Canonical URL</FormLabel>
            <FormControl>
              <Input type="url" placeholder="https://…" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={'seo.keywords' as never}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Keywords (comma-separated)</FormLabel>
            <FormControl>
              <Input placeholder="news, sports, breaking" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
