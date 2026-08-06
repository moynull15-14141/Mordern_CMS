import type { BlockDefinition } from './block-definition.types';
import { BUILT_IN_BLOCK_DEFINITIONS } from './block-definitions';

/**
 * Open registry — module-level `Map`, seeded with the 25 built-ins at
 * import time, extendable at runtime via `registerBlockDefinition`. This
 * is the literal mechanism behind "future builders must be able to reuse
 * the exact same editor without modification": a Theme Builder or AI
 * Builder registers its own block type(s) once (e.g. in its own module's
 * top-level side effect, mirroring how this file seeds the built-ins)
 * and every generic subsystem — property panel, block picker, canvas,
 * validation — picks it up automatically, since none of them hardcode
 * the built-in list; they all call `listBlockDefinitions`/`getBlockDefinition`.
 */
const registry = new Map<string, BlockDefinition>();

for (const definition of BUILT_IN_BLOCK_DEFINITIONS) {
  registry.set(definition.type, definition);
}

/** Registering a type that's already registered overwrites it — lets a
 * consumer intentionally override a built-in (e.g. a Theme Builder that
 * wants its own "image" block with extra fields) without forking this
 * feature. */
export function registerBlockDefinition(definition: BlockDefinition): void {
  registry.set(definition.type, definition);
}

export function getBlockDefinition(type: string): BlockDefinition | undefined {
  return registry.get(type);
}

export function listBlockDefinitions(): BlockDefinition[] {
  return Array.from(registry.values());
}

export function isContainerBlockType(type: string): boolean {
  return registry.get(type)?.container ?? false;
}

/** Test-only escape hatch — resets the registry back to just the 25
 * built-ins, so one test's `registerBlockDefinition` call can't leak into
 * another test file (the registry is module-level, shared singleton
 * state, same caveat any module-level cache carries). */
export function __resetRegistryForTests(): void {
  registry.clear();
  for (const definition of BUILT_IN_BLOCK_DEFINITIONS) {
    registry.set(definition.type, definition);
  }
}
