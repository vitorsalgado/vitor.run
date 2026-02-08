import matter from 'gray-matter'
import { getReadTimeMinutes } from './read-time'

export interface PostMeta {
  title: string
  date: string
  description: string
  tags: string[]
  slug: string
  language: string
  /** Read time in minutes, computed at build time from content (text, images, code/diagram blocks). */
  readTimeMinutes: number
}

export interface Post {
  slug: string
  meta: PostMeta
  content: string
}

/**
 * All blog posts are loaded at build time from blog/*.md (project root)
 * via Vite's glob import. No runtime fetch — works in dev, preview, and any static host.
 */
const postModules = import.meta.glob<string>('/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function parsePost(path: string, raw: string): Post {
  const { data, content: body } = matter(raw)
  const file = path.split('/').pop() ?? path

  const slugRaw = data.slug
  if (typeof slugRaw !== 'string' || slugRaw.trim() === '') {
    throw new Error(`Post is missing required frontmatter "slug": ${file}`)
  }
  const slug = slugRaw.trim()

  const languageRaw = data.language
  if (typeof languageRaw !== 'string' || languageRaw.trim() === '') {
    throw new Error(`Post is missing required frontmatter "language": ${file}`)
  }
  const language = languageRaw.trim()

  // Handle date parsing - gray-matter might parse dates as Date objects or strings
  // Date is required and must be valid
  let dateStr = ''
  if (!data.date) {
    throw new Error(`Post is missing required frontmatter "date": ${file}`)
  }

  if (typeof data.date === 'string') {
    dateStr = data.date.trim()
  } else if (data.date instanceof Date) {
    // Convert Date object to YYYY-MM-DD format
    const year = data.date.getFullYear()
    const month = String(data.date.getMonth() + 1).padStart(2, '0')
    const day = String(data.date.getDate()).padStart(2, '0')
    dateStr = `${year}-${month}-${day}`
  } else {
    dateStr = String(data.date).trim()
  }

  // Validate date format and ensure it's a valid date
  if (!dateStr || dateStr.trim() === '') {
    throw new Error(`Post has empty "date" frontmatter: ${file}`)
  }

  const dateObj = new Date(dateStr)
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Post has invalid "date" frontmatter "${dateStr}": ${file}`)
  }

  const readTimeMinutes = getReadTimeMinutes(body)

  return {
    slug,
    meta: {
      title: typeof data.title === 'string' ? data.title : slug,
      date: dateStr,
      description: typeof data.description === 'string' ? data.description : '',
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      slug,
      language,
      readTimeMinutes,
    },
    content: body,
  }
}

function getPostsList(): Post[] {
  const list = Object.entries(postModules).map(([path, raw]) =>
    parsePost(path, typeof raw === 'string' ? raw : String(raw))
  )
  return list.sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime())
}

/** List all posts (from bundled content). */
export function getPosts(): Promise<Post[]> {
  return Promise.resolve(getPostsList())
}

/** Get all unique tags across posts. */
export function getAllTags(posts: Post[]): string[] {
  const set = new Set<string>()
  for (const post of posts) {
    for (const tag of post.meta.tags ?? []) {
      if (tag && typeof tag === 'string') set.add(tag)
    }
  }
  return Array.from(set).sort()
}

/** Filter posts by tag. */
export function filterPostsByTag(posts: Post[], tag: string): Post[] {
  return posts.filter((post) =>
    (post.meta.tags ?? []).some((t) => t.toLowerCase() === tag.toLowerCase())
  )
}

/** Get a single post by slug (from bundled content). */
export function getPost(slug: string): Promise<Post | null> {
  const list = getPostsList()
  const post = list.find((p) => p.slug === slug) ?? null
  return Promise.resolve(post)
}
