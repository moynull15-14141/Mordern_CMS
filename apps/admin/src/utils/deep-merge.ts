type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Recursive merge of plain objects (arrays are replaced, not merged —
 * matching PATCH-semantics expectations used throughout this app's forms,
 * see docs/59_FRONTEND_CODING_GUIDELINES.md "Form System"). Does not
 * mutate either input. */
export function deepMerge<T extends PlainObject>(target: T, source: PlainObject): T {
  const result: PlainObject = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  }

  return result as T;
}
