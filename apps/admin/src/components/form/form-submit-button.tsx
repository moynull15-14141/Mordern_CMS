'use client';

import { useFormContext } from 'react-hook-form';
import { Button, type ButtonProps } from '@/components/ui/button';

/** docs/59 "Form System — Submit": shows a loading spinner during the
 * mutation and disables re-submission, preventing duplicate-submit
 * double-clicks. */
export function FormSubmitButton({ children, ...props }: ButtonProps) {
  const { formState } = useFormContext();

  return (
    <Button
      type="submit"
      isLoading={formState.isSubmitting}
      disabled={formState.isSubmitting}
      {...props}
    >
      {children}
    </Button>
  );
}
