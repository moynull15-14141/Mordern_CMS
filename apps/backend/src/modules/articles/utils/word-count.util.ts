/**
 * `ArticleRevision` has no stored `wordCount` column (unlike `Article`,
 * which does) — this is a rough, good-enough approximation computed from
 * the revision's JSON body for metadata-comparison purposes only ("no
 * visual diff" per the milestone brief, so exactness isn't the goal).
 */
export function computeWordCount(body: unknown): number {
  const text = extractText(body);
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function extractText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(extractText).join(' ');
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map(extractText)
      .join(' ');
  }
  return '';
}
