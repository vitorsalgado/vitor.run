import { SITE, siteUrl } from '../../src/lib/site.ts'
import { getPublishedPosts, postsDirectory } from './posts.ts'

function escapeXml(value: string) {
  for (const character of value) {
    const point = character.codePointAt(0)!
    if (
      (point < 32 && ![9, 10, 13].includes(point)) ||
      point === 0xfffe ||
      point === 0xffff ||
      (point >= 0xd800 && point <= 0xdfff)
    ) {
      throw new Error(
        `Publication metadata contains a character forbidden in XML 1.0: U+${point.toString(16)}`,
      )
    }
  }
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function getPublicationFiles(
  production: boolean,
  directory = postsDirectory,
): Record<string, { type: string; content: string }> {
  // Always use the publication model, including while the author is previewing drafts.
  const posts = getPublishedPosts(directory)
  // Preserve the existing no-slash GUIDs so feed readers retain subscriber history.
  const items = posts
    .map(({ slug, meta }) => {
      return `    <item>
      <title>${escapeXml(meta.title)}</title>
      <link>${escapeXml(siteUrl(`/blog/${slug}/`))}</link>
      <guid isPermaLink="true">${escapeXml(siteUrl(`/blog/${slug}`))}</guid>
      <pubDate>${new Date(meta.date).toUTCString()}</pubDate>
      ${meta.description ? `<description>${escapeXml(meta.description)}</description>` : ''}
      <dc:creator>${escapeXml(SITE.author)}</dc:creator>
      <dc:language>${escapeXml(meta.language)}</dc:language>
${meta.tags
  .map((tag) => {
    return `      <category>${escapeXml(tag)}</category>`
  })
  .join('\n')}
    </item>`
    })
    .join('\n')
  const paths = [
    '/',
    '/about/',
    '/blog/',
    '/contact/',
    ...posts.map((post) => {
      return `/blog/${post.slug}/`
    }),
    ...[
      ...new Set(
        posts.flatMap((post) => {
          return post.meta.tags
        }),
      ),
    ]
      .sort()
      .map((tag) => {
        return `/tags/${encodeURIComponent(tag)}/`
      }),
  ]
  return {
    'rss.xml': {
      type: 'application/rss+xml; charset=utf-8',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE.name)} Blog</title>
    <link>${escapeXml(siteUrl('/blog/'))}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>${SITE.language}</language>
    <atom:link href="${escapeXml(siteUrl('/rss.xml'))}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`,
    },
    'sitemap.xml': {
      type: 'application/xml; charset=utf-8',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map((path) => {
    return `  <url><loc>${escapeXml(siteUrl(path))}</loc></url>`
  })
  .join('\n')}
</urlset>
`,
    },
    'robots.txt': {
      type: 'text/plain; charset=utf-8',
      content: `User-agent: *\nAllow: /\n${production ? `\nSitemap: ${siteUrl('/sitemap.xml')}\n` : ''}`,
    },
  }
}
