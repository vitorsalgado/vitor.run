import matter from 'gray-matter'

export interface PostMeta {
  title: string
  date: string
  description?: string
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

function slugFromPath(path: string): string {
  const name = path.split('/').pop() ?? path
  return name.replace(/\.md$/, '')
}

function parsePost(path: string, raw: string): Post {
  const slug = slugFromPath(path)
  const { data, content: body } = matter(raw)
  return {
    slug,
    meta: {
      title: (data.title as string) ?? slug,
      date: (data.date as string) ?? '',
      description: data.description as string | undefined,
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

/** Get a single post by slug (from bundled content). */
export function getPost(slug: string): Promise<Post | null> {
  const list = getPostsList()
  const post = list.find((p) => p.slug === slug) ?? null
  return Promise.resolve(post)
}
