import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DefaultLayout } from './default-layout';
import { NoSidebarLayout } from './no-sidebar-layout';
import { FullWidthLayout } from './full-width-layout';
import { BoxedLayout } from './boxed-layout';
import { CenteredLayout } from './centered-layout';
import { SidebarLeftLayout } from './sidebar-left-layout';
import { SidebarRightLayout } from './sidebar-right-layout';
import type { ThemeLayoutComponent } from './layout-types';

const baseSlots = {
  header: <div>HEADER</div>,
  content: <div>CONTENT</div>,
  footer: <div>FOOTER</div>,
};

describe('Layout components (shared behavior)', () => {
  const layouts: Array<[string, ThemeLayoutComponent]> = [
    ['DefaultLayout', DefaultLayout],
    ['NoSidebarLayout', NoSidebarLayout],
    ['FullWidthLayout', FullWidthLayout],
    ['BoxedLayout', BoxedLayout],
    ['CenteredLayout', CenteredLayout],
    ['SidebarLeftLayout', SidebarLeftLayout],
    ['SidebarRightLayout', SidebarRightLayout],
  ];

  it.each(layouts)('%s renders header, content, and footer slots', (_name, Layout) => {
    render(<Layout slots={baseSlots} theme={null} />);
    expect(screen.getByText('HEADER')).toBeInTheDocument();
    expect(screen.getByText('CONTENT')).toBeInTheDocument();
    expect(screen.getByText('FOOTER')).toBeInTheDocument();
  });

  it.each(layouts)(
    '%s never renders the hero/sidebar/footerCta slots when omitted',
    (_name, Layout) => {
      render(<Layout slots={baseSlots} theme={null} />);
      expect(document.querySelector('[data-slot="hero"]')).toBeNull();
      expect(document.querySelector('[data-slot="footerCta"]')).toBeNull();
    }
  );
});

describe('DefaultLayout / NoSidebarLayout', () => {
  it('never render the sidebar slot even when content is supplied for it', () => {
    render(<DefaultLayout slots={{ ...baseSlots, sidebar: <div>SIDEBAR</div> }} theme={null} />);
    expect(screen.queryByText('SIDEBAR')).not.toBeInTheDocument();

    render(<NoSidebarLayout slots={{ ...baseSlots, sidebar: <div>SIDEBAR</div> }} theme={null} />);
    expect(screen.queryAllByText('SIDEBAR')).toHaveLength(0);
  });
});

describe('SidebarLeftLayout / SidebarRightLayout', () => {
  it('render the sidebar slot when supplied', () => {
    render(
      <SidebarLeftLayout slots={{ ...baseSlots, sidebar: <div>SIDEBAR</div> }} theme={null} />
    );
    expect(screen.getByText('SIDEBAR')).toBeInTheDocument();
  });

  it('render a single-column grid (no sidebar column) when sidebar is not supplied', () => {
    const { container } = render(<SidebarLeftLayout slots={baseSlots} theme={null} />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid?.className).not.toContain('lg:grid-cols-');
  });

  it('SidebarLeftLayout places the sidebar before content in DOM order', () => {
    const { container } = render(
      <SidebarLeftLayout
        slots={{ ...baseSlots, sidebar: <div data-testid="sidebar-marker">S</div> }}
        theme={null}
      />
    );
    const grid = container.querySelector('.grid')!;
    const [first] = Array.from(grid.children);
    expect(first).toHaveAttribute('data-slot', 'sidebar');
  });

  it('SidebarRightLayout places the sidebar after content in DOM order', () => {
    const { container } = render(
      <SidebarRightLayout
        slots={{ ...baseSlots, sidebar: <div data-testid="sidebar-marker">S</div> }}
        theme={null}
      />
    );
    const grid = container.querySelector('.grid')!;
    const children = Array.from(grid.children);
    expect(children[children.length - 1]).toHaveAttribute('data-slot', 'sidebar');
  });
});

describe('BoxedLayout', () => {
  it('wraps content in a bordered box', () => {
    const { container } = render(<BoxedLayout slots={baseSlots} theme={null} />);
    expect(container.querySelector('.border')).not.toBeNull();
  });
});

describe('CenteredLayout', () => {
  it('constrains content to a narrower centered column', () => {
    const { container } = render(<CenteredLayout slots={baseSlots} theme={null} />);
    expect(container.querySelector('.max-w-2xl')).not.toBeNull();
  });
});

describe('FullWidthLayout', () => {
  it('does not apply the container-page max-width class', () => {
    const { container } = render(<FullWidthLayout slots={baseSlots} theme={null} />);
    expect(container.querySelector('.container-page')).toBeNull();
  });
});

describe('ThemeLayoutShell (via any layout) — CSS variable application', () => {
  it('applies the extended theme CSS variables on its own wrapper', () => {
    const theme = {
      id: 't1',
      name: 'Theme',
      slug: 'theme',
      version: null,
      logo: null,
      favicon: null,
      colors: { primary: '#123456', secondary: '#abcdef' },
      typography: null,
      layout: {
        header: null,
        footer: null,
        containerWidth: null,
        borderRadius: '1rem',
        buttonStyle: null,
        homepage: null,
        blog: null,
      },
      customCss: null,
      customJs: null,
    };
    render(<DefaultLayout slots={baseSlots} theme={theme} />);
    const shell = screen.getByTestId('theme-layout-shell');
    expect(shell.style.getPropertyValue('--sportingspy-color-primary')).toBe('#123456');
    expect(shell.style.getPropertyValue('--sportingspy-color-accent')).toBe('#abcdef');
    expect(shell.style.getPropertyValue('--sportingspy-radius')).toBe('1rem');
  });
});
