import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { getSitePosts, isDraftPreview, postsDirectory } from './posts'
import { rebasePostImage } from './post-images'
import { socialLinks } from '../../src/lib/social'
import taskLists from 'markdown-it-task-lists'
import { SITE } from '../../src/lib/site'
import { applyPageSeo } from './seo'
import { getPublicationFiles } from './publication'

// Validate before VitePress loads route modules, whose errors can otherwise become warnings.
const posts = getSitePosts()
const production = process.env.VITOR_PRODUCTION === '1' && process.env.NODE_ENV === 'production'
const avatar = new URL('../../src/assets/avatar.jpeg', import.meta.url)
const favicon = new URL('../../public/favicon.svg', import.meta.url)

export default defineConfig({
  title: SITE.name,
  titleTemplate: true,
  description: SITE.description,
  lang: SITE.language,
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
        if (post && source) tokens[index].attrSet('src', rebasePostImage(
          source, post.sourcePath, env.path, process.env.NODE_ENV !== 'production',
        ))
        return renderImage(tokens, index, options, env, renderer)
      }
    },
  },
  head: [
    ['meta', { name: 'robots', content: 'noindex, nofollow' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: `${SITE.name} Blog`, href: '/rss.xml' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
    }],
  ],
  themeConfig: {
    production,
    draftPreview: isDraftPreview(),
    sidebar: false,
    aside: false,
    outline: false,
    docFooter: { prev: false, next: false },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about/' },
      { text: 'Blog', link: '/blog/', activeMatch: '^/(blog|tags)/' },
      { text: 'Contact', link: '/contact/' },
      { text: 'RSS', link: '/rss.xml' },
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
  transformPageData(page) { applyPageSeo(page, production) },
  transformHead({ description }) {
    // VitePress 1's default description interpolation does not escape attribute quotes.
    return [['meta', { name: 'description', content: description }]]
  },
  transformHtml(html, _id, { pageData }) {
    return html.replace(/<html lang="[^"]*"/, `<html lang="${pageData.frontmatter.lang ?? SITE.language}"`)
  },
  buildEnd(config) {
    copyFileSync(favicon, join(config.outDir, 'favicon.svg'))
    copyFileSync(avatar, join(config.outDir, SITE.image.slice(1)))
    for (const [name, file] of Object.entries(getPublicationFiles(production))) {
      writeFileSync(join(config.outDir, name), file.content)
    }
    // VitePress 1.x leaves 404.html empty until hydration; reuse the static fallback.
    const fallback = readFileSync(new URL('../../public/404.html', import.meta.url), 'utf8')
    writeFileSync(join(config.outDir, '404.html'), fallback.replace('<head>',
      '<head>\n    <meta name="robots" content="noindex, nofollow" />'))
  },
  vite: {
    plugins: [{
      name: 'watch-blog-content',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          const path = new URL(request.url ?? '/', 'http://localhost').pathname
          if (path === SITE.image || path === '/favicon.svg') {
            response.setHeader('Content-Type', path === SITE.image ? 'image/jpeg' : 'image/svg+xml')
            response.end(readFileSync(path === SITE.image ? avatar : favicon))
          } else if (['/rss.xml', '/sitemap.xml', '/robots.txt'].includes(path)) {
            try {
              const file = getPublicationFiles(false)[path.slice(1)]
              response.setHeader('Content-Type', file.type)
              response.end(file.content)
            } catch (error) { next(error) }
          } else next()
        })
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
