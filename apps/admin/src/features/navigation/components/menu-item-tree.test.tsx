import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { MenuItemTree } from './menu-item-tree';
import { menusApi } from '../services/menus.api';
import { usePages } from '@/features/pages';
import type { MenuItem } from '../types/menu';

vi.mock('../services/menus.api', () => ({
  menusApi: {
    createItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    reorderItems: vi.fn(),
  },
}));
vi.mock('@/features/pages', () => ({ usePages: vi.fn() }));
vi.mock('@/features/articles', () => ({
  useArticles: vi.fn(() => ({ data: undefined, isLoading: false })),
}));
vi.mock('@/features/categories', () => ({
  useCategory: vi.fn(() => ({ data: undefined })),
  useCategoryFlat: vi.fn(() => ({ data: [], isLoading: false })),
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function homeItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 'home',
    menuId: 'm1',
    parentId: null,
    label: 'Home',
    targetType: 'CUSTOM_URL',
    pageId: null,
    articleId: null,
    categoryId: null,
    url: '/',
    openMode: 'SELF',
    icon: null,
    cssClass: null,
    sortOrder: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    children: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(usePages).mockReturnValue({
    data: { data: [{ id: 'p1', title: 'About Us', slug: 'about-us' }] },
    isLoading: false,
  } as never);
});

describe('MenuItemTree', () => {
  it('shows the empty state when the menu has no items', () => {
    render(<MenuItemTree menuId="m1" items={[]} />, { wrapper: wrapper() });
    expect(screen.getByText('No navigation items yet')).toBeInTheDocument();
  });

  it('renders an existing item by its label, never a raw id', () => {
    render(<MenuItemTree menuId="m1" items={[homeItem()]} />, { wrapper: wrapper() });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByText('home')).not.toBeInTheDocument();
  });

  it('adds an External Link item end-to-end (label + URL, no picker needed)', async () => {
    vi.mocked(menusApi.createItem).mockResolvedValue(homeItem({ id: 'i2' }));
    const user = userEvent.setup();
    render(<MenuItemTree menuId="m1" items={[]} />, { wrapper: wrapper() });

    await user.click(screen.getAllByRole('button', { name: 'Add item' })[0]);
    await user.type(screen.getByLabelText('Label'), 'Docs');
    await user.click(screen.getByLabelText('Link type'));
    await user.click(await screen.findByRole('option', { name: 'External link' }));
    await user.type(screen.getByLabelText('URL'), 'https://docs.example.com');
    // Once the dialog is open, Radix marks the rest of the page
    // aria-hidden (correct modal behavior) — only the dialog's own
    // submit button matches "Add item" from here on.
    const submitButton = screen.getAllByRole('button', { name: 'Add item' }).at(-1)!;
    await user.click(submitButton);

    await waitFor(() => expect(menusApi.createItem).toHaveBeenCalled());
    expect(vi.mocked(menusApi.createItem).mock.calls[0]).toEqual([
      'm1',
      {
        label: 'Docs',
        targetType: 'EXTERNAL_URL',
        pageId: undefined,
        articleId: undefined,
        categoryId: undefined,
        url: 'https://docs.example.com',
        openMode: 'SELF',
        parentId: undefined,
        icon: undefined,
        cssClass: undefined,
      },
    ]);
  });

  it('picks a Page by its title, never by typing a raw id', async () => {
    const user = userEvent.setup();
    render(<MenuItemTree menuId="m1" items={[]} />, { wrapper: wrapper() });

    await user.click(screen.getAllByRole('button', { name: 'Add item' })[0]);
    await user.click(screen.getByLabelText('Link type'));
    await user.click(await screen.findByRole('option', { name: 'Page' }));
    await user.click(screen.getByLabelText('Page'));
    await user.click(await screen.findByText('About Us'));

    // The trigger now shows the page's title, not its id, and there is
    // no text input anywhere the user could have typed a raw id into.
    expect(screen.getByLabelText('Page')).toHaveTextContent('About Us');
    expect(screen.queryByText('p1')).not.toBeInTheDocument();
  });

  it('moves an item up via the accessible Move Up button (not drag-and-drop)', async () => {
    vi.mocked(menusApi.reorderItems).mockResolvedValue({} as never);
    const items = [
      homeItem({ id: 'a', label: 'About', sortOrder: 0 }),
      homeItem({ id: 'b', label: 'Contact', sortOrder: 1 }),
    ];
    const user = userEvent.setup();
    render(<MenuItemTree menuId="m1" items={items} />, { wrapper: wrapper() });

    await user.click(screen.getByRole('button', { name: 'Move Contact up' }));

    await waitFor(() =>
      expect(menusApi.reorderItems).toHaveBeenCalledWith('m1', {
        items: [
          { id: 'b', parentId: null, sortOrder: 0 },
          { id: 'a', parentId: null, sortOrder: 1 },
        ],
      })
    );
  });

  it('disables Move Up for the first item and Move Down for the last item', () => {
    const items = [homeItem({ id: 'a', label: 'About' }), homeItem({ id: 'b', label: 'Contact' })];
    render(<MenuItemTree menuId="m1" items={items} />, { wrapper: wrapper() });

    expect(screen.getByRole('button', { name: 'Move About up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move Contact down' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move About down' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Move Contact up' })).toBeEnabled();
  });
});
