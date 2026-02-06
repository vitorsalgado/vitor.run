import { copyFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * SPA fallback: serve index.html for routes with no file extension
 * (e.g. /blog/hello-world) so the client router can handle them.
 * Only runs for paths that look like app routes, not static files.
 */
function spaFallback() {
  const createHandler = (indexPath: string) => (req: unknown, res: unknown, next: () => void) => {
    const r = req as { url?: string; method?: string }
    const w = res as { setHeader: (a: string, b: string) => void; end: (s: string) => void }
    const url = (r.url ?? '').split('?')[0].split('#')[0]
    if (r.method !== 'GET' && r.method !== 'HEAD') return next()
    if (/\.[a-zA-Z0-9]+$/.test(url)) return next()
    try {
      const html = readFileSync(indexPath, 'utf-8')
      w.setHeader('Content-Type', 'text/html')
      w.end(html)
    } catch {
      next()
    }
  }
  return {
    name: 'spa-fallback',
    configureServer(server: { config: { root: string }; middlewares: { use: (fn: (req: unknown, res: unknown, next: () => void) => void) => void } }) {
      return () => {
        server.middlewares.use(createHandler(join(server.config.root, 'index.html')))
      }
    },
    configurePreviewServer(server: { middlewares: { use: (fn: (req: unknown, res: unknown, next: () => void) => void) => void; stack?: { route: string; handle: (req: unknown, res: unknown, next: () => void) => void }[] } }) {
      const handler = createHandler(join(process.cwd(), 'dist', 'index.html'))
      const stack = (server.middlewares as { stack?: { route: string; handle: (req: unknown, res: unknown, next: () => void) => void }[] }).stack
      if (Array.isArray(stack)) stack.unshift({ route: '', handle: handler })
      else server.middlewares.use(handler)
    },
  }
}

/**
 * GitHub Pages 404 workaround: copy index.html to 404.html so that direct
 * requests to /blog, /blog/slug, etc. serve the SPA and React Router can handle the route.
 */
function githubPages404() {
  return {
    name: 'github-pages-404',
    closeBundle() {
      const outDir = join(process.cwd(), 'dist')
      copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/', // Served at root for vitor.run
  plugins: [react(), tailwindcss(), spaFallback(), githubPages404()],
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
})
