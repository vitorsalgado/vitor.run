import { Link, useSearchParams } from 'react-router-dom'

type TagsProps = {
  tags: string[]
}

export function Tags({ tags }: TagsProps) {
  const [searchParams] = useSearchParams()
  const activeTag = searchParams.get('tag')

  if (tags.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-sm font-medium text-slate-500 mb-3">Tags</h2>
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            to="/blog"
            className={`inline-block px-3 py-1 rounded-full text-sm transition-colors ${
              !activeTag
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </Link>
        </li>
        {tags.map((tag) => (
          <li key={tag}>
            <Link
              to={`/blog?tag=${encodeURIComponent(tag)}`}
              className={`inline-block px-3 py-1 rounded-full text-sm transition-colors ${
                activeTag?.toLowerCase() === tag.toLowerCase()
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
