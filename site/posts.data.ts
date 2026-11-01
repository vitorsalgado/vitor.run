import type { PostMeta } from '../src/lib/posts'
import { getSitePosts } from './.vitepress/posts'

export declare const data: PostMeta[]

export default {
  watch: ['../blog/*.md'],
  load: () => getSitePosts().map((post) => post.meta),
}
