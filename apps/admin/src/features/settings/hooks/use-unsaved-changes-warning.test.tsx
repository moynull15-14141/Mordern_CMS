import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUnsavedChangesWarning } from './use-unsaved-changes-warning';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useUnsavedChangesWarning', () => {
  it('registers a beforeunload listener when dirty', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useUnsavedChangesWarning(true));
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('does not register a listener when not dirty', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useUnsavedChangesWarning(false));
    expect(addSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('removes the listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useUnsavedChangesWarning(true));
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('calls preventDefault when the event fires', () => {
    renderHook(() => useUnsavedChangesWarning(true));
    // jsdom's `Event` doesn't model the real `BeforeUnloadEvent.returnValue`
    // string contract (assigning `''` just triggers the generic legacy
    // boolean-cancel semantics) — `preventDefault()` is the one
    // cross-environment-reliable signal that the handler ran.
    const event = new Event('beforeunload', { cancelable: true }) as BeforeUnloadEvent;
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
