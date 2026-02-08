import { Link, useParams, useSearchParams } from 'react-router-dom'

type TagsProps = {
  tags: string[]
}

export function Tags({ tags }: TagsProps) {
  const { tag: tagFromRoute } = useParams<{ tag?: string }>()
  const [searchParams] = useSearchParams()
  const activeTag = tagFromRoute ?? searchParams.get('tag') ?? null

  if (tags.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-2 justify-center">
        <li>
          <Link
            to="/blog"
            className={`inline-block px-3 py-1 rounded-full text-sm transition-colors ${
              !activeTag
                ? 'bg-neutral-900 !text-white dark:bg-white dark:!text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 !text-neutral-600 dark:!text-neutral-300 hover:!text-neutral-900 hover:bg-neutral-200 dark:hover:!text-neutral-100 dark:hover:bg-neutral-700'
            }`}
          >
            All
          </Link>
        </li>
        {tags.map((tag) => (
          <li key={tag}>
            <Link
              to={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
              className={`inline-block px-3 py-1 rounded-full text-sm transition-colors ${
                activeTag?.toLowerCase() === tag.toLowerCase()
                  ? 'bg-neutral-900 !text-white dark:bg-white dark:!text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 !text-neutral-600 dark:!text-neutral-300 hover:!text-neutral-900 hover:bg-neutral-200 dark:hover:!text-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              {tag}
            </Link>
          </li>
        ))}
    </ul>
  )
}
