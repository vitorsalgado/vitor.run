import { expect, test } from '@playwright/test'
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const postPath = '/blog/puma4j-easier-way-to-load-and-convert-resource-files-in-your-junit-tests/'
const draftSlug = 'dicaf-dependency-injection-container-for-javascript-typescript'
const output = join(process.cwd(), 'site/.vitepress/dist')
const screenshots = join(process.cwd(), '.local/milestone1')

test.describe('Static publication', () => {
  test.use({ javaScriptEnabled: false })

  test('home and article remain readable when JavaScript is unavailable', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Vitor Hugo Salgado', level: 1 })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Vitor Hugo Salgado' })).toBeVisible()
    await page.goto(postPath)
    await expect(page.getByRole('heading', { name: /Puma4j/, level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Supported File Types' })).toBeVisible()
    await expect(page.locator('main').getByText('Jackson Object Mapper')).toBeVisible()
  })

  test('the article response contains its own metadata before hydration', async ({ page, request }) => {
    const response = await request.get(postPath)
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain('Supported File Types')
    await page.goto(postPath)
    await expect(page).toHaveTitle('Puma4j — An easy way to load file resources into JUnit tests | vitor.run')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',
      'Load and parse file resources into JUnit tests with just a couple of annotations.')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://vitor.run${postPath}`)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  })

  test('blog and published tag archives are generated as real pages', async ({ page, request }) => {
    for (const path of ['/blog/', '/tags/tech/', '/tags/java/', '/tags/testing/']) {
      expect((await request.get(path)).status()).toBe(200)
      await page.goto(path)
      await expect(page.getByRole('link', { name: /Puma4j/ })).toBeVisible()
      await expect(page.getByText(/DiCaf/)).toHaveCount(0)
    }
  })

  test('draft content and metadata never enter the deployable artifact', async ({ request }) => {
    for (const file of readdirSync(output, { recursive: true, withFileTypes: true })) {
      if (!file.isFile()) continue
      const path = join(file.parentPath, file.name)
      const bytes = readFileSync(path)
      for (const needle of [draftSlug, 'DiCaf', 'reflect-metadata']) {
        expect(bytes.includes(Buffer.from(needle)), `${path} exposes ${needle}`).toBe(false)
      }
    }
    expect((await request.get(`/blog/${draftSlug}/`)).status()).toBe(404)
    expect((await request.get('/tags/typescript/')).status()).toBe(404)
  })

  test('directory URLs redirect consistently and missing pages return HTTP 404', async ({ page, request }) => {
    const redirect = await request.get('/blog', { maxRedirects: 0 })
    expect(redirect.status()).toBe(301)
    expect(redirect.headers().location).toBe('/blog/')
    expect((await request.get('/not-a-real-page/')).status()).toBe(404)
    await page.goto('/404.html')
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to home' })).toBeVisible()
  })
})

test('client navigation updates the page and canonical without hydration errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (/hydration/i.test(message.text())) errors.push(message.text())
  })
  await page.goto('/blog/')
  await page.evaluate(() => document.documentElement.dataset.navigationProof = 'retained')
  await page.getByRole('link', { name: /Puma4j/ }).click()
  await expect(page).toHaveURL(new RegExp(`${postPath}$`))
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://vitor.run${postPath}`)
  await expect(page.locator('html')).toHaveAttribute('data-navigation-proof', 'retained')
  await page.getByRole('link', { name: 'Blog', exact: true }).last().click()
  await page.locator('.tag-list').getByRole('link', { name: 'tech', exact: true }).click()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://vitor.run/tags/tech/')
  await expect(page).toHaveTitle('tech | vitor.run')
  expect(errors).toEqual([])
})

test('the default theme supports desktop appearance and saved dark mode', async ({ page }) => {
  mkdirSync(screenshots, { recursive: true })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await page.screenshot({ path: join(screenshots, 'home-desktop.png'), fullPage: true })
  await page.goto(postPath)
  await expect(page.locator('button.copy').first()).toBeAttached()
  await page.screenshot({ path: join(screenshots, 'post-desktop.png'), fullPage: true })
  await page.getByRole('switch', { name: 'Switch to dark theme' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark')
  await page.screenshot({ path: join(screenshots, 'post-desktop-dark.png'), fullPage: true })
})

test('the mobile layout fits the viewport and its menu navigates', async ({ page }) => {
  mkdirSync(screenshots, { recursive: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/blog/')
  await page.screenshot({ path: join(screenshots, 'blog-mobile.png'), fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  const menu = page.getByRole('button', { name: 'mobile navigation' })
  await menu.click()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await page.locator('#VPNavScreen').getByRole('switch', { name: 'Switch to dark theme' }).click()
  await page.locator('#VPNavScreen').getByRole('link', { name: 'Home', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Vitor Hugo Salgado', level: 1 })).toBeVisible()
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.screenshot({ path: join(screenshots, 'home-mobile-dark.png'), fullPage: true })
})

test('local content additions, edits, and draft changes refresh generated routes', async ({ page, request }) => {
  test.setTimeout(45_000)
  const file = join(process.cwd(), 'blog/milestone-one-content-watch-fixture.md')
  const route = '/blog/milestone-one-content-watch-fixture/'
  const moduleUrl = `http://127.0.0.1:5174${route}index.md?import`
  const writeFixture = (title: string, draft: boolean) => writeFileSync(file, [
    '---', `title: ${title}`, 'slug: milestone-one-content-watch-fixture',
    'date: 2026-01-01', 'description: Local content watcher proof.',
    'language: EN', 'tags: [Tech, tech, data pipelines, Café]', `draft: ${draft}`, '---', '', 'Content watcher proof.',
  ].join('\n'), { flag: 'w' })
  const moduleText = async () => {
    try { return await (await request.get(moduleUrl, { headers: { Accept: 'application/javascript' } })).text() }
    catch { return '' }
  }

  expect(() => readFileSync(file)).toThrow()
  try {
    writeFixture('Local watcher first title', false)
    await expect.poll(moduleText, { timeout: 15_000 }).toContain('Local watcher first title')
    await page.goto(`http://127.0.0.1:5174${route}`)
    await expect(page.getByRole('heading', { name: 'Local watcher first title' })).toBeVisible()
    await page.getByRole('link', { name: 'Blog', exact: true }).last().click()
    await page.locator('.tag-list').getByRole('link', { name: 'data pipelines', exact: true }).click()
    await expect(page).toHaveURL('http://127.0.0.1:5174/tags/data%20pipelines/')
    await expect(page.getByRole('link', { name: 'Local watcher first title', exact: true })).toBeVisible()
    await page.locator('.tag-list').getByRole('link', { name: 'café', exact: true }).click()
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://vitor.run/tags/caf%C3%A9/')
    await expect(page.getByRole('link', { name: 'Local watcher first title', exact: true })).toBeVisible()
    await page.goto(`http://127.0.0.1:5174${route}`)
    writeFixture('Local watcher updated title', false)
    await expect.poll(moduleText, { timeout: 15_000 }).toContain('Local watcher updated title')
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Local watcher updated title' })).toBeVisible()
    writeFixture('Local watcher unpublished title', true)
    await expect.poll(async () => {
      try { return (await request.get(moduleUrl, { headers: { Accept: 'application/javascript' } })).status() }
      catch { return 0 }
    }, { timeout: 15_000 }).toBe(404)
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  } finally {
    rmSync(file, { force: true })
  }
})
