'use client';

import { useContext } from 'react';
import {
  PublicContentContext,
  type PublicContentContextValue,
} from '../providers/public-content-provider';

export function usePublicContent(): PublicContentContextValue {
  const context = useContext(PublicContentContext);
  if (!context) {
    throw new Error('usePublicContent() must be used within a <PublicContentProvider>.');
  }
  return context;
}
