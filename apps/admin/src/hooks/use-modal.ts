'use client';

import type { ReactNode } from 'react';
import { useModalStore } from '@/stores/modal-store';

export function useModal() {
  const open = useModalStore((state) => state.open);
  const close = useModalStore((state) => state.close);
  const closeAll = useModalStore((state) => state.closeAll);

  return { open: (id: string, content: ReactNode) => open(id, content), close, closeAll };
}
