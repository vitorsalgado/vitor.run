#!/usr/bin/env node
/**
 * Generates rss.xml from blog posts. Run after vite build.
 * Output: dist/rss.xml
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const postsDir = join(root, 'blog')
const outFile = join(root, 'dist', 'rss.xml')

const SITE_URL = process.env.SITE_URL || 'https://vitor.run'
const SITE_NAME = 'vitor.run'

function escapeXml(str) {
  if (!str || typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toRfc2822(dateStr) {
  return new Date(dateStr).toUTCString()
}

const files = readdirSync(postsDir).filter((f) => f.endsWith('.md'))
const posts = files
  .map((f) => {
    const raw = readFileSync(join(postsDir, f), 'utf-8')
    const { data } = matter(raw)
    const slug = typeof data.slug === 'string' && data.slug.trim() ? data.slug.trim() : f.replace(/\.md$/, '')
    return {
      title: (data.title || slug),
      date: data.date || '',
      description: data.description || '',
      slug,
      link: `${SITE_URL}/blog/${encodeURIComponent(slug)}`,
    }
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

const items = posts
  .map(
    (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(p.link)}</link>
      <guid isPermaLink="true">${escapeXml(p.link)}</guid>
      <pubDate>${toRfc2822(p.date)}</pubDate>
      ${p.description ? `<description>${escapeXml(p.description)}</description>` : ''}
    </item>`
  )
  .join('\n')

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Blog posts from ${escapeXml(SITE_NAME)}</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`

writeFileSync(outFile, rss, 'utf-8')
