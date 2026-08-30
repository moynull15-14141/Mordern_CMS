import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm, FormProvider } from 'react-hook-form';
import { MenuPickerField } from './menu-picker-field';
import { menusApi } from '../services/menus.api';

vi.mock('../services/menus.api', () => ({ menusApi: { list: vi.fn() } }));

function Harness() {
  const form = useForm({ defaultValues: { menuId: '' } });
  return (
    <FormProvider {...form}>
      <MenuPickerField control={form.control} name="menuId" label="Header navigation" />
    </FormProvider>
  );
}

function renderField() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <Harness />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MenuPickerField', () => {
  it('shows "No navigation selected" and never a raw menu id when nothing is chosen', async () => {
    vi.mocked(menusApi.list).mockResolvedValue({
      data: [{ id: 'm1', name: 'Main Navigation', slug: 'main-navigation' }],
      meta: {},
    } as never);
    renderField();
    expect(screen.getByText('No navigation selected')).toBeInTheDocument();
    expect(screen.queryByText('m1')).not.toBeInTheDocument();
  });

  it('lists menus by NAME, not id, when the picker is opened', async () => {
    vi.mocked(menusApi.list).mockResolvedValue({
      data: [
        { id: 'm1', name: 'Main Navigation', slug: 'main-navigation' },
        { id: 'm2', name: 'Footer Navigation', slug: 'footer-navigation' },
      ],
      meta: {},
    } as never);
    const user = userEvent.setup();
    renderField();

    await user.click(screen.getByRole('combobox'));
    await waitFor(() => expect(screen.getByText('Main Navigation')).toBeInTheDocument());
    expect(screen.getByText('Footer Navigation')).toBeInTheDocument();
    expect(screen.queryByText('m1')).not.toBeInTheDocument();
    expect(screen.queryByText('m2')).not.toBeInTheDocument();
  });

  it('shows the selected menu name on the trigger after picking one', async () => {
    vi.mocked(menusApi.list).mockResolvedValue({
      data: [{ id: 'm1', name: 'Main Navigation', slug: 'main-navigation' }],
      meta: {},
    } as never);
    const user = userEvent.setup();
    renderField();

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByText('Main Navigation'));

    expect(screen.getByRole('combobox')).toHaveTextContent('Main Navigation');
  });

  it('shows an empty state with a "Create navigation" action when there are no menus', async () => {
    vi.mocked(menusApi.list).mockResolvedValue({ data: [], meta: {} } as never);
    const user = userEvent.setup();
    renderField();

    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText('No navigation menus yet')).toBeInTheDocument();
  });
});
