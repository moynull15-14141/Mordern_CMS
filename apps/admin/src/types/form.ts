import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

/** Form foundation types — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md
 * "Form System" / docs/59_FRONTEND_CODING_GUIDELINES.md. */
export interface FormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface FormWrapperProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: (values: TFieldValues) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
}
