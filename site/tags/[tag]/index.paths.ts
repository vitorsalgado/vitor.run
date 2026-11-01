import { getPublishedPosts } from '../../.vitepress/posts'

export default {
  paths: () => [...new Set(getPublishedPosts().flatMap((post) => post.meta.tags))]
    .sort()
    .map((tag) => ({ params: { tag: tag.toLowerCase() } })),
}
