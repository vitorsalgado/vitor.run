import matter from 'gray-matter'
import { getPublishedPosts } from '../../.vitepress/posts'

export default {
  paths: () => getPublishedPosts().map((post) => ({
    params: { slug: post.slug },
    content: matter.stringify({ content: post.content }, post.meta),
  })),
}
