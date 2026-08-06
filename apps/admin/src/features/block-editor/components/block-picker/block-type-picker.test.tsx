import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlockTypePicker } from './block-type-picker';
import { __resetRegistryForTests, registerBlockDefinition } from '../../registry/block-registry';

afterEach(() => {
  __resetRegistryForTests();
});

describe('BlockTypePicker', () => {
  it('lists every registered block type, grouped by family, and calls onSelect', async () => {
    const onSelect = vi.fn();
    render(<BlockTypePicker trigger={<Button>Add block</Button>} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add block' }));

    expect(screen.getByText('Text')).toBeInTheDocument(); // leaf family group label
    expect(screen.getByText('Layout')).toBeInTheDocument(); // container family group label

    await userEvent.click(screen.getByRole('menuitem', { name: /Paragraph/ }));
    expect(onSelect).toHaveBeenCalledWith('paragraph');
  });

  it("picks up a future builder's registered block type without any change to this component", async () => {
    registerBlockDefinition({
      type: 'ai-suggestion',
      label: 'AI Suggestion',
      family: 'leaf',
      container: false,
      icon: Sparkles,
      description: 'A future AI Builder block type.',
      fields: [],
      defaultData: {},
    });

    const onSelect = vi.fn();
    render(<BlockTypePicker trigger={<Button>Add block</Button>} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add block' }));
    await userEvent.click(screen.getByRole('menuitem', { name: /AI Suggestion/ }));
    expect(onSelect).toHaveBeenCalledWith('ai-suggestion');
  });
});
