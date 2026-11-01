import matter from 'gray-matter'
import { getSitePosts } from '../../.vitepress/posts'

export default {
  paths: () => getSitePosts().map((post) => ({
    params: { slug: post.slug },
    content: matter.stringify({ content: post.content }, post.meta),
  })),
}
