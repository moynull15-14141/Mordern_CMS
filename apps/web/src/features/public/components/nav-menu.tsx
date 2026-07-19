import type { PublicMenuItem } from '../types/navigation.types';

/**
 * Recursive menu item — supports unlimited depth (milestone brief) by
 * calling itself for `item.children`. Dropdowns are pure CSS
 * (`group-hover`/`group-focus-within`), so this stays a Server Component —
 * no client JS needed for hover/keyboard-focus disclosure. The top-level
 * dropdown opens below its trigger; any deeper level flies out to the
 * right, the standard nested-dropdown convention, recursively — the same
 * positioning classes apply at every depth beyond the first.
 */
function NavMenuItem({ item, depth }: { item: PublicMenuItem; depth: number }) {
  const hasChildren = item.children.length > 0;

  return (
    <li className={depth === 0 ? 'group relative' : 'group/child relative'}>
      <a
        href={item.resolvedUrl}
        target={item.openMode === 'BLANK' ? '_blank' : undefined}
        rel={item.openMode === 'BLANK' ? 'noopener noreferrer' : undefined}
        className={
          item.cssClass ??
          'flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[var(--sportingspy-color-primary)]'
        }
      >
        {item.icon ? (
          <span aria-hidden className="text-xs">
            {item.icon}
          </span>
        ) : null}
        {item.label}
        {hasChildren ? (
          <span aria-hidden className="text-[10px]">
            ▾
          </span>
        ) : null}
      </a>

      {hasChildren ? (
        <ul
          role="menu"
          className={
            (depth === 0
              ? 'invisible absolute left-0 top-full opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100'
              : 'invisible absolute left-full top-0 opacity-0 group-hover/child:visible group-hover/child:opacity-100 group-focus-within/child:visible group-focus-within/child:opacity-100') +
            ' z-20 min-w-[12rem] rounded-[var(--sportingspy-border-radius)] border border-gray-200 bg-white py-2 shadow-lg transition'
          }
        >
          {item.children.map((child) => (
            <NavMenuItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** Renders one `PublicMenu`'s item tree — used by `Header`/`Footer`. Does
 * not fetch: `menus` is passed down from `RenderContext`, already resolved
 * by `load-render-context.ts` (Architecture Requirements: "No page should
 * know where menus come from"). */
export function NavMenu({
  items,
  className,
  orientation = 'horizontal',
}: {
  items: PublicMenuItem[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}) {
  if (items.length === 0) return null;

  return (
    <ul
      className={
        (orientation === 'horizontal' ? 'flex items-center gap-1' : 'flex flex-col gap-1') +
        (className ? ` ${className}` : '')
      }
    >
      {items.map((item) => (
        <NavMenuItem key={item.id} item={item} depth={0} />
      ))}
    </ul>
  );
}
