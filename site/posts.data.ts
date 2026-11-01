import type { PostMeta } from '../src/lib/posts'
import { getPublishedPosts } from './.vitepress/posts'

export declare const data: PostMeta[]

export default {
  watch: ['../blog/*.md'],
  load: () => getPublishedPosts().map((post) => post.meta),
}
