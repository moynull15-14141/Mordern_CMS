const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/** Parses durations like "15m", "7d", "1h" into milliseconds. Deliberately
 * hand-rolled instead of adding the `ms` package — the format needed here
 * (a single integer + unit) is a few lines, not worth a new dependency. */
export function parseDurationMs(duration: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(duration.trim());
  if (!match) {
    throw new Error(`Invalid duration format: "${duration}". Expected e.g. "15m", "7d".`);
  }
  const [, amount, unit] = match;
  return Number(amount) * UNIT_MS[unit];
}

export function addDuration(duration: string, from: Date = new Date()): Date {
  return new Date(from.getTime() + parseDurationMs(duration));
}
