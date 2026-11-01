import matter from 'gray-matter'

export interface AboutContent {
  title: string
  description: string
  content: string
}

/**
 * About page content is loaded at build time from site/about/index.md
 * via Vite's glob import. No runtime fetch — works in dev, preview, and any static host.
 */
const aboutModule = import.meta.glob<string>('../../site/about/index.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function parseAbout(raw: string): AboutContent {
  const { data, content: body } = matter(raw)

  return {
    title: typeof data.title === 'string' ? data.title : 'About',
    description: typeof data.description === 'string' ? data.description : '',
    content: body,
  }
}

function getAboutContent(): AboutContent {
  const raw = Object.values(aboutModule)[0]
  if (!raw || typeof raw !== 'string') {
    throw new Error('About content file not found')
  }
  return parseAbout(raw)
}

/** Get about page content (from bundled content, loaded at build time). */
export function getAbout(): AboutContent {
  return getAboutContent()
}
