'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useTagOptions } from '../hooks/use-tag-options';

export interface TagMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

/** `GET /tags` (first 100, client-filtered by the search box below — no
 * server-side search debounce needed at this scale). Same permission
 * caveat as `CategorySelect` — `category.create` gates every Tags
 * endpoint too (no `tag.*` permission exists). */
export function TagMultiSelect({ value, onChange }: TagMultiSelectProps) {
  const [search, setSearch] = useState('');
  const { data, isError } = useTagOptions();

  if (isError) {
    return <p className="text-sm text-muted-foreground">You don&apos;t have permission to view tags.</p>;
  }

  const allTags = data?.data ?? [];
  const filtered = search
    ? allTags.filter((tag) => tag.name.toLowerCase().includes(search.toLowerCase()))
    : allTags;
  const selectedTags = allTags.filter((tag) => value.includes(tag.id));

  function toggle(tagId: string) {
    onChange(value.includes(tagId) ? value.filter((id) => id !== tagId) : [...value, tagId]);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="h-auto min-h-9 w-full justify-start flex-wrap gap-1">
          {selectedTags.length === 0 ? (
            <span className="text-muted-foreground">Select tags…</span>
          ) : (
            selectedTags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-2" align="start">
        <Input
          placeholder="Search tags…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search tags"
        />
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags found.</p>
          ) : (
            filtered.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 rounded-sm px-1 py-1 text-sm hover:bg-accent">
                <Checkbox checked={value.includes(tag.id)} onCheckedChange={() => toggle(tag.id)} />
                {tag.name}
              </label>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
