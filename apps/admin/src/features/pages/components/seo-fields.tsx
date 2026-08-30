'use client';

import type { Control, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

/** SEO section — mirrors `PageSeoDto`'s simple fields
 * (title/description/canonicalUrl/keywords/noIndex/noFollow/ogImage), same
 * shape as `features/articles/components/seo-fields.tsx` (duplicated
 * rather than cross-imported — every feature stays self-contained,
 * matching the established `features/*` convention). "No Index"/"No
 * Follow" read as their own on/off switches here (a page owner thinks in
 * terms of hiding a page, not toggling an "Index" switch off) — they
 * write to the exact same `robots.{index,follow}` keys the SEO
 * Intelligence Center's editor already uses, just inverted client-side. */
export function SeoFields<TFieldValues extends FieldValues>({
  control,
}: {
  control: Control<TFieldValues>;
}) {
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

      <FormField
        control={control}
        name={'seo.ogImage' as never}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Social share image (OG image)</FormLabel>
            <FormControl>
              <Input type="url" placeholder="https://…" {...field} />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              Shown when this page is shared on social media.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex flex-wrap gap-6">
        <FormField
          control={control}
          name={'seo.noIndex' as never}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
              </FormControl>
              <Label>No index</Label>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={'seo.noFollow' as never}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
              </FormControl>
              <Label>No follow</Label>
            </FormItem>
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Turn on &quot;No index&quot; to hide this page from search engines.
      </p>
    </div>
  );
}
