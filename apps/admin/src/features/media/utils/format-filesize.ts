/** `Media.filesize` is a BigInt serialized as a decimal string
 * (`MediaResponseDto`'s own doc comment) — formatted here for display only,
 * never parsed back into a number for anything sent to the API. */
export function formatFileSize(filesize: string): string {
  let bytes: bigint;
  try {
    bytes = BigInt(filesize);
  } catch {
    return filesize;
  }

  if (bytes < 1024n) return `${bytes} B`;

  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = Number(bytes) / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
}
