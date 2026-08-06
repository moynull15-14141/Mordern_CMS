'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReusableBlocks } from '../../../hooks/use-reusable-blocks';
import type { FieldProps } from './field.types';

/**
 * A searchable picker sourced live from `GET /content-blocks/reusable`
 * (Milestone 1's backend) — read-only (choose an existing reusable
 * block). Creating/renaming/deleting reusable blocks is a Reusable
 * Blocks library management page, not built in this milestone — see the
 * milestone report's "remaining work."
 */
export function ReusableBlockRefField({ descriptor, value, onChange }: FieldProps) {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useReusableBlocks(search || undefined);
  const options = data?.data ?? [];
  const current = typeof value === 'string' ? value : undefined;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search reusable blocks…"
          className="pl-8"
        />
      </div>
      <Select value={current} onValueChange={onChange}>
        <SelectTrigger id={`field-${descriptor.key}`} aria-label={descriptor.label}>
          <SelectValue placeholder={isLoading ? 'Loading…' : 'Select a reusable block…'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((block) => (
            <SelectItem key={block.id} value={block.id}>
              {block.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
