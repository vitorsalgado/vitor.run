import type { PostMeta } from '../src/lib/posts.ts'
import { getSitePosts } from './.vitepress/posts.ts'

export declare const data: PostMeta[]

export default {
  watch: ['../blog/*.md'],
  load: () => {
    return getSitePosts().map((post) => {
      return post.meta
    })
  },
}
