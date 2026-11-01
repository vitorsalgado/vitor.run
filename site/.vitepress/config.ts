import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { getPublishedPosts, postsDirectory } from './posts'
import { rebasePostImage } from './post-images'
import { socialLinks } from '../../src/lib/social'
import taskLists from 'markdown-it-task-lists'

// Validate before VitePress loads route modules, whose errors can otherwise become warnings.
const posts = getPublishedPosts()

export default defineConfig({
  title: 'vitor.run',
  titleTemplate: ':title | vitor.run',
  description: 'Personal site and blog by Vitor Hugo Salgado.',
  lang: 'en',
  appearance: { storageKey: 'theme' },
  cleanUrls: true,
  markdown: {
    languageAlias: { gradle: 'groovy' },
    config(markdown) {
      markdown.use(taskLists, { label: true })
      const renderImage = markdown.renderer.rules.image!
      markdown.renderer.rules.image = (tokens, index, options, env: {
        path: string
        frontmatter?: { slug?: string }
      }, renderer) => {
        const post = posts.find((post) => post.slug === env.frontmatter?.slug)
        const source = tokens[index].attrGet('src')
        if (post && source) tokens[index].attrSet('src', rebasePostImage(source, post.sourcePath, env.path))
        return renderImage(tokens, index, options, env, renderer)
      }
    },
  },
  head: [
    ['meta', { name: 'robots', content: 'noindex, nofollow' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
    }],
  ],
  themeConfig: {
    sidebar: false,
    aside: false,
    outline: false,
    docFooter: { prev: false, next: false },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about/' },
      { text: 'Blog', link: '/blog/', activeMatch: '^/(blog|tags)/' },
      { text: 'Contact', link: '/contact/' },
    ],
    socialLinks: socialLinks.map(({ platform, href, label }) => ({
      icon: platform.toLowerCase(), link: href, ariaLabel: label,
    })),
    footer: { copyright: `© ${new Date().getUTCFullYear()}` },
    notFound: {
      title: 'Page not found',
      quote: "This page doesn't exist or has been moved.",
      linkLabel: 'Back to home',
      linkText: 'Back to home',
    },
  },
  transformPageData(page) {
    if (page.params?.tag) page.title = String(page.params.tag)
    if (page.relativePath === '404.md') return

    const path = `/${page.relativePath.replace(/index\.md$/, '')}`
    page.frontmatter.head ??= []
    page.frontmatter.head.push(['link', {
      rel: 'canonical', href: new URL(path, 'https://vitor.run').href,
    }])
  },
  buildEnd(config) {
    copyFileSync(new URL('../../public/favicon.svg', import.meta.url), join(config.outDir, 'favicon.svg'))
    // VitePress 1.x leaves 404.html empty until hydration; reuse the static fallback.
    const fallback = readFileSync(new URL('../../public/404.html', import.meta.url), 'utf8')
    writeFileSync(join(config.outDir, '404.html'), fallback.replace('<head>',
      '<head>\n    <meta name="robots" content="noindex, nofollow" />'))
  },
  vite: {
    plugins: [{
      name: 'watch-blog-content',
      configureServer(server) {
        // VitePress 1.x does not watch files read by dynamic route loaders.
        server.watcher.add(postsDirectory)
        const onChange = (_event: string, file: string) => {
          const path = relative(postsDirectory, file)
          if (!path.startsWith('..') && path.endsWith('.md')) {
            // Trigger VitePress's full config reload, which regenerates dynamic routes.
            server.watcher.emit('change', fileURLToPath(new URL('./config.ts', import.meta.url)))
          }
        }
        server.watcher.on('all', onChange)
        server.httpServer?.once('close', () => server.watcher.off('all', onChange))
      },
    }],
  },
})
