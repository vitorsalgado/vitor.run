import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'
import type { Post } from '../lib/posts'
import { getPosts } from '../lib/posts'

export function Blog() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPosts()
      .then(setPosts)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }, [])

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Blog</h1>
        <p className="text-red-600">Failed to load posts.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Blog</h1>
        <p className="text-slate-500">Loading…</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <PageMeta title="Blog" description="Blog posts and updates." canonicalPath="/blog" />
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-slate-500">No posts yet. Add .md files in src/content/posts/ with frontmatter (title, date, optional description).</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug} className="border-b border-slate-100 pb-6 last:border-0">
              <Link
                to={`/blog/${post.slug}`}
                className="block group"
              >
                <h2 className="text-xl font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                  {post.meta.title}
                </h2>
                <time
                  dateTime={post.meta.date}
                  className="text-sm text-slate-500 mt-1 block"
                >
                  {new Date(post.meta.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                {post.meta.description && (
                  <p className="text-slate-600 mt-2 text-sm">
                    {post.meta.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
