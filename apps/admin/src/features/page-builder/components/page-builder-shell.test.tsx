import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { PageBuilderShell } from './page-builder-shell';
import { pagesApi } from '@/features/pages/services/pages.api';
import type { Page } from '@/features/pages/types/page';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('@/features/pages/services/pages.api', () => ({
  pagesApi: { update: vi.fn(), publish: vi.fn(), createPreviewToken: vi.fn() },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
// Patterns/reusable-blocks/media pickers are only mounted once their
// dialog opens — none of these tests open them, so a minimal mock is
// enough to satisfy module resolution without pulling in real network
// calls this test never exercises.
vi.mock('@/features/patterns/hooks/use-patterns', () => ({
  usePatterns: () => ({ data: undefined }),
}));
vi.mock('@/features/patterns/hooks/use-pattern-favorites', () => ({
  useFavoritePatterns: () => ({ data: undefined }),
}));

function buildPage(overrides: Partial<Page> = {}): Page {
  return {
    id: 'page-1',
    title: 'About',
    slug: 'about',
    body: { blocks: [] },
    status: 'DRAFT',
    publishedAt: null,
    seo: null,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
    ...overrides,
  };
}

function renderShell(page: Page) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const permissionValue: PermissionContextValue = {
    permissions: ['page.manage'],
    roles: [],
    can: () => true,
    canAny: () => true,
    canAll: () => true,
    isRole: () => false,
  };
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <PermissionContext.Provider value={permissionValue}>{children}</PermissionContext.Provider>
      </QueryClientProvider>
    );
  }
  return render(<PageBuilderShell page={page} />, { wrapper: Wrapper });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('PageBuilderShell', () => {
  it('renders the page title in the top bar and starts with an empty canvas', () => {
    renderShell(buildPage());
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByTestId('page-builder-shell')).toBeInTheDocument();
  });

  it('inserting a block via the Add panel puts it on the canvas and selects it for the inspector', async () => {
    renderShell(buildPage());

    await userEvent.click(screen.getByRole('button', { name: 'Heading' }));

    // The property panel now shows the Heading block's own fields.
    expect(await screen.findByLabelText('Heading properties')).toBeInTheDocument();
  });

  it('Undo removes the just-inserted block, Redo restores it', async () => {
    renderShell(buildPage());

    await userEvent.click(screen.getByRole('button', { name: 'Heading' }));
    expect(screen.getByLabelText('Undo')).not.toBeDisabled();

    await userEvent.click(screen.getByLabelText('Undo'));
    await waitFor(() => expect(screen.getByLabelText('Redo')).not.toBeDisabled());

    await userEvent.click(screen.getByLabelText('Redo'));
    expect(await screen.findByLabelText('Heading properties')).toBeInTheDocument();
  });

  it('toggling Structure swaps the left panel from Add to the block tree', async () => {
    renderShell(buildPage({ body: { blocks: [{ id: 'a', type: 'paragraph', data: {} }] } }));

    expect(screen.getByTestId('add-panel')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Structure'));

    expect(screen.getByTestId('structure-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('add-panel')).not.toBeInTheDocument();
  });

  it('shows Publish for a DRAFT page and hides it for an already-PUBLISHED page', () => {
    const draft = renderShell(buildPage({ status: 'DRAFT' }));
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument();
    draft.unmount();

    renderShell(buildPage({ status: 'PUBLISHED' }));
    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument();
  });

  it('clicking Publish calls pagesApi.publish', async () => {
    vi.mocked(pagesApi.publish).mockResolvedValue(buildPage({ status: 'PUBLISHED' }));
    renderShell(buildPage());

    await userEvent.click(screen.getByRole('button', { name: 'Publish' }));
    await waitFor(() => expect(pagesApi.publish).toHaveBeenCalledWith('page-1'));
  });

  it('Ctrl+K opens the command palette', async () => {
    renderShell(buildPage());
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(await screen.findByLabelText('Command palette search')).toBeInTheDocument();
  });
});
