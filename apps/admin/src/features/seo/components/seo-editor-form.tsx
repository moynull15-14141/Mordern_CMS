'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/form/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CharacterCounter } from './character-counter';
import { seoEditorSchema, type SeoEditorFormValues } from '../schemas/seo-editor.schema';
import type { SeoMeta } from '../types/seo';

/** Maps a `SeoMeta` row onto the flat editor form shape, and back. Only
 * `openGraph.{title,description,image}` / `twitterCard.{card,title,
 * description,image}` / `robots.{index,follow}` are surfaced as editable
 * fields — the real DTO fields, narrowed to what a structured form can
 * safely round-trip; anything else already present in the JSON blob
 * (`extraMeta`, additional robots directives, etc.) is preserved on
 * submit via spreading over the original record, never dropped. */
function toFormValues(seo: SeoMeta | undefined): SeoEditorFormValues {
  const og = seo?.openGraph ?? {};
  const tw = seo?.twitterCard ?? {};
  const robots = seo?.robots ?? {};
  return {
    title: seo?.title ?? '',
    description: seo?.description ?? '',
    canonicalUrl: seo?.canonicalUrl ?? '',
    keywords: (seo?.keywords ?? []).join(', '),
    ogTitle: typeof og.title === 'string' ? og.title : '',
    ogDescription: typeof og.description === 'string' ? og.description : '',
    ogImage: typeof og.image === 'string' ? og.image : '',
    twitterCard: (tw.card as SeoEditorFormValues['twitterCard']) ?? 'summary_large_image',
    twitterTitle: typeof tw.title === 'string' ? tw.title : '',
    twitterDescription: typeof tw.description === 'string' ? tw.description : '',
    twitterImage: typeof tw.image === 'string' ? tw.image : '',
    robotsIndex: robots.index !== false && robots.noindex !== true,
    robotsFollow: robots.follow !== false && robots.nofollow !== true,
    schemaJsonText: seo?.schemaJsonPretty ?? '',
  };
}

export function formValuesToSeoFields(values: SeoEditorFormValues, seo: SeoMeta | undefined) {
  let schemaJson = seo?.schemaJson ?? undefined;
  if (values.schemaJsonText?.trim()) {
    try {
      schemaJson = JSON.parse(values.schemaJsonText);
    } catch {
      // Left as-is; the form's schemaJsonText field surfaces the parse
      // error separately (see SeoEditorForm's onSubmit guard) — silently
      // keeping the previous value here avoids sending malformed JSON.
    }
  }

  return {
    title: values.title || undefined,
    description: values.description || undefined,
    canonicalUrl: values.canonicalUrl || undefined,
    keywords: values.keywords
      ? values.keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      : [],
    openGraph: {
      ...seo?.openGraph,
      title: values.ogTitle || undefined,
      description: values.ogDescription || undefined,
      image: values.ogImage || undefined,
    },
    twitterCard: {
      ...seo?.twitterCard,
      card: values.twitterCard,
      title: values.twitterTitle || undefined,
      description: values.twitterDescription || undefined,
      image: values.twitterImage || undefined,
    },
    robots: {
      ...seo?.robots,
      index: values.robotsIndex,
      follow: values.robotsFollow,
    },
    ...(schemaJson ? { schemaJson } : {}),
  };
}

export function SeoEditorForm({
  seo,
  onChange,
  onSubmit,
  isSaving,
}: {
  seo: SeoMeta | undefined;
  onChange: (values: SeoEditorFormValues) => void;
  onSubmit: (values: SeoEditorFormValues) => void;
  isSaving: boolean;
}) {
  const defaultValues = useMemo(() => toFormValues(seo), [seo]);
  const form = useForm<SeoEditorFormValues>({
    resolver: zodResolver(seoEditorSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  useEffect(() => {
    onChange(form.getValues());
    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = form.watch((values) => onChange(values as SeoEditorFormValues));
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section id="seo-section-title" className="space-y-4">
          <h3 className="text-sm font-semibold">Title &amp; Description</h3>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>SEO Title</FormLabel>
                  <CharacterCounter length={field.value?.length ?? 0} min={10} max={60} />
                </div>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem id="seo-section-description">
                <div className="flex items-center justify-between">
                  <FormLabel>Meta Description</FormLabel>
                  <CharacterCounter length={field.value?.length ?? 0} min={50} max={160} />
                </div>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="keywords"
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
        </section>

        <Separator />

        <section id="seo-section-canonical" className="space-y-4">
          <h3 className="text-sm font-semibold">Canonical &amp; Robots</h3>
          <FormField
            control={form.control}
            name="canonicalUrl"
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
          <div id="seo-section-robots" className="flex flex-wrap gap-6">
            <FormField
              control={form.control}
              name="robotsIndex"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <Label>Index</Label>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="robotsFollow"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <Label>Follow</Label>
                </FormItem>
              )}
            />
          </div>
        </section>

        <Separator />

        <section id="seo-section-openGraph" className="space-y-4">
          <h3 className="text-sm font-semibold">Open Graph</h3>
          <FormField
            control={form.control}
            name="ogTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OG Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ogDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OG Description</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ogImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OG Image URL</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Separator />

        <section id="seo-section-twitter" className="space-y-4">
          <h3 className="text-sm font-semibold">Twitter Card</h3>
          <FormField
            control={form.control}
            name="twitterCard"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="summary">summary</SelectItem>
                    <SelectItem value="summary_large_image">summary_large_image</SelectItem>
                    <SelectItem value="app">app</SelectItem>
                    <SelectItem value="player">player</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="twitterTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="twitterDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter Description</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="twitterImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter Image URL</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Separator />

        <section id="seo-section-schema" className="space-y-4">
          <h3 className="text-sm font-semibold">Schema (JSON-LD)</h3>
          <FormField
            control={form.control}
            name="schemaJsonText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Structured Data</FormLabel>
                <FormControl>
                  <Textarea rows={6} className="font-mono text-xs" placeholder="{}" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Button type="submit" isLoading={isSaving}>
          Save SEO Settings
        </Button>
      </form>
    </Form>
  );
}
