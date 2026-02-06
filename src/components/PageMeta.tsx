import { useEffect } from 'react'
import { SITE } from '../lib/site'

export type PageType = 'website' | 'article'

export type PageMetaProps = {
  /** Page title (preferred: short, descriptive). Document title becomes "${title} | ${siteName}". */
  title: string
  /** Meta description (SEO and social). */
  description?: string
  /** Canonical path (e.g. /blog/my-post). Absolute URL is built from origin. */
  canonicalPath?: string
  /** Keywords for meta keywords and, when type is article, og:tag / article:tag. */
  keywords: string[]
  /** Page type: website (default) or article (blog post). */
  type?: PageType
  /** Image path or absolute URL for og:image. Overrides site default. */
  image?: string
  /** Locale override (e.g. en_US). */
  locale?: string
  /** For article: author name. Defaults to site author. */
  author?: string
  /** For article: ISO 8601 published time. */
  publishedTime?: string
  /** For article: ISO 8601 last modified time. */
  modifiedTime?: string
  /** For article: section (e.g. "Blog"). */
  section?: string
  /** Breadcrumb trail for BreadcrumbList JSON-LD and optional UI. Each item: { name, path }. */
  breadcrumbList?: { name: string; path: string }[]
}

const JSON_LD_SCRIPT_ID = 'page-jsonld'
const BREADCRUMB_JSON_LD_SCRIPT_ID = 'page-breadcrumb-jsonld'

function toAbsoluteUrl(pathOrUrl: string, origin: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${origin}${path}`
}

function buildJsonLd(
  type: 'website' | 'article',
  origin: string,
  opts: {
    title: string
    fullTitle: string
    description: string
    canonicalUrl: string
    author: string
    imageUrl: string
    publishedTime?: string
    modifiedTime?: string
    keywords: string[]
  }
): string {
  const personUrl = origin.replace(/\/$/, '')
  const person: Record<string, unknown> = {
    '@type': 'Person',
    name: opts.author,
    url: personUrl,
  }
  if (SITE.sameAs?.length) {
    person.sameAs = SITE.sameAs
  }

  if (type === 'article') {
    const article: Record<string, unknown> = {
      '@type': 'BlogPosting',
      '@id': `${opts.canonicalUrl}#article`,
      mainEntityOfPage: { '@id': opts.canonicalUrl },
      headline: opts.title,
      description: opts.description,
      author: person,
      publisher: { ...person, '@type': 'Person' },
      datePublished: opts.publishedTime ?? undefined,
      dateModified: opts.modifiedTime ?? opts.publishedTime ?? undefined,
      url: opts.canonicalUrl,
    }
    if (opts.imageUrl) article.image = opts.imageUrl
    if (opts.keywords?.length) article.keywords = opts.keywords.join(', ')
    return JSON.stringify(article)
  }

  const webSite: Record<string, unknown> = {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    name: SITE.name,
    url: origin,
    description: opts.description || `${SITE.name} — ${opts.author}`,
    publisher: person,
    inLanguage: SITE.locale,
  }
  return JSON.stringify(webSite)
}

function buildBreadcrumbListJsonLd(
  origin: string,
  items: { name: string; path: string }[]
): string {
  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem' as const,
    position: index + 1,
    name: item.name,
    item: toAbsoluteUrl(item.path.startsWith('/') ? item.path : `/${item.path}`, origin),
  }))
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  })
}

/**
 * Sets document title and comprehensive meta tags for SEO and social sharing:
 * - Standard: title, description, keywords, canonical
 * - Open Graph (og:*)
 * - Dublin Core (DC.*)
 * - Article (article:*) when type is "article"
 */
