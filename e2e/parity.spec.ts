import { expect, test } from '@playwright/test'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const slug = 'puma4j-easier-way-to-load-and-convert-resource-files-in-your-junit-tests'
const postPath = `/blog/${slug}/`
const title = 'Puma4j — An easy way to load file resources into JUnit tests'

test.describe('Remaining static pages', () => {
  test.use({ javaScriptEnabled: false })

  test('About and Contact are readable and linked without JavaScript', async ({
    page,
    request,
  }) => {
    for (const path of ['/about/', '/contact/'])
      expect((await request.get(path)).status()).toBe(200)
    await page.goto('/about/')
    await expect(page.getByRole('heading', { name: /^About/, level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: /^Books/ })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Verve Group' })).toHaveAttribute(
      'href',
      'https://verve.com/',
    )
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText(
      /Home\s*\/\s*About/,
    )
    await page.locator('.VPNavBarMenu').getByRole('link', { name: 'Contact', exact: true }).click()
    await expect(page.getByRole('heading', { name: /^Contact/, level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Email: vsalgadopb@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:vsalgadopb@gmail.com',
    )
    await expect(
      page.locator('.contact-links').getByRole('link', { name: /LinkedIn/ }),
    ).toHaveAttribute('href', 'https://linkedin.com/in/vitorsalgado')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://vitor.run/contact/',
    )
  })

  test('article sharing and tag links remain useful without JavaScript', async ({ page }) => {
    await page.goto(postPath)
    await page.locator('summary[aria-label="Share post"]').click()
    const share = page.getByRole('navigation', { name: 'Share options' })
    await expect(share.getByRole('link', { name: 'LinkedIn', exact: true })).toHaveAttribute(
      'href',
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://vitor.run${postPath}`)}`,
    )
    await expect(share.getByRole('link', { name: 'X', exact: true })).toHaveAttribute(
      'href',
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://vitor.run${postPath}`)}&text=${encodeURIComponent(title)}`,
    )
    await expect(page.getByRole('region', { name: 'Comments' })).toContainText('JavaScript enabled')
    await page
      .getByRole('navigation', { name: 'Post tags' })
      .getByRole('link', { name: 'java', exact: true })
      .click()
    await expect(page).toHaveURL(/\/tags\/java\/$/)
    await expect(page.getByRole('link', { name: title, exact: true })).toBeVisible()
  })
})

test('copy controls use the canonical URL and preserve the original code', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto(postPath)
  await page.getByRole('button', { name: 'Copy post link', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Link copied!')
  expect(
    await page.evaluate(() => {
      return navigator.clipboard.readText()
    }),
  ).toBe(`https://vitor.run${postPath}`)
  const block = page.locator('.language-gradle')
  await block.hover()
  await block.getByRole('button', { name: 'Copy code', exact: true }).click()
  expect(
    (
      await page.evaluate(() => {
        return navigator.clipboard.readText()
      })
    ).trim(),
  ).toBe('implementation "io.github.vitorsalgado.puma4j:puma4j-junit5-extension:4.0.2"')
  await page.evaluate(() => {
    return Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: () => {
          return Promise.reject(new Error('Clipboard unavailable'))
        },
      },
    })
  })
  await page.getByRole('button', { name: 'Copy post link', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Could not copy the link')
})

test('share disclosure supports keyboard use, Escape, and outside clicks', async ({ page }) => {
  await page.goto(postPath)
  const summary = page.locator('summary[aria-label="Share post"]')
  await summary.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('navigation', { name: 'Share options' })).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('navigation', { name: 'Share options' }).getByRole('link').first(),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(summary).toBeFocused()
  await expect(page.locator('.post-share')).not.toHaveAttribute('open')
  await summary.click()
  await page.getByRole('heading', { name: title, exact: true }).click()
  await expect(page.locator('.post-share')).not.toHaveAttribute('open')
})

