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
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">Blog</h1>
        <p className="text-red-600 dark:text-red-400">Failed to load posts.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">Blog</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Loading…</p>
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
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Blog</h1>
      {filteredPosts.length === 0 ? (
        <div className="pl-8">
          <div className="grid grid-cols-[auto_1fr] gap-4 items-center py-8 border-b border-neutral-100 dark:border-0">
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 px-4">Tags</span>
            <Tags tags={allTags} />
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 mt-6">
            {tagParam
              ? `No posts tagged with "${tagParam}".`
              : 'No posts yet. Add .md files in src/content/posts/ with frontmatter (title, date, optional description, tags, icon).'}
          </p>
        </div>
      ) : (
        <div className="relative pl-8">
          {/* Vertical line with circles at top and bottom */}
          <div
            className="absolute left-4 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-700"
            aria-hidden
          />
          <div
            className="absolute left-4 top-0 w-2 h-2 rounded-full border-2 border-neutral-400 dark:border-neutral-500 bg-transparent -translate-x-1/2 -translate-y-1/2 z-10"
            aria-hidden
          />
          <div
            className="absolute left-4 bottom-0 w-2 h-2 rounded-full border-2 border-neutral-400 dark:border-neutral-500 bg-transparent -translate-x-1/2 translate-y-1/2 z-10"
            aria-hidden
          />
          {/* Tags row — same grid as post items */}
          <div className="grid grid-cols-[auto_1fr] gap-4 items-center py-8 border-b border-neutral-100 dark:border-0">
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 px-4">Tags</span>
            <Tags tags={allTags} />
          </div>
          <ul className="relative space-y-4 mt-0">
          {filteredPosts.map((post) => (
            <li
              key={post.slug}
              className="border-b border-neutral-100 dark:border-0 pb-6 last:border-0 grid grid-cols-[auto_1fr] gap-4 items-start"
            >
              <div className="flex flex-col items-start gap-2 px-4 py-3">
                <time
                  dateTime={post.meta.date}
                  className="text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap"
                >
                  {new Date(post.meta.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span className="flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 p-1.5 shrink-0">
                  <PostIcon
                    name={post.meta.icon}
                    size={28}
                    className="text-[var(--color-accent)]"
                  />
                </span>
              </div>
              <Link
                to={`/blog/${post.slug}`}
                className="block -mx-2 -my-1 px-4 py-3 rounded transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <h2 className="text-xl font-semibold text-neutral-950 dark:text-neutral-100">
                  {post.meta.title}
                </h2>
                {post.meta.description && (
                  <p className="text-neutral-600 dark:text-neutral-300 mt-2 text-sm">
                    {post.meta.description}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Read article
                  <span aria-hidden>&gt;</span>
                </span>
              </Link>
            </li>
          ))}
          </ul>
        </div>
      )}
    </div>
  )
}
