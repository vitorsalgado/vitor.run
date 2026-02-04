import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PageMeta } from '../components/PageMeta'
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
        <p className="text-slate-500">Loading…</p>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-slate-500 mb-4">Post not found.</p>
        <Link to="/blog" className="text-slate-900 font-medium hover:underline">
          ← Back to Blog
        </Link>
      </div>
    )
  }

  return (
    <article className="max-w-2xl mx-auto px-6 py-16">
      <PageMeta title={post.meta.title} description={post.meta.description} canonicalPath={`/blog/${post.slug}`} />
      <Link
        to="/blog"
        className="text-sm text-slate-500 hover:text-slate-900 mb-6 inline-block"
      >
        ← Back to Blog
      </Link>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {post.meta.title}
        </h1>
        <time
          dateTime={post.meta.date}
          className="text-sm text-slate-500"
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
    </article>
  )
}
