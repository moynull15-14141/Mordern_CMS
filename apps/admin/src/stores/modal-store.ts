import { create } from 'zustand';
import type { ReactNode } from 'react';

interface ModalEntry {
  id: string;
  content: ReactNode;
}

interface ModalState {
  stack: ModalEntry[];
  open: (id: string, content: ReactNode) => void;
  close: (id: string) => void;
  closeAll: () => void;
}

/** Client-only, no server representation — a valid Zustand use case
 * (docs/56 "State Management"). Backs the Modal Provider's imperative
 * `useModal()` API. */
export const useModalStore = create<ModalState>((set) => ({
  stack: [],
  open: (id, content) =>
    set((state) => ({
      stack: [...state.stack.filter((entry) => entry.id !== id), { id, content }],
    })),
  close: (id) => set((state) => ({ stack: state.stack.filter((entry) => entry.id !== id) })),
  closeAll: () => set({ stack: [] }),
}));
