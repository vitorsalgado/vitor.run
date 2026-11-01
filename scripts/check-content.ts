import { getPublishedPosts } from '../site/.vitepress/posts.ts'

const posts = getPublishedPosts()
const tags = new Set(posts.flatMap((post) => post.meta.tags))
console.log(`Validated ${posts.length} published post(s) and ${tags.size} tag(s). Drafts excluded.`)
