import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PageMeta } from '../components/PageMeta'
import { NotFound } from './NotFound'
import type { Post } from '../lib/posts'
import { getPost } from '../lib/posts'

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) {
      queueMicrotask(() => {
        setNotFound(true)
        setLoading(false)
      })
      return
    }
    getPost(slug)
      .then((p) => {
        if (p) setPost(p)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-slate-500 dark:text-slate-400">Loading…</p>
      </div>
    )
  }

  if (notFound || !post) {
    return <NotFound />
  }

  return (
    <article className="max-w-2xl mx-auto px-6 py-16">
      <PageMeta
        title={post.meta.title}
        description={post.meta.description}
        canonicalPath={`/blog/${post.slug}`}
        keywords={post.meta.tags}
        type="article"
        publishedTime={post.meta.date ? new Date(post.meta.date).toISOString() : undefined}
        section="Blog"
      />
      <Link
        to="/blog"
        className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6 inline-block"
      >
        ← Back to Blog
      </Link>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {post.meta.title}
        </h1>
        {post.meta.description && (
          <p className="text-lg text-slate-600 dark:text-slate-300 font-normal mb-2 leading-relaxed">
            {post.meta.description}
          </p>
        )}
        <time
          dateTime={post.meta.date}
          className="text-sm text-slate-500 dark:text-slate-400"
        >
          {new Date(post.meta.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </header>
      <div className="prose prose-slate">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: 'h2',
            h2: 'h3',
            h3: 'h4',
            h4: 'h5',
            h5: 'h6',
            h6: 'p',
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
      {post.meta.tags && post.meta.tags.length > 0 && (
        <footer className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
          <nav aria-label="Post tags">
            <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
              {post.meta.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    to={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="inline-block px-3 py-1 rounded-full text-sm transition-colors bg-neutral-100 dark:bg-neutral-800 !text-neutral-600 dark:!text-neutral-300 hover:!text-neutral-900 hover:bg-neutral-200 dark:hover:!text-neutral-100 dark:hover:bg-neutral-700"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </footer>
      )}
    </article>
  )
}
