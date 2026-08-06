import { afterEach, describe, expect, it } from 'vitest';
import {
  __resetRegistryForTests,
  getBlockDefinition,
  isContainerBlockType,
  listBlockDefinitions,
  registerBlockDefinition,
} from './block-registry';
import { BLOCK_TYPES } from '../types/block.types';
import { Sparkles } from 'lucide-react';

describe('block-registry', () => {
  afterEach(() => {
    __resetRegistryForTests();
  });

  it('seeds all 25 built-in block types at import time', () => {
    const types = listBlockDefinitions().map((d) => d.type);
    for (const type of BLOCK_TYPES) {
      expect(types).toContain(type);
    }
  });

  it('resolves a built-in definition by type', () => {
    expect(getBlockDefinition('paragraph')?.label).toBe('Paragraph');
  });

  it('returns undefined for an unregistered type', () => {
    expect(getBlockDefinition('not-a-real-type')).toBeUndefined();
  });

  it('isContainerBlockType reflects the definition, not a hardcoded list', () => {
    expect(isContainerBlockType('columns')).toBe(true);
    expect(isContainerBlockType('paragraph')).toBe(false);
    expect(isContainerBlockType('not-a-real-type')).toBe(false);
  });

  it('lets a future builder register a new block type without editing this file', () => {
    registerBlockDefinition({
      type: 'ai-suggestion',
      label: 'AI Suggestion',
      family: 'leaf',
      container: false,
      icon: Sparkles,
      description: 'A future AI Builder block type.',
      fields: [],
      defaultData: {},
    });

    expect(getBlockDefinition('ai-suggestion')?.label).toBe('AI Suggestion');
    expect(listBlockDefinitions().map((d) => d.type)).toContain('ai-suggestion');
  });

  it('lets a consumer intentionally override a built-in definition', () => {
    registerBlockDefinition({
      type: 'image',
      label: 'Themed Image',
      family: 'media',
      container: false,
      icon: Sparkles,
      description: 'A Theme Builder override of the built-in image block.',
      fields: [],
      defaultData: {},
    });

    expect(getBlockDefinition('image')?.label).toBe('Themed Image');
  });
});
