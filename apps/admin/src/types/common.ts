export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;

export interface SelectOption<TValue = string> {
  label: string;
  value: TValue;
  disabled?: boolean;
}

/** Discriminated union for a generic async operation result — used by
 * shared infrastructure that isn't already a TanStack Query hook (e.g. a
 * one-off imperative call). Feature hooks normally consume TanStack
 * Query's own isLoading/isError/data triple directly instead of re-wrapping
 * it in this shape (docs/59_FRONTEND_CODING_GUIDELINES.md). */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T };
