export interface PostMeta {
  title: string
  date: string
  description: string
  tags: string[]
  slug: string
  language: string
  /** Read time in minutes, computed at build time from content (text, images, code/diagram blocks). */
  readTimeMinutes: number
  draft?: boolean
}

export interface Post {
  slug: string
  meta: PostMeta
  content: string
}
