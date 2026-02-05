import { useEffect } from 'react'

const SITE_NAME = 'vitor.run'

type PageMetaProps = {
  title: string
  description?: string
  /** Path for canonical URL (e.g. /blog/hello-world). Uses origin from window.location. */
  canonicalPath?: string
  /** Comma-separated or array of keywords for meta keywords (e.g. post tags). */
  keywords?: string | string[]
}

/**
 * Sets document title, meta description, canonical URL, and Open Graph tags for SEO.
 * Use on each page so crawlers and social sharing get the right title/description.
 */
export function PageMeta({ title, description, canonicalPath, keywords }: PageMetaProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    const origin = window.location.origin
    const canonicalUrl = canonicalPath
      ? `${origin}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`
      : origin + window.location.pathname

    document.title = fullTitle

    const setMeta = (name: string, content: string, prop = 'name') => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${prop}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(prop, name)
        document.head.appendChild(el)
      }
      el.content = content
    }

    setMeta('description', description ?? '')
    const keywordsStr = Array.isArray(keywords) ? keywords.join(', ') : (keywords ?? '')
    const kwEl = document.querySelector<HTMLMetaElement>('meta[name="keywords"]')
    if (keywordsStr) {
      if (!kwEl) {
        const el = document.createElement('meta')
        el.name = 'keywords'
        document.head.appendChild(el)
        el.content = keywordsStr
      } else {
        kwEl.content = keywordsStr
      }
    } else if (kwEl) {
      kwEl.remove()
    }
    setMeta('og:title', fullTitle, 'property')
    setMeta('og:description', description ?? '', 'property')
    setMeta('og:url', canonicalUrl, 'property')
    setMeta('og:type', 'website', 'property')
    setMeta('twitter:card', 'summary')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', description ?? '')

    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonicalPath) {
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
      }
      link.href = canonicalUrl
    } else if (link) {
      link.remove()
    }

    return () => {
      document.title = SITE_NAME
    }
  }, [title, description, canonicalPath, keywords])

  return null
}
