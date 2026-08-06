import { cn } from '@/utils/cn';
import { summarizeBlock } from '../../utils/summarize-block';

export interface BlockSummaryPreviewProps {
  block: { type: string; data: Record<string, unknown>; children?: unknown[] | null };
  className?: string;
}

/** Small presentational row — icon + type label + a one-line content
 * summary — used everywhere a reusable block needs a lightweight
 * "preview" without a real render: the picker's result list, the
 * management list's table, and the Reusable Block detail/inspector page.
 * See `summarize-block.ts` for what it does and doesn't attempt. */
export function BlockSummaryPreview({ block, className }: BlockSummaryPreviewProps) {
  const summary = summarizeBlock(block);
  const Icon = summary.icon;

  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{summary.text}</span>
    </div>
  );
}
