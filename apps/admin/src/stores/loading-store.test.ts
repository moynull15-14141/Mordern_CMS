import { afterEach, describe, expect, it } from 'vitest';
import { useLoadingStore } from './loading-store';

afterEach(() => {
  useLoadingStore.setState({ activeCount: 0, isLoading: false });
});

describe('useLoadingStore', () => {
  it('starts with isLoading false and activeCount 0', () => {
    expect(useLoadingStore.getState().isLoading).toBe(false);
    expect(useLoadingStore.getState().activeCount).toBe(0);
  });

  it('start() increments activeCount and sets isLoading true', () => {
    useLoadingStore.getState().start();
    expect(useLoadingStore.getState().activeCount).toBe(1);
    expect(useLoadingStore.getState().isLoading).toBe(true);
  });

  it('stop() decrements activeCount and clears isLoading once it reaches 0', () => {
    useLoadingStore.getState().start();
    useLoadingStore.getState().start();
    useLoadingStore.getState().stop();
    expect(useLoadingStore.getState().activeCount).toBe(1);
    expect(useLoadingStore.getState().isLoading).toBe(true);

    useLoadingStore.getState().stop();
    expect(useLoadingStore.getState().activeCount).toBe(0);
    expect(useLoadingStore.getState().isLoading).toBe(false);
  });

  it('stop() never goes below zero', () => {
    useLoadingStore.getState().stop();
    expect(useLoadingStore.getState().activeCount).toBe(0);
    expect(useLoadingStore.getState().isLoading).toBe(false);
  });
});
