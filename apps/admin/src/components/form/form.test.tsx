import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input } from '@/components/ui/input';

const schema = z.object({ name: z.string().min(1, 'Name is required') });

function TestForm() {
  const form = useForm<{ name: string }>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe('Form composition', () => {
  it('renders the label wired to the input via htmlFor/id', () => {
    render(<TestForm />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('shows no error message before submission', () => {
    render(<TestForm />);
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
  });

  it('shows the Zod validation message after a failed submit', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByText('Name is required')).toBeInTheDocument());
  });

  it('marks the control aria-invalid once an error is present', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true')
    );
  });

  it('clears the error once a valid value is entered and resubmitted', async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByText('Name is required')).toBeInTheDocument());

    await user.type(screen.getByLabelText('Name'), 'Alex');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.queryByText('Name is required')).not.toBeInTheDocument());
  });
});
