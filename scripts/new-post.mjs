#!/usr/bin/env node
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { stringify } from 'yaml'
import { getPostSources, isPostSlug } from '../site/.vitepress/posts.ts'
import { SITE } from '../src/lib/site.ts'

const usage = 'Usage: npm run new:post -- "Post title" [--slug my-slug]'

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { slug: { type: 'string' }, help: { type: 'boolean' } },
  })
  if (values.help) {
    console.log(usage)
  } else {
    if (positionals.length !== 1 || !positionals[0].trim()) throw new Error(usage)
    const title = positionals[0].trim()
    const slug = values.slug ?? title.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    if (!isPostSlug(slug)) {
      throw new Error('Provide --slug with lowercase letters, digits, and single hyphens.')
    }

    const root = join(dirname(fileURLToPath(import.meta.url)), '..')
    const postsDir = join(root, 'blog')
    const existing = getPostSources(postsDir).find(({ data }) => typeof data.slug === 'string' && data.slug.trim() === slug)
    if (existing) throw new Error(`Slug "${slug}" is already used by ${existing.sourcePath}`)

    const now = new Date()
    const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
    const filepath = join(postsDir, `${date}-${slug}.md`)
    const content = `---\n${stringify({ title, slug, date, language: SITE.language, description: '', tags: [], draft: true })}---\n\n`
    writeFileSync(filepath, content, { encoding: 'utf8', flag: 'wx' })
    console.log(`[new-post] Created draft: ${filepath}\nPreview: npm run site:dev:drafts\nPublish: write the body, set draft: false, then run npm run content:check and npm run site:build.`)
  }
} catch (error) {
  console.error(`[new-post] ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
}
