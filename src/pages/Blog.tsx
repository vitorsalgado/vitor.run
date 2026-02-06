import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'
import { ReadTime } from '../components/ReadTime'
import { Tags } from '../components/Tags'
import { PostIcon } from '../lib/post-icons'
import type { Post } from '../lib/posts'
import { filterPostsByTag, getAllTags, getPosts } from '../lib/posts'

export function Blog() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { tag: tagFromRoute } = useParams<{ tag: string }>()
  const tagParam = tagFromRoute ?? null

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

  const pageTitle = tagParam ? tagParam.charAt(0).toUpperCase() + tagParam.slice(1) : 'Blog'

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">{pageTitle}</h1>
        <p className="text-red-600 dark:text-red-400">Failed to load posts.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">{pageTitle}</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Loading…</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <PageMeta
        title={pageTitle}
        keywords={tagParam ? [tagParam] : []}
        description={tagParam ? `Posts tagged with ${tagParam}` : 'Blog posts and updates.'}
        canonicalPath={
          tagParam ? `/tags/${encodeURIComponent(tagParam.toLowerCase())}` : '/blog'
        }
      />
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">{pageTitle}</h1>
      {filteredPosts.length === 0 ? (
        <div className="pl-8">
          <p className="text-neutral-500 dark:text-neutral-400 mt-6">
            {tagParam
              ? `No posts tagged with "${tagParam}".`
              : 'No posts yet. Add .md files in src/content/posts/ with frontmatter (title, date, optional description, tags).'}
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {filteredPosts.map((post) => (
              <li
                key={post.slug}
                className="border-b border-neutral-100 dark:border-0 pb-6 last:border-0"
              >
                <div className="-mx-6 px-6 py-3 rounded transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <time
                    dateTime={post.meta.date}
                    className="block text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap mb-3"
                  >
                    {new Date(post.meta.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-xl font-semibold text-neutral-950 dark:text-neutral-100 mb-2 block transition-colors hover:underline hover:underline-offset-2 hover:decoration-2 hover:decoration-[var(--color-accent)]"
                  >
                    {post.meta.title}
                  </Link>
                  <div className="mb-2 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                      {post.meta.language}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500" aria-hidden>·</span>
                    <ReadTime
                      minutes={post.meta.readTimeMinutes}
                      className="text-sm text-neutral-500 dark:text-neutral-400"
                    />
                    {post.meta.tags && post.meta.tags.length > 0 && (
                      <>
                        <span className="text-slate-400 dark:text-slate-500" aria-hidden>·</span>
                        {post.meta.tags.map((tag) => (
                          <Link
                            key={tag}
                            to={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                          >
                            {tag}
                          </Link>
                        ))}
                      </>
                    )}
                    <span className="text-slate-400 dark:text-slate-500" aria-hidden>·</span>
                    <span className="flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 p-1 shrink-0">
                      <PostIcon
                        tag={post.meta.tags?.[0]}
                        size={20}
                        className="text-[var(--color-accent)]"
                      />
                    </span>
                  </div>
                  {post.meta.description && (
                    <p className="text-neutral-600 dark:text-neutral-300 mb-2 text-sm">
                      {post.meta.description}
                    </p>
                  )}
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors hover:underline hover:underline-offset-2 hover:decoration-2 hover:decoration-[var(--color-accent)]"
                  >
                    Read article
                    <span aria-hidden>&gt;</span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          {/* Separator line with three circles */}
          <div className="flex justify-center items-center py-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full border-2 border-neutral-400 dark:border-neutral-500 bg-transparent" aria-hidden />
              <div className="w-2 h-2 rounded-full border-2 border-neutral-400 dark:border-neutral-500 bg-transparent" aria-hidden />
              <div className="w-2 h-2 rounded-full border-2 border-neutral-400 dark:border-neutral-500 bg-transparent" aria-hidden />
            </div>
          </div>
          {/* Tags section - outside the container with vertical line */}
          <div className="py-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Tags</span>
              <Tags tags={allTags} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