test('keyboard navigation reaches content and the mobile menu closes on Escape', async ({
  page,
}) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#VPContent')).toBeFocused()
  await page.setViewportSize({ width: 390, height: 844 })
  const menu = page.getByRole('button', { name: 'Menu' })
  await menu.focus()
  await page.keyboard.press('Enter')
  await expect(
    page.locator('#VPNavScreen').getByRole('link', { name: 'Home', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(menu).toBeFocused()
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await menu.click()
  await page.locator('#VPNavScreen').getByRole('link', { name: 'About', exact: true }).click()
  await expect(page.getByRole('heading', { name: /^About/, level: 1 })).toBeVisible()
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  expect(
    await page.evaluate(() => {
      return document.documentElement.scrollWidth
    }),
  ).toBeLessThanOrEqual(390)
})

test('local previews do not contact Disqus or production analytics', async ({ page }) => {
  const external: string[] = []
  page.on('request', (request) => {
    if (/disqus|google-analytics|googletagmanager/.test(request.url())) external.push(request.url())
  })
  await page.goto(postPath)
  await expect(page.getByRole('region', { name: 'Comments' })).toContainText('published website')
  await page.getByRole('switch', { name: 'Appearance' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  expect(external).toEqual([])
})

test('Disqus retains thread identity and resets across theme and client navigation', async ({
  page,
  request,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => {
    return errors.push(error.message)
  })
  // Exercise the production-origin gate with local HTML and a stubbed vendor script.
  await page.route('https://vitor.run/**', async (route) => {
    const url = new URL(route.request().url())
    const response = await request.get(`http://127.0.0.1:4177${url.pathname}${url.search}`)
    await route.fulfill({ response })
  })
  await page.route('https://vitor-run.disqus.com/embed.js', (route) => {
    return route.fulfill({
      contentType: 'application/javascript',
      body: `
      window.__threads = [];
      window.__stops = 0;
      function render(config) {
        const value = { page: {}, language: '' };
        config.call(value);
        window.__threads.push({ ...value, dark: document.documentElement.classList.contains('dark') });
        document.getElementById('disqus_thread').textContent = 'Stubbed discussion';
      }
      window.DISQUS = { reset(options) {
        if (options.reload) render(options.config);
        else window.__stops++;
      }};
      render(window.disqus_config);
    `,
    })
  })
  await page.goto(`https://vitor.run${postPath}`)
  await expect(page.locator('#disqus_thread')).toHaveText('Stubbed discussion')
  const threads = () => {
    return page.evaluate(() => {
      return (window as unknown as { __threads: unknown[] }).__threads
    })
  }
  expect(await threads()).toEqual([
    {
      page: { identifier: slug, url: `https://vitor.run${postPath}`, title },
      language: 'en',
      dark: false,
    },
  ])
  await page.getByRole('switch', { name: 'Appearance' }).click()
  await expect.poll(threads).toHaveLength(2)
  expect((await threads()).at(-1)).toMatchObject({ dark: true })
  await page.locator('.VPNavBarMenu').getByRole('link', { name: 'About', exact: true }).click()
  await expect(page.getByRole('heading', { name: /^About/, level: 1 })).toBeVisible()
  expect(
    await page.evaluate(() => {
      return (window as unknown as { __stops: number }).__stops
    }),
  ).toBeGreaterThan(0)
  await page.locator('.VPNavBarMenu').getByRole('link', { name: 'Blog', exact: true }).click()
  await page.getByRole('link', { name: title, exact: true }).click()
  await expect(page.locator('#disqus_thread')).toHaveText('Stubbed discussion')
  await expect.poll(threads).toHaveLength(3)
  expect((await threads()).at(-1)).toMatchObject({
    page: { identifier: slug, url: `https://vitor.run${postPath}` },
  })
  expect(errors).toEqual([])
})

test('Markdown keeps GFM content, code, anchors, and navigation usable', async ({
  page,
  request,
}) => {
  test.setTimeout(30_000)
  const fixture = 'milestone-three-markdown-fixture'
  const path = join(process.cwd(), 'blog', `${fixture}.md`)
  const url = `http://127.0.0.1:5174/blog/${fixture}/`
  const moduleUrl = `${url}index.md?import`
  try {
    writeFileSync(
      path,
      [
        '---',
        'title: Markdown compatibility fixture',
        `slug: ${fixture}`,
        'date: 2026-01-01',
        'language: EN',
        '---',
        '',
        '## Markdown details',
        '',
        '| Feature | State |',
        '| --- | --- |',
        '| Table content | supported |',
        '',
        '- [x] Published item',
        '- [ ] Pending item',
        '',
        '~~Removed text~~ and **strong text**. Visit https://example.com.',
        '',
        '[Contact](/contact/) and [jump to heading](#markdown-details).',
        '',
        '::: v-pre',
        'Literal {{ template }} braces.',
        ':::',
        '',
        '```js',
        'const value = "{{ literal }}";',
        '```',
      ].join('\n'),
      { flag: 'wx' },
    )
    await expect
      .poll(async () => {
        try {
          return (
            await request.get(moduleUrl, { headers: { Accept: 'application/javascript' } })
          ).status()
        } catch {
          return 0
        }
      })
      .toBe(200)
    await page.goto(url)
    await expect(page.getByRole('table')).toContainText('Table content')
    await expect(page.getByRole('checkbox', { name: 'Published item' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Pending item' })).not.toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Pending item' })).toBeDisabled()
    await expect(page.locator('s')).toHaveText('Removed text')
    await expect(page.getByText('Literal {{ template }} braces.', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'https://example.com' })).toHaveAttribute(
      'target',
      '_blank',
    )
    await expect(page.locator('#markdown-details')).toContainText('Markdown details')
    await expect(page.locator('.language-js code')).toContainText('const value = "{{ literal }}";')
    await page.getByRole('link', { name: 'jump to heading' }).click()
    await expect(page).toHaveURL(`${url}#markdown-details`)
    await page.locator('main').getByRole('link', { name: 'Contact', exact: true }).click()
    await expect(page.getByRole('heading', { name: /^Contact/, level: 1 })).toBeVisible()
  } finally {
    rmSync(path, { force: true })
  }
})

test('migrated layouts fit mobile and desktop in both themes', async ({ page }) => {
  const screenshots = join(process.cwd(), '.local/milestone3')
  mkdirSync(screenshots, { recursive: true })
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    for (const path of ['/about/', '/contact/', '/blog/', postPath]) {
      await page.goto(path)
      expect(
        await page.evaluate(() => {
          return document.documentElement.scrollWidth
        }),
      ).toBeLessThanOrEqual(width)
      const name = path === postPath ? 'post' : path.split('/')[1]
      await page.screenshot({
        path: join(screenshots, `${name}-${width}-light.png`),
        fullPage: true,
      })
    }
  }
  await page.getByRole('switch', { name: 'Appearance' }).click()
  await page.screenshot({ path: join(screenshots, 'post-1280-dark.png'), fullPage: true })
})