export function PageMeta({
  title,
  description = '',
  canonicalPath,
  keywords,
  type = 'website',
  image,
  locale = SITE.locale,
  author = SITE.author,
  publishedTime,
  modifiedTime,
  section = 'blog',
  breadcrumbList,
}: PageMetaProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE.name}` : SITE.name
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const canonicalUrl = canonicalPath
      ? toAbsoluteUrl(canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`, origin)
      : origin + (typeof window !== 'undefined' ? window.location.pathname : '')

    document.title = fullTitle

    const keywordsStr = keywords?.join(', ')

    const imageUrl =
      (image && toAbsoluteUrl(image, origin)) ||
      (SITE.image && toAbsoluteUrl(SITE.image, origin)) ||
      ''

    const setMeta = (nameOrProp: string, content: string, attribute: 'name' | 'property' = 'name') => {
      const selector = `meta[${attribute}="${nameOrProp}"]`
      let el = document.querySelector<HTMLMetaElement>(selector)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attribute, nameOrProp)
        document.head.appendChild(el)
      }
      el.content = content
    }

    const removeMeta = (nameOrProp: string, attribute: 'name' | 'property' = 'name') => {
      const el = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${nameOrProp}"]`)
      if (el) el.remove()
    }

    // —— Standard ——
    setMeta('description', description)
    if (keywordsStr) {
      setMeta('keywords', keywordsStr)
    } else {
      removeMeta('keywords')
    }

    // —— Canonical ——
    let linkEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonicalPath && origin) {
      if (!linkEl) {
        linkEl = document.createElement('link')
        linkEl.rel = 'canonical'
        document.head.appendChild(linkEl)
      }
      linkEl.href = canonicalUrl
    } else if (linkEl) {
      linkEl.remove()
    }

    // —— Open Graph ——
    setMeta('og:title', fullTitle, 'property')
    setMeta('og:description', description, 'property')
    setMeta('og:url', canonicalUrl, 'property')
    setMeta('og:type', type, 'property')
    setMeta('og:site_name', SITE.name, 'property')
    setMeta('og:locale', locale, 'property')
    if (imageUrl) {
      setMeta('og:image', imageUrl, 'property')
    } else {
      removeMeta('og:image', 'property')
    }

    // —— Dublin Core ——
    setMeta('DC.title', fullTitle)
    setMeta('DC.creator', author)
    setMeta('DC.description', description)
    setMeta('DC.type', type === 'article' ? 'Text' : 'Text')
    if (type === 'article' && publishedTime) {
      setMeta('DC.date.issued', publishedTime)
      if (modifiedTime) setMeta('DC.date.modified', modifiedTime)
    } else {
      setMeta('DC.date', new Date().toISOString().slice(0, 10))
    }

    // —— Article (only for type article) ——
    if (type === 'article') {
      if (publishedTime) setMeta('article:published_time', publishedTime, 'property')
      if (modifiedTime) setMeta('article:modified_time', modifiedTime, 'property')
      if (author) setMeta('article:author', author, 'property')
      if (section) setMeta('article:section', section, 'property')
      keywords?.forEach((tag) => setMeta('article:tag', tag, 'property'))
    }

    // —— JSON-LD (application/ld+json) ——
    const jsonLd = buildJsonLd(type, origin, {
      title,
      fullTitle,
      description,
      canonicalUrl,
      author,
      imageUrl,
      publishedTime,
      modifiedTime,
      keywords,
    })
    let scriptEl = document.getElementById(JSON_LD_SCRIPT_ID) as HTMLScriptElement | null
    if (!scriptEl) {
      scriptEl = document.createElement('script')
      scriptEl.id = JSON_LD_SCRIPT_ID
      scriptEl.type = 'application/ld+json'
      document.head.appendChild(scriptEl)
    }
    scriptEl.textContent = jsonLd

    // —— BreadcrumbList JSON-LD ——
    let breadcrumbScriptEl = document.getElementById(BREADCRUMB_JSON_LD_SCRIPT_ID) as HTMLScriptElement | null
    if (breadcrumbList?.length && origin) {
      const breadcrumbJsonLd = buildBreadcrumbListJsonLd(origin, breadcrumbList)
      if (!breadcrumbScriptEl) {
        breadcrumbScriptEl = document.createElement('script')
        breadcrumbScriptEl.id = BREADCRUMB_JSON_LD_SCRIPT_ID
        breadcrumbScriptEl.type = 'application/ld+json'
        document.head.appendChild(breadcrumbScriptEl)
      }
      breadcrumbScriptEl.textContent = breadcrumbJsonLd
    } else if (breadcrumbScriptEl) {
      breadcrumbScriptEl.remove()
      breadcrumbScriptEl = null
    }

    return () => {
      document.title = SITE.name
      const script = document.getElementById(JSON_LD_SCRIPT_ID)
      if (script) script.remove()
      const bcScript = document.getElementById(BREADCRUMB_JSON_LD_SCRIPT_ID)
      if (bcScript) bcScript.remove()
    }
  }, [
    title,
    description,
    canonicalPath,
    keywords,
    type,
    image,
    locale,
    author,
    publishedTime,
    modifiedTime,
    section,
    breadcrumbList,
  ])

  return null
}
