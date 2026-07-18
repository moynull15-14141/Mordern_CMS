import { describe, expect, it } from 'vitest';
import {
  SENSITIVE_SETTING_TYPES,
  SETTING_CATEGORY_LABELS,
  SETTING_CATEGORY_OPTIONS,
  SETTING_SOURCE_LABELS,
} from './settings.constants';
import type { SettingCategory } from '../types/settings';

const ALL_CATEGORIES: SettingCategory[] = [
  'general',
  'site',
  'localization',
  'security',
  'authentication',
  'media',
  'seo',
  'comments',
  'analytics',
  'email',
  'storage',
  'search',
  'ai',
  'performance',
  'feature_flags',
  'system',
  'developer',
];

describe('settings.constants', () => {
  it('SETTING_CATEGORY_LABELS has exactly the 17 real backend categories, no more, no less', () => {
    expect(Object.keys(SETTING_CATEGORY_LABELS).sort()).toEqual([...ALL_CATEGORIES].sort());
  });

  it('SETTING_CATEGORY_OPTIONS is derived 1:1 from SETTING_CATEGORY_LABELS', () => {
    expect(SETTING_CATEGORY_OPTIONS).toHaveLength(ALL_CATEGORIES.length);
    SETTING_CATEGORY_OPTIONS.forEach(({ value, label }) => {
      expect(SETTING_CATEGORY_LABELS[value]).toBe(label);
    });
  });

  it('SETTING_SOURCE_LABELS covers all 4 SettingValueSource values', () => {
    expect(SETTING_SOURCE_LABELS.RUNTIME_OVERRIDE).toBe('Runtime override');
    expect(SETTING_SOURCE_LABELS.ENVIRONMENT).toBe('Environment variable');
    expect(SETTING_SOURCE_LABELS.DATABASE).toBe('Database');
    expect(SETTING_SOURCE_LABELS.DEFAULT).toBe('System default');
  });

  it('SENSITIVE_SETTING_TYPES matches the backend SENSITIVE_SETTING_TYPES set exactly', () => {
    expect(SENSITIVE_SETTING_TYPES.has('PASSWORD')).toBe(true);
    expect(SENSITIVE_SETTING_TYPES.has('SECRET')).toBe(true);
    expect(SENSITIVE_SETTING_TYPES.has('STRING')).toBe(false);
    expect(SENSITIVE_SETTING_TYPES.size).toBe(2);
  });
});
