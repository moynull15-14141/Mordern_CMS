'use client';

import { useState } from 'react';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export const DEVICE_CANVAS_WIDTHS: Record<DeviceMode, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

/** Purely a visual container-width toggle for the canvas — never a
 * second responsive system. The underlying page markup is identical
 * regardless of `device`; only this wrapper's `max-width` changes, the
 * same technique the Pattern preview iframe already uses (Milestone 6). */
export function useDevicePreview() {
  const [device, setDevice] = useState<DeviceMode>('desktop');
  return { device, setDevice };
}
