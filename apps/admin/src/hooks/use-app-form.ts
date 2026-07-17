'use client';

import { useForm, type FieldValues, type UseFormProps, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

/**
 * Thin convenience wrapper pairing React Hook Form with a Zod schema —
 * docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "State Management — Form state":
 * "One Zod schema per form, colocated with the form component." Every
 * future form hook uses this instead of hand-wiring `zodResolver` per
 * call site.
 */
export function useAppForm<TSchema extends z.ZodType<FieldValues>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
): UseFormReturn<z.infer<TSchema>> {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    ...options,
  });
}
