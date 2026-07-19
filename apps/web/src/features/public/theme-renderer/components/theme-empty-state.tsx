/** Generic "nothing here" message — the themed equivalent of the ad-hoc
 * empty-state text `blog-list-renderer.tsx` (13.3) hardcodes inline. */
export function ThemeEmptyState({ message }: { message: string }) {
  return (
    <p
      role="status"
      className="rounded-[var(--sportingspy-radius,0.5rem)] border border-dashed border-[var(--sportingspy-color-border)] p-6 text-center text-sm text-[var(--sportingspy-color-muted)]"
    >
      {message}
    </p>
  );
}
