import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { SettingsProvider, useAppSettings } from './settings-provider';

describe('SettingsProvider / useAppSettings', () => {
  it('defaults tableDensity to "comfortable"', () => {
    const { result } = renderHook(() => useAppSettings(), { wrapper: SettingsProvider });
    expect(result.current.settings.tableDensity).toBe('comfortable');
  });

  it('setTableDensity() updates the setting', () => {
    const { result } = renderHook(() => useAppSettings(), { wrapper: SettingsProvider });
    act(() => result.current.setTableDensity('compact'));
    expect(result.current.settings.tableDensity).toBe('compact');
  });

  it('throws when used outside a SettingsProvider', () => {
    expect(() => renderHook(() => useAppSettings())).toThrow(
      'useAppSettings() must be used within a <SettingsProvider>.'
    );
  });
});
