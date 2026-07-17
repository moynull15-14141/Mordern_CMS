import { describe, expect, it } from 'vitest';
import { PERMISSIONS, SYSTEM_ROLES } from './permissions';

describe('PERMISSIONS', () => {
  it("mirrors the backend's frozen 21-key vocabulary exactly", () => {
    expect(Object.keys(PERMISSIONS)).toHaveLength(21);
  });

  it('has no duplicate permission string values', () => {
    const values = Object.values(PERMISSIONS);
    expect(new Set(values).size).toBe(values.length);
  });

  it('uses lowercase dot-notation values matching the backend format', () => {
    Object.values(PERMISSIONS).forEach((value) => {
      expect(value).toMatch(/^[a-z]+\.[a-z]+$/);
    });
  });
});

describe('SYSTEM_ROLES', () => {
  it("mirrors the backend's frozen 11 system roles exactly", () => {
    expect(Object.keys(SYSTEM_ROLES)).toHaveLength(11);
  });

  it('has no duplicate role display values', () => {
    const values = Object.values(SYSTEM_ROLES);
    expect(new Set(values).size).toBe(values.length);
  });
});
