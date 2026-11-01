import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import type { PageData } from 'vitepress'
import { stringify } from 'yaml'
import { applyPageSeo } from './seo.ts'
import { getPublicationFiles } from './publication.ts'

function page(overrides: Partial<PageData> = {}): PageData {
  return {
    title: 'Example post', description: 'An example description.',
    relativePath: 'blog/example/index.md', filePath: 'blog/[slug]/index.md', headers: [],
    params: { slug: 'example' },
    frontmatter: { title: overrides.title ?? 'Example post', language: 'pt-BR', date: '2024-02-29', tags: ['tech', 'café'] },
    ...overrides,
  }
}

test('article SEO uses the publication language, date, author, canonical and every tag', () => {
  const data = page()
  applyPageSeo(data, true)
  const head = data.frontmatter.head
  assert.equal(data.frontmatter.lang, 'pt-BR')
  assert.ok(head.some((tag: unknown[]) => JSON.stringify(tag).includes('https://vitor.run/blog/example/')))
  const schema = JSON.parse(head.find((tag: unknown[]) => tag[0] === 'script')[2])
  const article = schema['@graph'].find((node: Record<string, unknown>) => node['@type'] === 'BlogPosting')
  assert.equal(article.datePublished, '2024-02-29')
  assert.equal(article.dateModified, undefined)
  assert.equal(article.inLanguage, 'pt-BR')
  assert.equal(article.keywords, 'tech, café')
  assert.equal(article.author['@id'], 'https://vitor.run/#author')
  assert.deepEqual(head.filter((tag: [string, Record<string, string>]) => tag[1].property === 'article:tag')
    .map((tag: [string, Record<string, string>]) => tag[1].content), ['tech', 'café'])
})

test('preview pages, draft pages, and errors stay non-indexable', () => {
  for (const [data, production] of [[page(), false], [page({ frontmatter: {
    language: 'en', date: '2024-01-01', tags: [], draft: true,
  } }), true], [page({ relativePath: '404.md', isNotFound: true }), true]] as const) {
    applyPageSeo(data, production)
    assert.ok(data.frontmatter.head.some((tag: [string, Record<string, string>]) => tag[1].content === 'noindex, nofollow'))
  }
  const notFound = page({ relativePath: '404.md', isNotFound: true })
  applyPageSeo(notFound, true)
  assert.ok(!JSON.stringify(notFound.frontmatter.head).includes('canonical'))
})

test('JSON-LD cannot close its script tag through an authored title or description', () => {
  const data = page({ title: '</script><script>injected</script>', description: '<!-- & "quoted" -->' })
  applyPageSeo(data, true)
  const schema = data.frontmatter.head.find((tag: unknown[]) => tag[0] === 'script')[2]
  assert.ok(!schema.includes('<'))
  const article = JSON.parse(schema)['@graph'].find((node: Record<string, unknown>) => node['@type'] === 'BlogPosting')
  assert.equal(article.headline, data.title)
  assert.equal(article.description, data.description)
})

test('tag archives have specific descriptions and encoded canonical URLs', () => {
  const data = page({ relativePath: 'tags/café noir/index.md', params: { tag: 'café noir' }, frontmatter: {} })
  applyPageSeo(data, true)
  assert.equal(data.description, 'Posts tagged with café noir.')
  const canonical = data.frontmatter.head.find((tag: [string, Record<string, string>]) => tag[1].rel === 'canonical')
  assert.equal(canonical[1].href, 'https://vitor.run/tags/caf%C3%A9%20noir/')
})

test('posts without optional descriptions still have a page-specific search summary', () => {
  const data = page({ description: '' })
  applyPageSeo(data, true)
  assert.equal(data.description, 'Read Example post by Vitor Hugo Salgado.')
})

test('feeds and sitemaps share validated published data and preserve RSS identifiers', (t) => {
  mkdirSync('.local', { recursive: true })
  const directory = mkdtempSync(join(process.cwd(), '.local/publication-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const fields = { title: 'Café & <code> "examples"', slug: 'example', date: '2024-02-29',
    language: 'pt-br', tags: ['café noir'], description: 'A & B < C' }
  writeFileSync(join(directory, 'published.md'), `---\n${stringify(fields)}---\nBody.`)
  writeFileSync(join(directory, 'draft.md'), '---\ndraft: true\ntitle: PRIVATE_TITLE\n---\nPRIVATE_BODY')
  const files = getPublicationFiles(true, directory)
  assert.ok(files['rss.xml'].content.includes('Café &amp; &lt;code&gt; &quot;examples&quot;'))
  assert.ok(files['rss.xml'].content.includes('<link>https://vitor.run/blog/example/</link>'))
  assert.ok(files['rss.xml'].content.includes('<guid isPermaLink="true">https://vitor.run/blog/example</guid>'))
  assert.ok(files['rss.xml'].content.includes('Thu, 29 Feb 2024 00:00:00 GMT'))
  assert.ok(files['rss.xml'].content.includes('<dc:language>pt-BR</dc:language>'))
  assert.ok(files['sitemap.xml'].content.includes('https://vitor.run/tags/caf%C3%A9%20noir/'))
  assert.ok(!files['sitemap.xml'].content.includes('lastmod'))
  assert.ok(files['robots.txt'].content.includes('Sitemap: https://vitor.run/sitemap.xml'))
  assert.ok(!getPublicationFiles(false, directory)['robots.txt'].content.includes('Sitemap:'))
  for (const file of Object.values(files)) assert.ok(!file.content.includes('PRIVATE_'))

  writeFileSync(join(directory, 'published.md'), `---\n${stringify({ ...fields, title: 'Invalid\u0001XML' })}---\nBody.`)
  assert.throws(() => getPublicationFiles(true, directory), /forbidden in XML 1.0/)
})
