import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { z } from 'zod';
import { useAppForm } from './use-app-form';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(18, 'Must be an adult'),
});

describe('useAppForm', () => {
  it('wires the zodResolver so an invalid value produces field errors', async () => {
    const { result } = renderHook(() =>
      useAppForm(schema, { defaultValues: { name: '', age: 10 } })
    );
    // RHF's formState is a lazily-tracked proxy — reading a property here
    // (before triggering validation) is what opts this consumer into
    // re-renders when that property later changes.
    expect(result.current.formState.errors).toEqual({});

    await act(async () => {
      await result.current.trigger();
    });

    await waitFor(() => {
      expect(result.current.formState.errors.name?.message).toBe('Name is required');
      expect(result.current.formState.errors.age?.message).toBe('Must be an adult');
    });
  });

  it('reports no errors for valid values', async () => {
    const { result } = renderHook(() =>
      useAppForm(schema, { defaultValues: { name: 'Alex', age: 25 } })
    );

    await act(async () => {
      await result.current.trigger();
    });

    await waitFor(() => expect(Object.keys(result.current.formState.errors)).toHaveLength(0));
  });

  it('defaults validation mode to onBlur', () => {
    const { result } = renderHook(() => useAppForm(schema));
    expect(result.current.control._options.mode).toBe('onBlur');
  });

  it('allows an explicit mode to override the default', () => {
    const { result } = renderHook(() => useAppForm(schema, { mode: 'onChange' }));
    expect(result.current.control._options.mode).toBe('onChange');
  });
});
