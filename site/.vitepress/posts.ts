import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import matter from 'gray-matter'
import { parseDocument } from 'yaml'
import type { Post } from '../../src/lib/posts'
import { getReadTimeMinutes } from '../../src/lib/read-time.ts'
import { validatePostImages } from './post-images.ts'

export const postsDirectory = fileURLToPath(new URL('../../blog/', import.meta.url))

/** Read strict YAML once for both publication validation and post creation. */
export function getPostSources(directory = postsDirectory) {
  return readdirSync(directory)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => {
      const sourcePath = join(directory, file)
      const raw = readFileSync(sourcePath, 'utf8').replace(/^\uFEFF/, '')
      function fail(field: string, message: string): never {
        throw new Error(`${sourcePath}: "${field}" ${message}`)
      }

      if (!/^---(?:[ \t]*yaml)?[ \t]*\r?\n/.test(raw) || !/\r?\n---[ \t]*(?:\r?\n|$)/.test(raw)) {
        fail('frontmatter', 'must be a complete YAML block delimited by ---')
      }

      let parsed: ReturnType<typeof matter>
      try {
        parsed = matter(raw, {
          engines: {
            yaml(input) {
              // YAML's core schema keeps dates as strings, so impossible dates cannot roll over.
              const document = parseDocument(input, { schema: 'core' })
              const issue = document.errors[0] ?? document.warnings[0]
              if (issue) throw issue
              const value: unknown = document.toJS()
              if (!value || typeof value !== 'object' || Array.isArray(value)) {
                throw new Error('frontmatter must be a mapping of field names to values')
              }
              return value
            },
          },
        })
      } catch (error) {
        throw new Error(`${sourcePath}: invalid YAML frontmatter: ${error instanceof Error ? error.message : String(error)}`)
      }

      const data: Record<string, unknown> = parsed.data
      const { content } = parsed
      if (data.draft !== undefined && typeof data.draft !== 'boolean') {
        fail('draft', 'must be true or false, without quotes')
      }
      return { sourcePath, data, content }
    })
}

export function isPostSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

export function isDraftPreview() {
  // VitePress sets NODE_ENV=production before loading config, routes, and data for builds.
  return process.env.VITOR_PREVIEW_DRAFTS === '1' && process.env.NODE_ENV !== 'production'
}

export function getPublishedPosts(directory = postsDirectory) {
  return getPosts(directory, false)
}

export function getSitePosts(directory = postsDirectory) {
  return getPosts(directory, isDraftPreview())
}

function getPosts(directory: string, includeDrafts: boolean): (Post & { sourcePath: string })[] {
  const slugs = new Map<string, string>()
  return getPostSources(directory)
    .flatMap(({ sourcePath, data, content }) => {
      const draft = data.draft === true
      if (draft && !includeDrafts) return []
      function fail(field: string, message: string): never {
        throw new Error(`${sourcePath}: "${field}" ${message}`)
      }

      const fields = new Set(['title', 'slug', 'date', 'language', 'description', 'tags', 'draft'])
      for (const field of Object.keys(data)) {
        if (!fields.has(field)) fail(field, 'is not a supported post field; check for a typo')
      }
      const requiredText = (field: string) => {
        const value = data[field]
        if (typeof value !== 'string' || !value.trim()) fail(field, 'must be a nonempty string')
        return value.trim()
      }
      const title = requiredText('title')
      if (/<\/script/i.test(title)) fail('title', 'must not contain a closing script tag (VitePress 1 limitation)')
      if (!draft && /^(TODO|TBD)$/i.test(title)) fail('title', 'must be replaced before publishing')
      const slug = requiredText('slug')
      if (!isPostSlug(slug)) {
        fail('slug', 'must contain lowercase letters, digits, and single hyphens')
      }
      const previous = slugs.get(slug)
      if (previous) fail('slug', `duplicates ${JSON.stringify(slug)} in ${previous}`)
      slugs.set(slug, sourcePath)

      const date = requiredText('date')
      const timestamp = Date.parse(date)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(timestamp)
        || new Date(timestamp).toISOString().slice(0, 10) !== date) {
        fail('date', 'must be a real calendar date in YYYY-MM-DD format')
      }

      let language: string
      try {
        language = Intl.getCanonicalLocales(requiredText('language'))[0]
      } catch {
        fail('language', 'must be a valid language tag, such as en or pt-BR')
      }

      if (data.description !== undefined && typeof data.description !== 'string') {
        fail('description', 'must be a string when provided')
      }
      const description = typeof data.description === 'string' ? data.description.trim() : ''
      if (/<\/script/i.test(description)) fail('description', 'must not contain a closing script tag (VitePress 1 limitation)')
      if (!draft && /^(TODO|TBD)$/i.test(description)) fail('description', 'must be replaced before publishing')

      if (data.tags !== undefined && !Array.isArray(data.tags)) fail('tags', 'must be an array of strings')
      const tags = [...new Set(((data.tags ?? []) as unknown[]).map((value, index) => {
        if (typeof value !== 'string' || !value.trim()) fail(`tags[${index}]`, 'must be a nonempty string')
        const tag = value.trim().toLowerCase().normalize('NFC')
        if (/[\\/?#%]|\p{Cc}/u.test(tag) || tag === '.' || tag === '..') {
          fail(`tags[${index}]`, 'must not contain path or URL delimiters')
        }
        return tag
      }))]

      if (!draft && !content.trim()) fail('content', 'must not be empty for a published post')
      validatePostImages(content, sourcePath)

      return [{
        slug,
        sourcePath,
        content,
        meta: {
          ...(draft && { draft: true }),
          title,
          slug,
          date,
          description,
          language,
          tags,
          readTimeMinutes: getReadTimeMinutes(content),
        },
      }]
    })
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date) || a.slug.localeCompare(b.slug, 'en'))
}
