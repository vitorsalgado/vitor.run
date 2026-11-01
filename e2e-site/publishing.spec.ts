import { expect, test } from '@playwright/test'
import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { stringify } from 'yaml'
import { getPostSources } from '../site/.vitepress/posts'

test('create, preview, publish, and unpublish a post without exposing a draft on the public site', async ({ page, request }) => {
  test.setTimeout(60_000)
  const root = process.cwd()
  const slug = `publishing-preview-${randomUUID()}`
  const title = 'New draft publishing fixture'
  const route = `/blog/${slug}/`
  const draftUrl = `http://127.0.0.1:5178${route}`
  const publicUrl = `http://127.0.0.1:5174${route}`
  const images = join(root, 'blog', slug)
  const moduleText = async (url: string) => {
    try { return await (await request.get(`${url}index.md?import`, { headers: { Accept: 'application/javascript' } })).text() }
    catch { return '' }
  }
  const moduleStatus = async (url: string) => {
    try { return (await request.get(`${url}index.md?import`, { headers: { Accept: 'application/javascript' } })).status() }
    catch { return 0 }
  }
  const screenshots = join(root, '.local/milestone4')
  mkdirSync(screenshots, { recursive: true })

  try {
    const result = spawnSync(process.execPath, ['scripts/new-post.mjs', title, '--slug', slug], {
      cwd: root, encoding: 'utf8',
    })
    expect(result.status, result.stderr).toBe(0)
    const source = getPostSources().find(({ data }) => data.slug === slug)!
    expect(source.data.draft).toBe(true)
    expect(source.content.trim()).toBe('')
    await expect.poll(() => moduleText(draftUrl), { timeout: 15_000 }).toContain(title)
    await expect.poll(() => moduleStatus(publicUrl)).toBe(404)
    await page.goto(draftUrl)
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await expect(page.getByRole('status')).toHaveText('Draft preview · Unpublished posts included')
    await expect(page.getByText('Draft · Not published', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Copy post link', exact: true })).toHaveCount(0)
    await expect(page.getByRole('region', { name: 'Comments' })).toHaveCount(0)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')

    mkdirSync(images)
    writeFileSync(join(images, 'preview image.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"><rect id="illustration" width="80" height="40" fill="red"/></svg>')
    const update = (draft: boolean) => writeFileSync(source.sourcePath, [
      '---', stringify({ ...source.data, title: `${title} updated`, tags: [`${slug} tag`], draft }).trimEnd(),
      '---', '', 'Draft publishing body.', `![Draft illustration](<${slug}/preview image.svg#illustration>)`,
    ].join('\n'))
    update(true)
    await expect.poll(() => moduleText(draftUrl), { timeout: 15_000 }).toContain('Draft publishing body.')
    await page.reload()
    await expect(page.getByText('Draft publishing body.', { exact: true })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Draft illustration' })).toBeVisible()
    await expect.poll(() => page.getByRole('img', { name: 'Draft illustration' })
      .evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBe(80)

    await page.setViewportSize({ width: 390, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    const banner = await page.locator('.draft-preview-banner').boundingBox()
    const navigation = await page.locator('.VPNavBar').boundingBox()
    expect(banner!.y + banner!.height).toBeLessThanOrEqual(navigation!.y)
    await page.screenshot({ path: join(screenshots, 'draft-mobile.png'), fullPage: true })
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.screenshot({ path: join(screenshots, 'draft-desktop.png'), fullPage: true })

    await page.locator('.breadcrumbs').getByRole('link', { name: 'Blog', exact: true }).click()
    const entry = page.locator('.post-list > li').filter({ has: page.getByRole('link', { name: `${title} updated`, exact: true }) })
    await expect(entry.getByText('Draft', { exact: true })).toBeVisible()
    await entry.getByRole('link', { name: `${slug} tag`, exact: true }).click()
    await expect(page.getByRole('link', { name: `${title} updated`, exact: true })).toBeVisible()
    expect((await request.get(route)).status()).toBe(404)

    update(false)
    await expect.poll(() => moduleText(publicUrl), { timeout: 15_000 }).toContain(`${title} updated`)
    await page.goto(publicUrl)
    await expect(page.getByRole('heading', { name: `${title} updated`, exact: true })).toBeVisible()
    await expect(page.locator('.draft-preview-banner')).toHaveCount(0)
    await expect(page.locator('.draft-badge')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Copy post link', exact: true })).toBeVisible()

    update(true)
    await expect.poll(() => moduleStatus(publicUrl), { timeout: 15_000 }).toBe(404)
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Page not found', exact: true })).toBeVisible()
    await page.goto(draftUrl)
    await expect(page.getByRole('heading', { name: `${title} updated`, exact: true })).toBeVisible()
    await expect(page.getByText('Draft · Not published', { exact: true })).toBeVisible()
  } finally {
    for (const file of readdirSync(join(root, 'blog')).filter((file) => file.endsWith(`-${slug}.md`))) {
      rmSync(join(root, 'blog', file), { force: true })
    }
    rmSync(images, { recursive: true, force: true })
  }
})
