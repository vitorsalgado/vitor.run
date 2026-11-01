import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { stringify } from 'yaml'

const root = process.cwd()
const slug = `seo-publication-${randomUUID()}`
const directory = join(root, '.local', slug)
const output = join(directory, 'dist')
const base = 'http://127.0.0.1:4179'
const articlePath = `/blog/${slug}/`
const title = 'Metadata $& "quoted" <T> & C++ ' + 'detailed '.repeat(25).trim()
const description = 'Português " data-injected="yes" & <template>example</template>'
const puma = '/blog/puma4j-easier-way-to-load-and-convert-resource-files-in-your-junit-tests/'
let server: ChildProcess | undefined
let serverError = ''

test.beforeAll(async () => {
  mkdirSync(directory, { recursive: true })
  writeFileSync(join(root, 'blog', `${slug}.md`), [
    '---', stringify({ title, slug, description, date: '2024-02-29', language: 'pt-br', tags: ['tech', 'café noir'] }),
    '---', '', 'Conteúdo gerado no servidor.',
  ].join('\n'), { flag: 'wx' })
  writeFileSync(join(root, 'blog', `${slug}-draft.md`), [
    '---', stringify({ title: 'SEO_PRIVATE_TITLE_SENTINEL', slug: `${slug}-draft`, date: '2024-02-29',
      language: 'en', tags: ['seo-private-tag'], draft: true }), '---', '', 'SEO_PRIVATE_BODY_SENTINEL',
  ].join('\n'), { flag: 'wx' })
  const build = spawnSync(process.execPath, ['node_modules/vitepress/bin/vitepress.js', 'build', 'site', '--outDir', output], {
    cwd: root, encoding: 'utf8', timeout: 20_000, maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, VITOR_PRODUCTION: '1', VITOR_PREVIEW_DRAFTS: '1', NODE_ENV: 'development' },
  })
  expect(build.status, build.stdout + build.stderr).toBe(0)
  server = spawn('python3', ['-m', 'http.server', '4179', '--bind', '127.0.0.1', '--directory', output], {
    stdio: ['ignore', 'ignore', 'pipe'],
  })
  server.on('error', (error) => { serverError = error.message })
  server.stderr?.on('data', (chunk) => { serverError = (serverError + String(chunk)).slice(-4000) })
  await expect.poll(async () => {
    if (server?.exitCode !== null) throw new Error(serverError || 'SEO static server exited')
    try { return (await fetch(`${base}/`)).status }
    catch { return 0 }
  }).toBe(200)
})

test.afterAll(async () => {
  if (server?.pid && server.exitCode === null) {
    const stopped = once(server, 'exit')
    server.kill('SIGTERM')
    await stopped
  }
  for (const file of [`${slug}.md`, `${slug}-draft.md`]) rmSync(join(root, 'blog', file), { force: true })
  rmSync(directory, { recursive: true, force: true })
})

async function productionOrigin(page: Page, request: APIRequestContext) {
  await page.route('https://vitor.run/**', async (route) => {
    const url = new URL(route.request().url())
    await route.fulfill({ response: await request.get(`${base}${url.pathname}${url.search}`) })
  })
}

