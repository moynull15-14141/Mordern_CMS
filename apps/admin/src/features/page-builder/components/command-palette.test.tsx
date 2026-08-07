import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommandPalette, type Command } from './command-palette';

function buildCommands(): Command[] {
  return [
    { id: 'add-heading', label: 'Add Heading', run: vi.fn() },
    { id: 'add-image', label: 'Add Image', run: vi.fn() },
    { id: 'save', label: 'Save', shortcut: 'Ctrl+S', run: vi.fn() },
  ];
}

describe('CommandPalette', () => {
  it('filters commands as the user types and shows the shortcut hint', async () => {
    const commands = buildCommands();
    render(<CommandPalette open onOpenChange={vi.fn()} commands={commands} />);

    expect(screen.getByText('Add Heading')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+S')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Command palette search'), 'Save');

    expect(screen.queryByText('Add Heading')).not.toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('shows an empty state when nothing matches', async () => {
    render(<CommandPalette open onOpenChange={vi.fn()} commands={buildCommands()} />);
    await userEvent.type(screen.getByLabelText('Command palette search'), 'xyz-nothing');
    expect(screen.getByText('No matching commands.')).toBeInTheDocument();
  });

  it('clicking a command runs it and closes the palette', async () => {
    const commands = buildCommands();
    const onOpenChange = vi.fn();
    render(<CommandPalette open onOpenChange={onOpenChange} commands={commands} />);

    await userEvent.click(screen.getByText('Add Image'));

    expect(commands[1].run).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('Enter runs the currently active command', async () => {
    const commands = buildCommands();
    const onOpenChange = vi.fn();
    render(<CommandPalette open onOpenChange={onOpenChange} commands={commands} />);

    await userEvent.type(screen.getByLabelText('Command palette search'), '{Enter}');

    expect(commands[0].run).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('ArrowDown moves the active selection before Enter runs it', async () => {
    const commands = buildCommands();
    render(<CommandPalette open onOpenChange={vi.fn()} commands={commands} />);

    const input = screen.getByLabelText('Command palette search');
    await userEvent.type(input, '{ArrowDown}{Enter}');

    expect(commands[1].run).toHaveBeenCalled();
    expect(commands[0].run).not.toHaveBeenCalled();
  });
});
