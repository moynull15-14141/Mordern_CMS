import Link from 'next/link';

export interface ThemeBreadcrumbItem {
  label: string;
  href?: string;
}

/** Breadcrumb trail — the last item is always rendered as plain text
 * (the current page), every earlier item as a link, matching standard
 * breadcrumb semantics (`aria-current="page"` on the last item). */
export function ThemeBreadcrumb({ items }: { items: ThemeBreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 text-sm text-[var(--sportingspy-color-muted)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-x-2">
              {index > 0 ? <span aria-hidden>/</span> : null}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="text-[var(--sportingspy-color-text)]"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-[var(--sportingspy-color-primary)] hover:underline"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
