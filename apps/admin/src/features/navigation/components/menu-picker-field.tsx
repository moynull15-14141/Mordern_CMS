'use client';

import { useState } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Check, ChevronsUpDown, Plus, Search, X } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/empty-state';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/cn';
import { NAVIGATION_ROUTES } from '@/constants/routes';
import { useAllMenus } from '../hooks/use-menus';

export interface MenuPickerFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
}

/**
 * Replaces the raw "Navigation menu id" text input that used to live in
 * Site Design's Header/Footer tabs — same generic
 * `<TFieldValues>({control, name, label})` contract as this file's
 * sibling `TextField`/`ColorField`, so it drops into the exact same RHF
 * path (`settings.designTokens.header.menuId` / `.footer.menuId`)
 * without any schema change. Shows the menu's real NAME, never its id.
 */
export function MenuPickerField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
}: MenuPickerFieldProps<TFieldValues>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menusQuery = useAllMenus();
  const menus = menusQuery.data?.data ?? [];
  const filtered = menus.filter((menu) => menu.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedMenu = menus.find((menu) => menu.id === field.value);
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className="flex gap-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between font-normal"
                    >
                      <span className={selectedMenu ? '' : 'text-muted-foreground'}>
                        {selectedMenu ? selectedMenu.name : 'No navigation selected'}
                      </span>
                      <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden="true" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-3" align="start">
                  {menusQuery.isLoading ? (
                    <div className="space-y-1">
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  ) : menus.length === 0 ? (
                    <EmptyState
                      title="No navigation menus yet"
                      description="Create one first, then come back to select it here."
                      action={{
                        label: 'Create navigation',
                        onClick: () => window.open(NAVIGATION_ROUTES.new(), '_blank'),
                      }}
                    />
                  ) : (
                    <>
                      <div className="relative mb-2">
                        <Search
                          className="absolute left-2.5 top-2.5 size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <Input
                          autoFocus
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search navigation menus…"
                          className="pl-8"
                        />
                      </div>
                      <div className="max-h-64 space-y-1 overflow-y-auto">
                        {filtered.map((menu) => (
                          <button
                            key={menu.id}
                            type="button"
                            onClick={() => {
                              field.onChange(menu.id);
                              setOpen(false);
                              setSearch('');
                            }}
                            className="flex w-full items-center justify-between gap-2 rounded-md border border-transparent px-3 py-2 text-left text-sm hover:border-border hover:bg-accent"
                          >
                            <span className="font-medium">{menu.name}</span>
                            {field.value === menu.id ? (
                              <Check className="size-4 text-primary" aria-hidden="true" />
                            ) : null}
                          </button>
                        ))}
                      </div>
                      <a
                        href={NAVIGATION_ROUTES.new()}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          'mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <Plus className="size-3" aria-hidden="true" />
                        Create a new navigation
                      </a>
                    </>
                  )}
                </PopoverContent>
              </Popover>
              {field.value ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Clear navigation selection"
                  onClick={() => field.onChange('')}
                >
                  <X className="size-4" />
                </Button>
              ) : null}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
