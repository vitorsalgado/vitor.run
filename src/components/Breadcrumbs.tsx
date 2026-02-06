import { Link } from 'react-router-dom'
import { Home, ChevronRight } from 'lucide-react'

export type BreadcrumbItem = {
  /** Visible label (use "Post" for blog post page, not the post title). */
  label: string
  /** Link href; omit for current page. */
  href?: string
  /** Accessible name (e.g. post title for current "Post" item, or "Blog: Post title" for Blog link on post page). */
  ariaLabel?: string
  /** Render as Home icon instead of text. */
  isHome?: boolean
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Breadcrumb trail with Tailwind styling (simple with chevrons).
 * Home is rendered as an icon. Place above page titles.
 */
export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isCurrentPage = isLast && !item.href
          const accessibleName = item.ariaLabel ?? (item.isHome ? 'Home' : item.label)

          return (
            <li key={index} className="flex items-center gap-x-2">
              {index > 0 && (
                <ChevronRight
                  size={16}
                  strokeWidth={2}
                  className="shrink-0 text-neutral-400 dark:text-neutral-500"
                  aria-hidden
                />
              )}
              {item.href != null ? (
                <Link
                  to={item.href}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
                  aria-label={accessibleName}
                >
                  {item.isHome ? (
                    <Home size={16} strokeWidth={1.5} aria-hidden />
                  ) : (
                    item.label
                  )}
                </Link>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 font-medium text-neutral-900 dark:text-neutral-100"
                  aria-current={isCurrentPage ? 'page' : undefined}
                  aria-label={accessibleName}
                >
                  {item.isHome ? (
                    <Home size={16} strokeWidth={1.5} aria-hidden />
                  ) : (
                    item.label
                  )}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
