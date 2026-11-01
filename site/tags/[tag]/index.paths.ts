import { getSitePosts } from '../../.vitepress/posts'

export default {
  paths: () => [...new Set(getSitePosts().flatMap((post) => post.meta.tags))]
    .sort()
    .map((tag) => ({ params: { tag: tag.toLowerCase() } })),
}
