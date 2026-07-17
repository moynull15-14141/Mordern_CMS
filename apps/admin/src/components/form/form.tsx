'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils/cn';

/**
 * Form foundation — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Form System" /
 * docs/59_FRONTEND_CODING_GUIDELINES.md. The standard React-Hook-Form
 * "Form/FormField/FormItem/FormControl/FormMessage" composition pattern —
 * pairs a label, input control, and error message with correct
 * `aria-describedby` wiring in one place so no feature hand-rolls
 * label/error markup (docs/59 "Form System — Field Wrapper").
 */
export const Form = FormProvider;

interface FormFieldContextValue {
  name: string;
}
const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(undefined);

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
  props: ControllerProps<TFieldValues, TName>
) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

interface FormItemContextValue {
  id: string;
}
const FormItemContext = React.createContext<FormItemContextValue | undefined>(undefined);

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext || !itemContext) {
    throw new Error('Form field hooks must be used within <FormField> and <FormItem>.');
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  );
}

export function FormLabel({ className, ...props }: React.ComponentPropsWithoutRef<typeof Label>) {
  const { error, formItemId } = useFormField();
  return (
    <Label className={cn(error && 'text-destructive', className)} htmlFor={formItemId} {...props} />
  );
}

/**
 * Forwards id/aria-* onto the actual field element (via Radix Slot) rather
 * than wrapping it in a <div> — the <FormLabel>'s htmlFor must resolve to
 * a real labellable element for the association to work at all.
 */
export function FormControl({ ...props }: React.ComponentPropsWithoutRef<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return (
    <Slot
      id={formItemId}
      aria-describedby={error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId}
      aria-invalid={Boolean(error)}
      {...props}
    />
  );
}

export function FormDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { formDescriptionId } = useFormField();
  return (
    <p
      id={formDescriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

/** Error Renderer — docs/59 "Form System — Error": field-level errors
 * render inline here. */
export function FormMessage({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? '') : children;
  if (!body) return null;

  return (
    <p
      id={formMessageId}
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
}

export { useFormField };
