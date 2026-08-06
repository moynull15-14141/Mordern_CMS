import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { BlockDropZone } from './block-drop-zone';

describe('BlockDropZone', () => {
  it('renders a droppable target for the given parent', () => {
    render(
      <DndContext>
        <BlockDropZone parentId="container-1" />
      </DndContext>
    );
    expect(screen.getByTestId('drop-zone-container-1')).toBeInTheDocument();
    expect(screen.getByText('Drop a block here')).toBeInTheDocument();
  });
});
