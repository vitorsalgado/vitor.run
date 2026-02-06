import { expect, test } from '@playwright/test'

const PUMA4J_SLUG = 'puma4j-easier-way-to-load-and-convert-resource-files-in-your-junit-tests'

test.describe('Blog', () => {
  test('blog list shows posts', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.getByRole('heading', { name: 'Blog', level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: /Puma4j/i })).toBeVisible()
  })

  test('blog post page shows content', async ({ page }) => {
    await page.goto(`/blog/${PUMA4J_SLUG}`)
    await expect(page.getByRole('heading', { name: /Puma4j/i, level: 1 })).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByRole('article').getByText(/Puma4j/).first()).toBeVisible()
    await expect(page.getByRole('article').getByText(/JUnit/).first()).toBeVisible()
  })

  test('blog post has SEO meta', async ({ page }) => {
    await page.goto(`/blog/${PUMA4J_SLUG}`)
    await expect(page.getByRole('heading', { name: /Puma4j/i, level: 1 })).toBeVisible({
      timeout: 10_000,
    })
    const title = await page.title()
    expect(title).toContain('Puma4j')
    expect(title).toContain('vitor.run')
  })

  test('blog post 404 shows fallback', async ({ page }) => {
    await page.goto('/blog/non-existent-post')
    await expect(page.getByText('Page not found')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('link', { name: /Back to home/i })).toBeVisible()
  })
})
