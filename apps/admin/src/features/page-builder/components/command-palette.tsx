'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

export interface Command {
  id: string;
  label: string;
  shortcut?: string;
  /** Commands are filtered per-open by the shell based on current
   * context (e.g. "Publish" only when the page isn't already published)
   * — this component has no business logic of its own, only search +
   * keyboard navigation over whatever list it's given. */
  run: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: Command[];
}

/**
 * Keyboard-friendly command palette (spec Phase 14) — built on the
 * existing `Dialog` primitive (no `cmdk` dependency exists in this repo
 * yet, and pulling one in for a single list-with-search widget wasn't
 * justified). Search + Up/Down/Enter + Escape-to-close; the shell decides
 * which commands are valid for the current context and passes only those
 * in, per the spec's "only show valid actions."
 */
export function CommandPalette({ open, onOpenChange, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset query/selection during render (React's documented pattern for
  // "adjusting state when a prop changes," same technique
  // `search-input.tsx` already establishes) rather than in a
  // `useEffect` — avoids the extra commit-then-re-render a setState-in-
  // effect would cause on every open.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery('');
      setActiveIndex(0);
    }
  }
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setActiveIndex(0);
  }

  const filtered = useMemo(
    () => commands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase())),
    [commands, query]
  );

  // Focusing the input is a genuine imperative DOM effect (not a state
  // update), so it stays in `useEffect` rather than the render-time
  // adjustment above.
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  function runActive() {
    const command = filtered[activeIndex];
    if (!command) return;
    onOpenChange(false);
    command.run();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg gap-0 overflow-hidden p-0"
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
          } else if (event.key === 'Enter') {
            event.preventDefault();
            runActive();
          }
        }}
      >
        <Input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type a command…"
          aria-label="Command palette search"
          className="rounded-none border-0 border-b focus-visible:ring-0"
        />
        <ul className="max-h-80 overflow-y-auto py-1" role="listbox" aria-label="Commands">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              No matching commands.
            </li>
          ) : (
            filtered.map((command, index) => (
              <li
                key={command.id}
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  'flex cursor-pointer items-center justify-between px-3 py-2 text-sm',
                  index === activeIndex && 'bg-accent'
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  onOpenChange(false);
                  command.run();
                }}
              >
                <span>{command.label}</span>
                {command.shortcut ? (
                  <span className="text-xs text-muted-foreground">{command.shortcut}</span>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
