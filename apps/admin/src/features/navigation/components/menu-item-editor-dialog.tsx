'use client';

import { useState } from 'react';
import { useAppForm } from '@/hooks/use-app-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/form/form';
import { FormSubmitButton } from '@/components/form/form-submit-button';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { menuItemSchema, type MenuItemFormValues } from '../schemas/menu-item.schema';
import { MenuItemTargetPicker } from './menu-item-target-picker';
import { flattenForParentOptions, getSubtreeIds } from '../utils/menu-item-tree.util';
import { MENU_ITEM_TARGET_TYPE_LABEL } from '../constants/menu.constants';
import type { MenuItem, MenuItemTargetType } from '../types/menu';

export interface MenuItemEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The whole current tree — used to build the "Parent item" list and to
   * exclude `editingItem`'s own subtree from it. */
  tree: MenuItem[];
  /** Present when editing an existing item; absent when adding a new one. */
  editingItem?: MenuItem | null;
  /** Preselects a parent when adding a new child item from a specific row. */
  defaultParentId?: string | null;
  isSubmitting: boolean;
  onSubmit: (values: MenuItemFormValues) => void;
}

function toFormValues(item?: MenuItem | null, defaultParentId?: string | null): MenuItemFormValues {
  if (!item) {
    return {
      label: '',
      targetType: 'PAGE',
      pageId: '',
      pageLabel: '',
      articleId: '',
      articleLabel: '',
      categoryId: '',
      categoryLabel: '',
      url: '',
      openMode: 'SELF',
      parentId: defaultParentId ?? '',
      icon: '',
      cssClass: '',
    };
  }
  return {
    label: item.label,
    targetType: item.targetType,
    pageId: item.pageId ?? '',
    pageLabel: '',
    articleId: item.articleId ?? '',
    articleLabel: '',
    categoryId: item.categoryId ?? '',
    categoryLabel: '',
    url: item.url ?? '',
    openMode: item.openMode,
    parentId: item.parentId ?? '',
    icon: item.icon ?? '',
    cssClass: item.cssClass ?? '',
  };
}

/**
 * One dialog for both Add and Edit — `editingItem` present/absent is the
 * only difference, matching the rest of this codebase's "one form,
 * optional defaultValues" convention. The inner form is only mounted
 * while `open`, keyed by which item (or "new") it edits — remounting on
 * a key change is what resets form/`showAdvanced` state for a fresh
 * item, rather than an effect calling `setState` on every open (flagged
 * by this repo's React Compiler lint rule as a cascading-render risk).
 */
export function MenuItemEditorDialog({
  open,
  onOpenChange,
  ...formProps
}: MenuItemEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? <MenuItemEditorForm key={formProps.editingItem?.id ?? 'new'} {...formProps} /> : null}
    </Dialog>
  );
}

function MenuItemEditorForm({
  tree,
  editingItem,
  defaultParentId,
  isSubmitting,
  onSubmit,
}: Omit<MenuItemEditorDialogProps, 'open' | 'onOpenChange'>) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const form = useAppForm(menuItemSchema, {
    defaultValues: toFormValues(editingItem, defaultParentId),
  });

  const targetType = form.watch('targetType');
  const excludeIds = editingItem ? getSubtreeIds(editingItem) : new Set<string>();
  const parentOptions = flattenForParentOptions(tree, excludeIds);

  return (
    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{editingItem ? 'Edit navigation item' : 'Add navigation item'}</DialogTitle>
        <DialogDescription>
          Choose a page, article, or link to add to your navigation.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. About Us" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link type</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(next) => field.onChange(next as MenuItemTargetType)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(Object.keys(MENU_ITEM_TARGET_TYPE_LABEL) as MenuItemTargetType[]).map(
                      (type) => (
                        <SelectItem key={type} value={type}>
                          {MENU_ITEM_TARGET_TYPE_LABEL[type]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {targetType === 'PAGE' ? (
            <FormField
              control={form.control}
              name="pageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page</FormLabel>
                  <FormControl>
                    <MenuItemTargetPicker
                      contentType="PAGE"
                      value={field.value}
                      valueLabel={form.watch('pageLabel')}
                      placeholder="Choose a page…"
                      onSelect={(id, label) => {
                        field.onChange(id);
                        form.setValue('pageLabel', label);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          {targetType === 'ARTICLE' ? (
            <FormField
              control={form.control}
              name="articleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article</FormLabel>
                  <FormControl>
                    <MenuItemTargetPicker
                      contentType="ARTICLE"
                      value={field.value}
                      valueLabel={form.watch('articleLabel')}
                      placeholder="Choose an article…"
                      onSelect={(id, label) => {
                        field.onChange(id);
                        form.setValue('articleLabel', label);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          {targetType === 'CATEGORY' ? (
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <MenuItemTargetPicker
                      contentType="CATEGORY"
                      value={field.value}
                      valueLabel={form.watch('categoryLabel')}
                      placeholder="Choose a category…"
                      onSelect={(id, label) => {
                        field.onChange(id);
                        form.setValue('categoryLabel', label);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          {targetType === 'EXTERNAL_URL' || targetType === 'CUSTOM_URL' ? (
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          <FormField
            control={form.control}
            name="openMode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-md border border-border p-3">
                <FormLabel className="mb-0">Open in a new tab</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value === 'BLANK'}
                    onCheckedChange={(checked) => field.onChange(checked ? 'BLANK' : 'SELF')}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent item</FormLabel>
                <Select
                  value={field.value || 'none'}
                  onValueChange={(next) => field.onChange(next === 'none' ? '' : next)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No parent (top level)</SelectItem>
                    {parentOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {'—'.repeat(option.depth)} {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
          </Button>

          {showAdvanced ? (
            <div className="space-y-4 rounded-md border border-border p-3">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional icon name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cssClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CSS class</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional, for custom styling" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : null}

          <DialogFooter>
            <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting}>
              {editingItem ? 'Save item' : 'Add item'}
            </FormSubmitButton>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
