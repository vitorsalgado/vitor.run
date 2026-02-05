import matter from 'gray-matter'

export interface PostMeta {
  title: string
  date: string
  description?: string
  tags?: string[]
  /** Lucide icon name (e.g. FileText, BookOpen, Coffee). */
  icon?: string
  /** URL slug for the post (from frontmatter). Required. Used in /blog/:slug. */
  slug: string
}

export interface Post {
  slug: string
  meta: PostMeta
  content: string
}

/**
 * All blog posts are loaded at build time from src/content/posts/*.md
 * via Vite's glob import. No runtime fetch — works in dev, preview, and any static host.
 */
const postModules = import.meta.glob<string>('../content/posts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function parsePost(path: string, raw: string): Post {
  const { data, content: body } = matter(raw)
  const slugRaw = data.slug
  if (typeof slugRaw !== 'string' || slugRaw.trim() === '') {
    const file = path.split('/').pop() ?? path
    throw new Error(`Post is missing required frontmatter "slug": ${file}`)
  }
  const slug = slugRaw.trim()
  return {
    slug,
    meta: {
      title: (data.title as string) ?? slug,
      date: (data.date as string) ?? '',
      description: data.description as string | undefined,
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : undefined,
      icon: typeof data.icon === 'string' ? data.icon : undefined,
      slug,
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
