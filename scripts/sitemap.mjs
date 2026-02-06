#!/usr/bin/env node
/**
 * Generates sitemap.xml from static routes and blog posts. Run after vite build.
 * Output: public/sitemap.xml
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const postsDir = join(root, 'src', 'content', 'posts')
const outFile = join(root, 'dist', 'sitemap.xml')

const SITE_URL = process.env.SITE_URL || 'https://vitor.run'

function escapeXml(str) {
  if (!str || typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const staticUrls = [
  { loc: '', changefreq: 'weekly', priority: '1.0' },
  { loc: '/about', changefreq: 'monthly', priority: '0.9' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.9' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.8' },
]

let postSlugs = []
const allTags = new Set()
try {
  const files = readdirSync(postsDir).filter((f) => f.endsWith('.md'))
  for (const f of files) {
    const raw = readFileSync(join(postsDir, f), 'utf-8')
    const { data } = matter(raw)
    const slug = typeof data.slug === 'string' && data.slug.trim() ? data.slug.trim() : null
    if (slug) postSlugs.push(slug)
    const tags = Array.isArray(data.tags) ? data.tags : []
    for (const t of tags) {
      if (t && typeof t === 'string') allTags.add(String(t).toLowerCase())
    }
  }
} catch (err) {
  console.warn('[sitemap] Could not read posts:', err.message)
}

const postUrls = postSlugs.map((slug) => ({
  loc: `/blog/${encodeURIComponent(slug)}`,
  changefreq: 'monthly',
  priority: '0.7',
  lastmod: null,
}))

const tagUrls = [...allTags].sort().map((tag) => ({
  loc: `/tags/${encodeURIComponent(tag)}`,
  changefreq: 'weekly',
  priority: '0.6',
  lastmod: null,
}))

const allUrls = [
  ...staticUrls.map((u) => ({ ...u, lastmod: null })),
  ...postUrls,
  ...tagUrls,
]

const urlEntries = allUrls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(SITE_URL + u.loc)}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`

writeFileSync(outFile, sitemap, 'utf-8')
console.log('[sitemap] Wrote', outFile, `(${allUrls.length} URLs)`)
