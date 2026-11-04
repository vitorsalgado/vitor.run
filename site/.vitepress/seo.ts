import type { HeadConfig, PageData } from 'vitepress'
import { SITE, siteUrl } from '../../src/lib/site.ts'

export function applyPageSeo(page: PageData, production: boolean) {
  if (page.isNotFound || page.relativePath === '404.md') {
    page.frontmatter.head = [['meta', { name: 'robots', content: 'noindex, nofollow' }]]
    return
  }
  const meta = page.frontmatter
  const tag = typeof page.params?.tag === 'string' ? page.params.tag : undefined
  if (tag) {
    page.title = tag
    page.description = `Posts tagged with ${tag}.`
  }
  const article = Boolean(page.params?.slug)
  if (article) page.title = String(meta.title)
  const language = article ? String(meta.language) : SITE.language
  const canonical = siteUrl(`/${page.relativePath.replace(/index\.md$/, '')}`)
  const description =
    page.description?.trim() ||
    (article ? `Read ${page.title} by ${SITE.author}.` : SITE.description)
  const title = `${page.title} | ${SITE.name}`
  const tags: string[] = article ? meta.tags : tag ? [tag] : []
  const image = siteUrl(SITE.image)
  const locale = new Intl.Locale(language).maximize()
  page.description = description
  meta.description = description
  meta.lang = language

  const authorId = siteUrl('/#author')
  const websiteId = siteUrl('/#website')
  const breadcrumbs = [{ name: 'Home', url: siteUrl('/') }]
  if (article || tag) breadcrumbs.push({ name: 'Blog', url: siteUrl('/blog/') })
  if (page.relativePath !== 'index.md') breadcrumbs.push({ name: page.title, url: canonical })
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Person',
      '@id': authorId,
      name: SITE.author,
      url: siteUrl('/about/'),
      image,
      sameAs: SITE.sameAs,
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: SITE.name,
      url: siteUrl('/'),
      description: SITE.description,
      inLanguage: SITE.language,
      publisher: { '@id': authorId },
    },
    article
      ? {
          '@type': 'BlogPosting',
          '@id': `${canonical}#article`,
          url: canonical,
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
          headline: page.title,
          description,
          image,
          author: { '@id': authorId },
          publisher: { '@id': authorId },
          inLanguage: language,
          datePublished: meta.date,
          ...(tags.length && { keywords: tags.join(', ') }),
        }
      : {
          '@type':
            page.relativePath === 'about/index.md'
              ? 'AboutPage'
              : page.relativePath === 'contact/index.md'
                ? 'ContactPage'
                : tag ||
                    page.relativePath === 'blog/index.md' ||
                    page.relativePath === 'open-source/index.md'
                  ? 'CollectionPage'
                  : 'WebPage',
          '@id': canonical,
          url: canonical,
          name: page.title,
          description,
          inLanguage: language,
          isPartOf: { '@id': websiteId },
          ...(page.relativePath === 'about/index.md' && { mainEntity: { '@id': authorId } }),
        },
  ]
  if (breadcrumbs.length > 1)
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => {
        return {
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        }
      }),
    })

  const head: HeadConfig[] = [
    ['link', { rel: 'canonical', href: canonical }],
    [
      'meta',
      {
        name: 'robots',
        content: production && !meta.draft ? 'index, follow' : 'noindex, nofollow',
      },
    ],
    ['meta', { name: 'author', content: SITE.author }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { property: 'og:type', content: article ? 'article' : 'website' }],
    ['meta', { property: 'og:site_name', content: SITE.name }],
    ['meta', { property: 'og:locale', content: `${locale.language}_${locale.region}` }],
    ['meta', { property: 'og:image', content: image }],
    ['meta', { property: 'og:image:alt', content: SITE.author }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: image }],
    ['meta', { name: 'twitter:image:alt', content: SITE.author }],
    ['meta', { name: 'DC.title', content: title }],
    ['meta', { name: 'DC.creator', content: SITE.author }],
    ['meta', { name: 'DC.description', content: description }],
    ['meta', { name: 'DC.language', content: language }],
    ['meta', { name: 'DC.type', content: 'Text' }],
    [
      'script',
      { id: 'page-schema', type: 'application/ld+json' },
      JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(
        /</g,
        '\\u003c',
      ),
    ],
  ]
  if (tags.length) head.push(['meta', { name: 'keywords', content: tags.join(', ') }])
  if (article)
    head.push(
      ['meta', { property: 'article:published_time', content: `${meta.date}T00:00:00.000Z` }],
      ['meta', { property: 'article:author', content: siteUrl('/about/') }],
      ['meta', { property: 'article:section', content: 'Blog' }],
      ['meta', { name: 'DC.date.issued', content: meta.date }],
      ...tags.map((value): HeadConfig => {
        return [
          'meta',
          {
            id: `article-tag-${encodeURIComponent(value)}`,
            property: 'article:tag',
            content: value,
          },
        ]
      }),
    )
  meta.head = [...(meta.head ?? []), ...head]
}
