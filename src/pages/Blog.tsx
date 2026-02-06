import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'
import { Tags } from '../components/Tags'
import { PostIcon } from '../lib/post-icons'
import type { Post } from '../lib/posts'
import { filterPostsByTag, getAllTags, getPosts } from '../lib/posts'

export function Blog() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const tagParam = searchParams.get('tag')

  useEffect(() => {
    getPosts()
      .then(setPosts)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }, [])

  const filteredPosts = tagParam
    ? filterPostsByTag(posts, tagParam)
    : posts
  const allTags = getAllTags(posts)

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Blog</h1>
        <p className="text-red-600">Failed to load posts.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Blog</h1>
        <p className="text-neutral-500">Loading…</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <PageMeta
        title={tagParam ? `Blog — ${tagParam}` : 'Blog'}
        description={tagParam ? `Posts tagged with ${tagParam}` : 'Blog posts and updates.'}
        canonicalPath="/blog"
      />
      <h1 className="text-3xl font-bold text-neutral-900 mb-4">Blog</h1>
      <Tags tags={allTags} />
      {filteredPosts.length === 0 ? (
        <p className="text-neutral-500">
          {tagParam
            ? `No posts tagged with "${tagParam}".`
            : 'No posts yet. Add .md files in src/content/posts/ with frontmatter (title, date, optional description, tags, icon).'}
        </p>
      ) : (
        <ul className="relative space-y-4 pl-8">
          {/* Vertical line with circles at top and bottom */}
          <div
            className="absolute left-4 top-0 bottom-0 w-px bg-neutral-200"
            aria-hidden
          />
          <div
            className="absolute left-4 top-0 w-2 h-2 rounded-full border-2 border-neutral-400 bg-transparent -translate-x-1/2 -translate-y-1/2 z-10"
            aria-hidden
          />
          <div
            className="absolute left-4 bottom-0 w-2 h-2 rounded-full border-2 border-neutral-400 bg-transparent -translate-x-1/2 translate-y-1/2 z-10"
            aria-hidden
          />
          {filteredPosts.map((post) => (
            <li
              key={post.slug}
              className="border-b border-neutral-100 pb-6 last:border-0 grid grid-cols-[auto_1fr] gap-4 items-start"
            >
              <div className="flex flex-col items-start gap-2 px-4 py-3">
                <time
                  dateTime={post.meta.date}
                  className="text-sm text-neutral-500 whitespace-nowrap"
                >
                  {new Date(post.meta.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <PostIcon
                  name={post.meta.icon}
                  size={28}
                  className="text-neutral-400 shrink-0"
                />
              </div>
              <Link
                to={`/blog/${post.slug}`}
                className="block -mx-2 -my-1 px-4 py-3 rounded transition-colors hover:bg-neutral-100"
              >
                <h2 className="text-xl font-semibold text-neutral-950">
                  {post.meta.title}
                </h2>
                {post.meta.description && (
                  <p className="text-neutral-600 mt-2 text-sm">
                    {post.meta.description}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-neutral-700">
                  Read article
                  <span aria-hidden>&gt;</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
