#!/usr/bin/env node
/**
 * Generates folder structure with index.html for each SPA route.
 * GitHub Pages serves these with 200 OK (better SEO than 404.html workaround).
 * Run after vite build.
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const distDir = join(root, 'dist')
const postsDir = join(root, 'src', 'content', 'posts')
const indexHtmlPath = join(distDir, 'index.html')

if (!existsSync(indexHtmlPath)) {
  console.error('[generate-static-paths] dist/index.html not found. Run vite build first.')
  process.exit(1)
}

const staticPaths = ['about', 'blog', 'contact']

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
  console.warn('[generate-static-paths] Could not read posts:', err.message)
}

const paths = [
  ...staticPaths.map((p) => p),
  ...postSlugs.map((slug) => `blog/${encodeURIComponent(slug)}`),
  ...[...allTags].sort().map((tag) => `tags/${encodeURIComponent(tag)}`),
]

for (const pathSegments of paths) {
  const dir = join(distDir, pathSegments)
  mkdirSync(dir, { recursive: true })
  copyFileSync(indexHtmlPath, join(dir, 'index.html'))
}

console.log('[generate-static-paths] Created', paths.length, 'paths')
