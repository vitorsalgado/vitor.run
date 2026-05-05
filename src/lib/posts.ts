import matter from 'gray-matter'
import { getReadTimeMinutes } from './read-time'

export interface PostMeta {
  title: string
  date: string
  description: string
  tags: string[]
  slug: string
  language: string
  /** Whether the post is published. Only posts with publish: true are included. */
  publish: boolean
  /** Read time in minutes, computed at build time from content (text, images, code/diagram blocks). */
  readTimeMinutes: number
  /** Optional cover image URL (Vite-resolved asset from blog/assets/). Set frontmatter "cover: filename.jpg" and place image in blog/assets/. */
  cover?: string
  /** Optional caption for the cover image. Set frontmatter "cover_caption: ..." */
  coverCaption?: string
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

/**
 * Cover images in blog/assets/ are glob-imported so Vite bundles them (hashed filenames, etc.).
 * Frontmatter "cover: filename.jpg" resolves to the asset URL for blog/assets/filename.jpg.
 */
const coverModules = import.meta.glob<string>(
  '/blog/assets/*.{jpg,jpeg,png,webp,gif}',
  { eager: true, import: 'default' }
)

function getCoverUrl(coverFromFrontmatter: string): string | undefined {
  return resolveBlogAssetUrl(coverFromFrontmatter)
}

/** Resolves a path to blog/assets/ into the Vite-bundled asset URL. Use in markdown images: ![alt](blog/assets/filename.jpg) */
export function resolveBlogAssetUrl(path: string): string | undefined {
  const filename = path.trim()
  if (!filename) return undefined
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename
  const name = filename.replace(/^\/blog\/assets\//, '').replace(/^blog\/assets\//, '').replace(/^assets\//, '')
  const mod = coverModules[`/blog/assets/${name}`] ?? coverModules[`blog/assets/${name}`]
  if (mod == null) return undefined
  return typeof mod === 'string' ? mod : (mod as { default?: string }).default
}

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

  const publishRaw = data.publish
  if (publishRaw === undefined || publishRaw === null) {
    throw new Error(`Post is missing required frontmatter "publish": ${file}`)
  }
  const publish = publishRaw === true || publishRaw === 'true'

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

  const coverRaw = data.cover
  const cover =
    typeof coverRaw === 'string' && coverRaw.trim() !== ''
      ? getCoverUrl(coverRaw.trim())
      : undefined

  const coverCaptionRaw = data.cover_caption ?? data.coverCaption
  const coverCaption =
    typeof coverCaptionRaw === 'string' && coverCaptionRaw.trim() !== ''
      ? coverCaptionRaw.trim()
      : undefined

  return {
    slug,
    meta: {
      title: typeof data.title === 'string' ? data.title : slug,
      date: dateStr,
      description: typeof data.description === 'string' ? data.description : '',
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      slug,
      language,
      publish,
      readTimeMinutes,
      cover,
      coverCaption,
    },
    content: body,
  }
}

function getPostsList(): Post[] {
  const list = Object.entries(postModules)
    .map(([path, raw]) => parsePost(path, typeof raw === 'string' ? raw : String(raw)))
    .filter((post) => post.meta.publish)
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