test.describe('Production SEO without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('HTML contains escaped article metadata, language and structured data before hydration', async ({ page }) => {
    const response = await page.goto(`${base}${articlePath}`)
    expect(response?.status()).toBe(200)
    await expect(page.getByText('Conteúdo gerado no servidor.', { exact: true })).toBeVisible()
    await expect(page).toHaveTitle(`${title} | vitor.run`)
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
    await expect(page.locator('meta[name="description"]')).toHaveCount(1)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description)
    await expect(page.locator('meta[name="robots"]')).toHaveCount(1)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://vitor.run${articlePath}`)
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', `${title} | vitor.run`)
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', description)
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'pt_BR')
    await expect(page.locator('meta[property="article:tag"]')).toHaveCount(2)
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', description)
    await expect(page.locator('[data-injected]')).toHaveCount(0)
    const schema = JSON.parse((await page.locator('#page-schema').textContent())!)
    expect(schema['@graph'].find((node: Record<string, unknown>) => node['@type'] === 'BlogPosting'))
      .toMatchObject({ headline: title, description, inLanguage: 'pt-BR', datePublished: '2024-02-29',
        url: `https://vitor.run${articlePath}`, author: { '@id': 'https://vitor.run/#author' } })
    await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute('href', '/rss.xml')
  })

  test('static pages have their own page types and social metadata', async ({ page, request }) => {
    for (const [path, type] of [['/', 'WebPage'], ['/about/', 'AboutPage'], ['/contact/', 'ContactPage'],
      ['/blog/', 'CollectionPage'], ['/tags/caf%C3%A9%20noir/', 'CollectionPage']]) {
      await page.goto(`${base}${path}`)
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://vitor.run${path}`)
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website')
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://vitor.run/avatar.jpeg')
      const schema = JSON.parse((await page.locator('#page-schema').textContent())!)
      expect(schema['@graph'].some((node: Record<string, unknown>) => node['@type'] === type)).toBe(true)
    }
    const image = await request.get(`${base}/avatar.jpeg`)
    expect(image.status()).toBe(200)
    expect(image.headers()['content-type']).toContain('image/jpeg')
    await page.goto(`${base}/404.html`)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
  })
})

test('RSS and sitemap XML are valid, use canonical pages, and exclude drafts from the entire artifact', async ({ page, request }) => {
  const rss = await request.get(`${base}/rss.xml`)
  const sitemap = await request.get(`${base}/sitemap.xml`)
  expect(rss.status()).toBe(200)
  expect(sitemap.status()).toBe(200)
  const documents = await page.evaluate(({ feed, map }) => {
    const parse = (xml: string) => new DOMParser().parseFromString(xml, 'application/xml')
    const feedDoc = parse(feed)
    const mapDoc = parse(map)
    return {
      errors: feedDoc.getElementsByTagName('parsererror').length + mapDoc.getElementsByTagName('parsererror').length,
      items: [...feedDoc.getElementsByTagName('item')].map((item) => ({
        title: item.querySelector('title')?.textContent,
        description: item.querySelector('description')?.textContent,
        link: item.querySelector('link')?.textContent,
        guid: item.querySelector('guid')?.textContent,
      })),
      urls: [...mapDoc.getElementsByTagName('loc')].map((element) => element.textContent!),
    }
  }, { feed: await rss.text(), map: await sitemap.text() })
  expect(documents.errors).toBe(0)
  expect(documents.items).toContainEqual({ title, description,
    link: `https://vitor.run${articlePath}`, guid: `https://vitor.run/blog/${slug}` })
  expect(new Set(documents.urls).size).toBe(documents.urls.length)
  expect(documents.urls).toContain('https://vitor.run/tags/caf%C3%A9%20noir/')
  for (const url of documents.urls) {
    const response = await request.get(`${base}${new URL(url).pathname}`)
    expect(response.status(), url).toBe(200)
    expect(await response.text(), url).toContain(`href="${url}"`)
  }
  expect(await (await request.get(`${base}/robots.txt`)).text()).toContain('Sitemap: https://vitor.run/sitemap.xml')
  expect((await request.get(`${base}/blog/${slug}-draft/`)).status()).toBe(404)
  for (const file of readdirSync(output, { recursive: true, withFileTypes: true }).filter((file) => file.isFile())) {
    const bytes = readFileSync(join(file.parentPath, file.name))
    for (const secret of ['SEO_PRIVATE_TITLE_SENTINEL', 'SEO_PRIVATE_BODY_SENTINEL', 'seo-private-tag']) {
      expect(bytes.includes(Buffer.from(secret)), `${file.name} contains ${secret}`).toBe(false)
    }
  }
})

