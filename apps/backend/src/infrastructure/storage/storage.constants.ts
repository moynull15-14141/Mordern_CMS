/**
 * DI token for `StorageProvider` — the first custom-token binding in this
 * codebase (see `storage.module.ts`'s doc comment). A Symbol, not a string,
 * to avoid any accidental collision with an unrelated string-keyed provider.
 */
export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
