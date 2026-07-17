'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { debounce } from '@/utils/debounce';
import { cn } from '@/utils/cn';

export interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

/** Debounced search input for the DataTable toolbar —
 * docs/59_FRONTEND_CODING_GUIDELINES.md "Table System" (search: "a single
 * debounced search input... substring match only"). */
export function SearchInput({
  value = '',
  onChange,
  placeholder = 'Search…',
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);
  // Adjusting state during render (React's documented pattern for syncing
  // to a prop change) instead of useEffect+setState — this runs as part of
  // the render itself, not as a separate synchronous effect.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setInternalValue(value);
  }

  useEffect(() => {
    const debounced = debounce((next: string) => onChange(next), debounceMs);
    if (internalValue !== value) {
      debounced(internalValue);
    }
    return () => debounced.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalValue, debounceMs]);

  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={internalValue}
        onChange={(event) => setInternalValue(event.target.value)}
        placeholder={placeholder}
        className="pl-8 pr-8"
        aria-label={placeholder}
      />
      {internalValue ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0.5 top-1/2 size-7 -translate-y-1/2"
          onClick={() => setInternalValue('')}
          aria-label="Clear search"
        >
          <X className="size-3.5" aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
