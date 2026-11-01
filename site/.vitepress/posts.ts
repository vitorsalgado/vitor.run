import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import matter from 'gray-matter'
import type { Post } from '../../src/lib/posts'
import { getReadTimeMinutes } from '../../src/lib/read-time'

export const postsDirectory = fileURLToPath(new URL('../../blog/', import.meta.url))

// The existing loader uses browser-only import.meta.glob; route loaders run in Node.
export function getPublishedPosts(): Post[] {
  return readdirSync(postsDirectory)
    .filter((file) => file.endsWith('.md'))
    .flatMap((file) => {
      const { data, content } = matter(readFileSync(join(postsDirectory, file), 'utf8'))
      if (data.draft === true) return []

      if (typeof data.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
        throw new Error(`Invalid or missing post slug: ${file}`)
      }

      return [{
        slug: data.slug,
        content,
        meta: {
          title: data.title,
          slug: data.slug,
          date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date,
          description: data.description ?? '',
          language: data.language,
          tags: data.tags ?? [],
          readTimeMinutes: getReadTimeMinutes(content),
        },
      }]
    })
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date))
}
