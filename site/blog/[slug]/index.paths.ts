import matter from 'gray-matter'
import { getSitePosts } from '../../.vitepress/posts.ts'

export default {
  paths: () => {
    return getSitePosts().map((post) => {
      return {
        params: { slug: post.slug },
        content: matter.stringify({ content: post.content }, post.meta),
      }
    })
  },
}
