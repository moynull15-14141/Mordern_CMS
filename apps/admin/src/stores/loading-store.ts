import { create } from 'zustand';

/** Global loading indicator (e.g. a top-bar progress bar during a route
 * transition or a cross-cutting long-running operation) — distinct from
 * TanStack Query's own per-query isLoading, which most components should
 * prefer directly. Reference-counted so overlapping loaders don't clear
 * each other prematurely. */
interface LoadingState {
  activeCount: number;
  isLoading: boolean;
  start: () => void;
  stop: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  activeCount: 0,
  isLoading: false,
  start: () =>
    set((state) => {
      const activeCount = state.activeCount + 1;
      return { activeCount, isLoading: activeCount > 0 };
    }),
  stop: () =>
    set((state) => {
      const activeCount = Math.max(0, state.activeCount - 1);
      return { activeCount, isLoading: activeCount > 0 };
    }),
}));
