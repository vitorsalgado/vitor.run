import { getSitePosts } from '../../.vitepress/posts.ts'

export default {
  paths: () => {
    return [
      ...new Set(
        getSitePosts().flatMap((post) => {
          return post.meta.tags
        }),
      ),
    ]
      .sort()
      .map((tag) => {
        return { params: { tag: tag.toLowerCase() } }
      })
  },
}
