import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { FormSubmitButton } from './form-submit-button';

function Wrapper() {
  const form = useForm<{ name: string }>({ defaultValues: { name: '' } });
  return (
    <FormProvider {...form}>
      <FormSubmitButton>Save</FormSubmitButton>
    </FormProvider>
  );
}

describe('FormSubmitButton', () => {
  it('renders its children as the button label', () => {
    render(<Wrapper />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('is a submit-type button', () => {
    render(<Wrapper />);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit');
  });

  it('is enabled and not busy while the form is not submitting', () => {
    render(<Wrapper />);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).not.toBeDisabled();
    expect(button).not.toHaveAttribute('aria-busy', 'true');
  });
});