test('SPA navigation replaces schema, article fields, canonical, language, and error indexing state', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (/hydration/i.test(message.text())) errors.push(message.text()) })
  await page.goto(`${base}${articlePath}`)
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await page.locator('.VPNavBarMenu').getByRole('link', { name: 'About', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('meta[property^="article:"]')).toHaveCount(0)
  await expect(page.locator('meta[name="keywords"]')).toHaveCount(0)
  await expect(page.locator('#page-schema')).toHaveCount(1)
  await expect.poll(() => page.locator('#page-schema').textContent()).toContain('AboutPage')
  expect(await page.locator('#page-schema').textContent()).not.toContain('BlogPosting')
  await page.locator('.VPNavBarMenu').getByRole('link', { name: 'Blog', exact: true }).click()
  await page.locator('.tag-list').getByRole('link', { name: 'café noir', exact: true }).click()
  await page.getByRole('link', { name: title, exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description)
  await expect(page.locator('#page-schema')).toHaveCount(1)
  await page.evaluate(() => {
    const link = document.createElement('a')
    link.href = '/missing-seo-page/'
    link.id = 'missing-link'
    link.textContent = 'Missing page'
    document.body.appendChild(link)
  })
  await page.locator('#missing-link').click()
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
  await expect(page.locator('#page-schema')).toHaveCount(0)
  await page.getByRole('link', { name: 'Back to home' }).click()
  await expect(page.locator('meta[name="robots"]')).toHaveCount(1)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://vitor.run/')
  expect(errors).toEqual([])
})

test('analytics loads once on the production origin and leaves automatic page views with GA4', async ({ page, request }) => {
  await productionOrigin(page, request)
  let loads = 0
  await page.route('https://www.googletagmanager.com/gtag/js?*', (route) => {
    loads++
    return route.fulfill({ contentType: 'application/javascript', body: 'window.__analyticsLoaded = true' })
  })
  await page.goto('https://vitor.run/about/')
  await expect.poll(() => loads).toBe(1)
  await page.locator('.VPNavBarMenu').getByRole('link', { name: 'Blog', exact: true }).click()
  await page.locator('.VPNavBarMenu').getByRole('link', { name: 'Contact', exact: true }).click()
  await expect(page.getByRole('heading', { name: /^Contact/, level: 1 })).toBeVisible()
  const commands = await page.evaluate(() => {
    const target = window as Window & { dataLayer?: IArguments[] }
    return target.dataLayer?.map((args) => Array.from(args))
  })
  expect(commands).toHaveLength(2)
  expect(commands?.[0][0]).toBe('js')
  expect(commands?.[1]).toEqual(['config', 'G-7V8YRTTQ9S'])
  expect(loads).toBe(1)
  await expect(page.locator('#site-analytics')).toHaveCount(1)
})

test('a release build served locally contacts neither analytics nor Disqus', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => {
    if (/disqus|googletagmanager|google-analytics/.test(request.url())) requests.push(request.url())
  })
  await page.goto(`${base}${articlePath}`)
  await expect(page.getByRole('region', { name: 'Comments' })).toContainText('published website')
  expect(requests).toEqual([])
})

test('comments reset to another post with its own identifier and language, and show load failures', async ({ page, request }) => {
  await productionOrigin(page, request)
  await page.route('https://www.googletagmanager.com/**', (route) => route.fulfill({ contentType: 'application/javascript', body: '' }))
  await page.route('https://vitor-run.disqus.com/embed.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: `
      window.__threads = [];
      function render(config) {
        const value = { page: {}, language: '' };
        config.call(value); window.__threads.push(value);
        document.getElementById('disqus_thread').textContent = value.page.identifier;
      }
      window.DISQUS = { reset(options) { if (options.reload) render(options.config); } };
      render(window.disqus_config);
    `,
  }))
  await page.goto(`https://vitor.run${puma}`)
  await expect(page.locator('#disqus_thread')).toHaveText(puma.split('/')[2])
  await page.locator('.breadcrumbs').getByRole('link', { name: 'Blog', exact: true }).click()
  await page.getByRole('link', { name: title, exact: true }).click()
  await expect(page.locator('#disqus_thread')).toHaveText(slug)
  const threads = await page.evaluate(() => (window as unknown as { __threads: unknown[] }).__threads)
  expect(threads.at(-1)).toMatchObject({ language: 'pt_BR', page: {
    identifier: slug, url: `https://vitor.run${articlePath}`, title: Array.from(title).slice(0, 200).join(''),
  } })
  await page.route('https://vitor-run.disqus.com/embed.js', (route) => route.abort())
  await page.reload()
  await expect(page.getByRole('region', { name: 'Comments' })).toContainText('Comments could not be loaded')
})
