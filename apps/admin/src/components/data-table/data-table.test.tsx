import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './data-table';
import { ApiError } from '@/lib/api-error';

interface Row {
  id: string;
  name: string;
}

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
];

const rows: Row[] = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Beta' },
];

describe('DataTable', () => {
  it('renders column headers and row data', () => {
    render(<DataTable columns={columns} data={rows} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('shows skeleton rows (no data rows) while isLoading is true', () => {
    render(<DataTable columns={columns} data={[]} isLoading />);
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(screen.queryByText('No results')).not.toBeInTheDocument();
  });

  it('shows the ErrorState when an error is passed, with data hidden', () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        error={new ApiError({ message: 'Failed to load', code: 'SERVER_ERROR', status: 500 })}
      />
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });

  it('shows the EmptyState when data is an empty array', () => {
    render(<DataTable columns={columns} data={[]} emptyTitle="No articles yet" />);
    expect(screen.getByText('No articles yet')).toBeInTheDocument();
  });

  it('renders pagination controls when both pagination and its handlers are supplied', () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        pagination={{ page: 1, limit: 10, total: 2, hasNext: false, hasPrevious: false }}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
      />
    );
    expect(screen.getByText('Page 1 of 1 (2 total)')).toBeInTheDocument();
  });

  it('omits pagination controls when pagination is not supplied', () => {
    render(<DataTable columns={columns} data={rows} />);
    expect(screen.queryByLabelText('Next page')).not.toBeInTheDocument();
  });

  it('renders the search input and forwards typed changes via onSearchChange', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onSearchChange = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <DataTable
        columns={columns}
        data={rows}
        search=""
        onSearchChange={onSearchChange}
        searchPlaceholder="Search rows…"
      />
    );

    await user.type(screen.getByPlaceholderText('Search rows…'), 'a');
    vi.advanceTimersByTime(300);
    expect(onSearchChange).toHaveBeenCalledWith('a');
    vi.useRealTimers();
  });
});
