import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { BlockNodeResponsiveMeta } from '../../types/block.types';

const BREAKPOINTS: { key: keyof BlockNodeResponsiveMeta; label: string }[] = [
  { key: 'hideOnMobile', label: 'Hide on mobile' },
  { key: 'hideOnTablet', label: 'Hide on tablet' },
  { key: 'hideOnDesktop', label: 'Hide on desktop' },
];

/**
 * "Generic responsive metadata" — stores `block.meta.responsive` on every
 * block type uniformly (not per-block-type fields), so it's genuinely
 * generic rather than duplicated into each `BlockDefinition`. The backend's
 * `BlockNodeMeta` already accepts arbitrary keys inside `meta` without a
 * closed shape (`BlockTreeValidator.assertValidNode` only checks `meta` is
 * a plain object) — no backend change was needed to store this.
 *
 * **Not yet consumed by the public web renderer** (Milestone 2) — these
 * checkboxes are stored and editable, but a visitor's browser doesn't yet
 * hide anything based on them. Flagged explicitly in the milestone
 * report's "remaining work," not a silent gap.
 */
export function ResponsiveVisibilityFields({
  value,
  onChange,
}: {
  value: BlockNodeResponsiveMeta | undefined;
  onChange: (next: BlockNodeResponsiveMeta) => void;
}) {
  return (
    <fieldset className="space-y-2 border-t border-border pt-4">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Visibility
      </legend>
      {BREAKPOINTS.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-2">
          <Checkbox
            id={`responsive-${key}`}
            checked={value?.[key] === true}
            onCheckedChange={(checked) => onChange({ ...value, [key]: checked === true })}
          />
          <Label htmlFor={`responsive-${key}`} className="font-normal">
            {label}
          </Label>
        </div>
      ))}
    </fieldset>
  );
}
