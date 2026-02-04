import { expect, test } from '@playwright/test'

test.describe('Blog', () => {
  test('blog list shows posts', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.getByRole('heading', { name: 'Blog', level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: /Hello World/i })).toBeVisible()
  })

  test('blog post page shows content', async ({ page }) => {
    await page.goto('/blog/hello-world')
    await expect(page.getByRole('heading', { name: 'Hello World', level: 1 })).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByText(/This is your first blog post/)).toBeVisible()
    await expect(page.getByText(/markdown/)).toBeVisible()
  })

  test('blog post has SEO meta', async ({ page }) => {
    await page.goto('/blog/hello-world')
    await expect(page.getByRole('heading', { name: 'Hello World' })).toBeVisible({
      timeout: 10_000,
    })
    const title = await page.title()
    expect(title).toContain('Hello World')
    expect(title).toContain('vitor.run')
  })

  test('blog post 404 shows fallback', async ({ page }) => {
    await page.goto('/blog/non-existent-post')
    await expect(page.getByText('Post not found')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('link', { name: /Back to Blog/ })).toBeVisible()
  })
})
