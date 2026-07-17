import { afterEach, describe, expect, it } from 'vitest';
import { useUiStore } from './ui-store';

afterEach(() => {
  useUiStore.setState({ sidebarCollapsed: false, mobileDrawerOpen: false });
});

describe('useUiStore', () => {
  it('starts with the sidebar expanded and the mobile drawer closed', () => {
    expect(useUiStore.getState().sidebarCollapsed).toBe(false);
    expect(useUiStore.getState().mobileDrawerOpen).toBe(false);
  });

  it('toggleSidebar() flips sidebarCollapsed', () => {
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarCollapsed).toBe(true);
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarCollapsed).toBe(false);
  });

  it('setSidebarCollapsed() sets an explicit value', () => {
    useUiStore.getState().setSidebarCollapsed(true);
    expect(useUiStore.getState().sidebarCollapsed).toBe(true);
  });

  it('setMobileDrawerOpen() sets an explicit value', () => {
    useUiStore.getState().setMobileDrawerOpen(true);
    expect(useUiStore.getState().mobileDrawerOpen).toBe(true);
  });
});
