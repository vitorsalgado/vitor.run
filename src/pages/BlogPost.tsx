import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Link as LinkIcon, Share2, Linkedin, Twitter, Copy } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PageMeta } from '../components/PageMeta'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { ReadTime } from '../components/ReadTime'
import { NotFound } from './NotFound'
import type { Post } from '../lib/posts'
import { getPost } from '../lib/posts'

function CodeBlock({
  children,
  codeId,
  copiedCodeId,
  onCopy,
  onShowNotification,
  ...props
}: {
  children: React.ReactNode
  codeId: string
  copiedCodeId: string | null
  onCopy: () => void
  onShowNotification: () => void
} & Omit<React.HTMLAttributes<HTMLPreElement>, 'onCopy'>) {
  const preRef = useRef<HTMLPreElement>(null)

  const handleCopy = () => {
    if (preRef.current) {
      const codeElement = preRef.current.querySelector('code')
      const codeContent = codeElement?.textContent || ''
      if (codeContent) {
        navigator.clipboard.writeText(codeContent).then(() => {
          onCopy()
          onShowNotification()
        }).catch((err) => {
          console.error('Failed to copy code:', err)
        })
      }
    }
  }

  return (
    <div className="relative group">
      <pre {...props} ref={preRef} className="relative">
        {children}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-neutral-800 dark:bg-neutral-700 text-neutral-300 dark:text-neutral-400 hover:text-white dark:hover:text-neutral-100 hover:bg-neutral-700 dark:hover:bg-neutral-600 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
        aria-label={copiedCodeId === codeId ? 'Code copied' : 'Copy code'}
        title={copiedCodeId === codeId ? 'Code copied' : 'Copy code'}
      >
        {copiedCodeId === codeId ? (
          <span className="text-xs" aria-hidden>Copied!</span>
        ) : (
          <Copy size={16} strokeWidth={1.5} aria-hidden />
        )}
      </button>
    </div>
  )
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const [copyNotificationVisible, setCopyNotificationVisible] = useState(false)
  const [codeCopyNotificationVisible, setCodeCopyNotificationVisible] = useState(false)
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null)
  const shareMenuRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShareMenuOpen(false)
      }
    }
    if (shareMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [shareMenuOpen])

  const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : ''

  const copyLink = async () => {
    if (postUrl) {
      try {
        await navigator.clipboard.writeText(postUrl)
        setCopyNotificationVisible(true)
        setTimeout(() => {
          setCopyNotificationVisible(false)
        }, 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }


  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setShareMenuOpen(false)
  }

  const shareOnX = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post?.meta.title || '')}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setShareMenuOpen(false)
  }

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

  const postDate = post.meta.date ? new Date(post.meta.date) : null
  const isValidDate = postDate !== null && !isNaN(postDate.getTime())

  const postBreadcrumbList = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: 'Post', path: `/blog/${post.slug}` },
  ]

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
        breadcrumbList={postBreadcrumbList}
      />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/', isHome: true },
          { label: 'Blog', href: '/blog', ariaLabel: `Blog: ${post.meta.title}` },
          { label: 'Post', ariaLabel: post.meta.title },
        ]}
        className="mb-4"
      />
      <header className="mb-8 bg-transparent">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {post.meta.title}
        </h1>
        {post.meta.description && (
          <p className="text-lg text-slate-600 dark:text-slate-300 font-normal mb-2 leading-relaxed">
            {post.meta.description}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {isValidDate && postDate && post.meta.date && (
            <>
              <time
                dateTime={post.meta.date}
                className="text-sm text-slate-500 dark:text-slate-400"
              >
                {postDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span className="text-slate-400 dark:text-slate-500" aria-hidden>·</span>
            </>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
            {post.meta.language}
          </span>
          <span className="text-slate-400 dark:text-slate-500" aria-hidden>·</span>
          <ReadTime
            minutes={post.meta.readTimeMinutes}
            className="text-sm text-slate-500 dark:text-slate-400"
          />
          <span className="text-slate-400 dark:text-slate-500" aria-hidden>·</span>
          <div className="flex items-center gap-2 relative" ref={shareMenuRef}>
            <button
              type="button"
              onClick={copyLink}
              className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Copy post link"
            >
              <LinkIcon size={18} strokeWidth={1.5} />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShareMenuOpen(!shareMenuOpen)}
                className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Share post"
                aria-haspopup="menu"
                aria-expanded={shareMenuOpen}
              >
                <Share2 size={18} strokeWidth={1.5} aria-hidden />
              </button>
              {shareMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg py-1 min-w-[140px] z-10"
                  aria-label="Share options"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={shareOnLinkedIn}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 transition-colors"
                  >
                    <Linkedin size={16} strokeWidth={1.5} aria-hidden />
                    LinkedIn
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={shareOnX}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 transition-colors"
                  >
                    <Twitter size={16} strokeWidth={1.5} aria-hidden />
                    X
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="prose prose-slate">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: 'h1',
            h2: 'h2',
            h3: 'h3',
            h4: 'h4',
            h5: 'h5',
            h6: 'h6',
            pre: ({ children, ...props }: React.ComponentProps<'pre'>) => {
              const codeId = `code-${Math.random().toString(36).substring(2, 9)}`
              const handleCopy = () => {
                setCopiedCodeId(codeId)
                setTimeout(() => {
                  setCopiedCodeId(null)
                }, 2000)
              }
              // Extract onCopy if it exists to avoid conflict with our custom onCopy handler
              const { onCopy: _ignoredOnCopy, ...restProps } = props as { onCopy?: unknown; [key: string]: unknown }
              void _ignoredOnCopy // Explicitly mark as intentionally unused
              return (
                <CodeBlock
                  codeId={codeId}
                  copiedCodeId={copiedCodeId}
                  onCopy={handleCopy}
                  onShowNotification={() => {
                    setCodeCopyNotificationVisible(true)
                    setTimeout(() => {
                      setCodeCopyNotificationVisible(false)
                    }, 2000)
                  }}
                  {...(restProps as Omit<React.HTMLAttributes<HTMLPreElement>, 'onCopy'>)}
                >
                  {children}
                </CodeBlock>
              )
            },
          } as Components}
        >
          {post.content}
        </ReactMarkdown>
      </div>
      {post.meta.tags && post.meta.tags.length > 0 && (
        <footer className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 text-center sm:text-left">
          <nav aria-label="Post tags">
            <ul className="flex flex-wrap gap-2 list-none p-0 m-0 justify-center sm:justify-start">
              {post.meta.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    to={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
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
      {copyNotificationVisible && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2 rounded-md shadow-lg text-sm font-medium">
            Link copied!
          </div>
        </div>
      )}
      {codeCopyNotificationVisible && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2 rounded-md shadow-lg text-sm font-medium">
            Code copied!
          </div>
        </div>
      )}
    </article>
  )
}
