import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, rmdirSync, writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { stringify } from 'yaml'

test('production builds publish, unpublish, and reject invalid content consistently', { timeout: 60_000 }, (t) => {
  const root = process.cwd()
  const slug = `content-model-${randomUUID()}`
  const postFile = join(root, 'blog', `${slug}.md`)
  const draftFile = join(root, 'blog', `${slug}-draft.md`)
  const images = join(root, 'blog', slug)
  const publicDirectory = join(root, 'site/public')
  const hadPublicDirectory = existsSync(publicDirectory)
  const publicImageName = `${slug}.svg`
  mkdirSync(join(root, '.local'), { recursive: true })
  const directory = mkdtempSync(join(root, '.local/content-build-'))
  const output = join(directory, 'dist')

  t.after(() => {
    for (const file of [postFile, draftFile, join(publicDirectory, publicImageName)]) rmSync(file, { force: true })
    rmSync(images, { recursive: true, force: true })
    rmSync(directory, { recursive: true, force: true })
    if (!hadPublicDirectory && existsSync(publicDirectory) && readdirSync(publicDirectory).length === 0) {
      rmdirSync(publicDirectory)
    }
  })

  mkdirSync(images)
  mkdirSync(publicDirectory, { recursive: true })
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect id="illustration" width="32" height="32" fill="red"/></svg>'
  writeFileSync(join(images, 'published image.svg'), svg + `<!-- ${'asset fixture '.repeat(500)} -->`)
  writeFileSync(join(images, 'draft-only.svg'), svg.replace('red', 'UNPUBLISHED_IMAGE_SENTINEL'))
  writeFileSync(join(publicDirectory, publicImageName), svg)
  writeFileSync(draftFile, `---\ndraft: true\ntitle: UNPUBLISHED_TITLE_SENTINEL\n---\nUNPUBLISHED_BODY_SENTINEL\n![Private](${slug}/draft-only.svg)`)

  const writePost = (draft: boolean, date = '2024-02-29') => writeFileSync(postFile, [
    '---', stringify({
      title: 'Publication lifecycle fixture', slug, date, language: 'pt-br',
      description: 'A published fixture with local images.',
      tags: [' Data Pipelines ', 'data pipelines', 'Café'], draft,
    }).trimEnd(), '---', '', '---', '',
    'Publication lifecycle body.',
    `![Published content image](<${slug}/published image.svg#illustration>)`,
    '![Reference content image][illustration]',
    `![Public content image](/${publicImageName})`, '',
    `[illustration]: <${slug}/published image.svg>`,
  ].join('\n'))

  const build = () => spawnSync(process.execPath, [
    'node_modules/vitepress/bin/vitepress.js', 'build', 'site', '--outDir', output,
  ], {
    cwd: root, encoding: 'utf8', timeout: 20_000, maxBuffer: 4 * 1024 * 1024,
    // Even an inherited draft flag and development NODE_ENV cannot include drafts in a real build.
    env: { ...process.env, VITOR_PREVIEW_DRAFTS: '1', NODE_ENV: 'development' },
  })
  const artifactFiles = () => readdirSync(output, { recursive: true, withFileTypes: true })
    .filter((file) => file.isFile()).map((file) => join(file.parentPath, file.name))
  const assertAbsent = (needles: string[]) => {
    for (const file of artifactFiles()) {
      const bytes = readFileSync(file)
      for (const needle of needles) {
        assert.ok(!bytes.includes(Buffer.from(needle)), `${file} exposes ${needle}`)
      }
    }
  }

  writePost(false)
  const published = build()
  assert.equal(published.status, 0, published.stdout + published.stderr)
  const html = readFileSync(join(output, 'blog', slug, 'index.html'), 'utf8')
  assert.ok(html.includes('Publication lifecycle body.'))
  assert.ok(html.includes('PT-BR'))
  assert.ok(html.includes('https://vitor.run/blog/'))
  const bundledImages = new Set<string>()
  for (const alt of ['Published content image', 'Reference content image', 'Public content image']) {
    const image = html.match(new RegExp(`<img\\b[^>]*alt="${alt}"[^>]*>`))?.[0]
    assert.ok(image, `${alt} is missing from the generated HTML`)
    const source = image.match(/\bsrc="([^"]+)"/)?.[1]
    assert.ok(source, `${alt} has no source`)
    if (source.startsWith('data:')) {
      assert.ok(source.startsWith('data:image/svg+xml'), `${alt} did not enter the asset pipeline`)
    } else {
      assert.ok(source.startsWith('/'), `${alt} still resolves relative to a generated page`)
      const path = join(output, decodeURIComponent(source.split(/[?#]/)[0]))
      assert.ok(existsSync(path), `${alt} points to a missing asset`)
      if (alt !== 'Public content image') bundledImages.add(path)
    }
  }
  assert.ok(bundledImages.size > 0, 'the fixture did not exercise a bundled image file')
  for (const [tag, encoded] of [['data pipelines', 'data%20pipelines'], ['café', 'caf%C3%A9']]) {
    const archive = readFileSync(join(output, 'tags', tag, 'index.html'), 'utf8')
    assert.ok(archive.includes(`https://vitor.run/tags/${encoded}/`))
    assert.ok(archive.includes(`/blog/${slug}/`))
  }
  const blog = readFileSync(join(output, 'blog/index.html'), 'utf8')
  assert.ok(blog.includes('/tags/data%20pipelines/'))
  assertAbsent(['UNPUBLISHED_TITLE_SENTINEL', 'UNPUBLISHED_BODY_SENTINEL', 'UNPUBLISHED_IMAGE_SENTINEL'])

  writePost(true)
  const unpublished = build()
  assert.equal(unpublished.status, 0, unpublished.stdout + unpublished.stderr)
  assert.ok(!existsSync(join(output, 'blog', slug, 'index.html')), 'an unpublished route survived the rebuild')
  assert.ok(!existsSync(join(output, 'tags/data pipelines/index.html')), 'a draft-only tag survived the rebuild')
  assert.ok(!existsSync(join(output, 'tags/café/index.html')), 'a draft-only Unicode tag survived the rebuild')
  for (const image of bundledImages) assert.ok(!existsSync(image), 'an unpublished image survived the rebuild')
  assertAbsent(['Publication lifecycle fixture', 'Publication lifecycle body.', 'UNPUBLISHED_BODY_SENTINEL'])

  writePost(false, '2026-02-30')
  const invalid = build()
  assert.notEqual(invalid.status, 0, 'VitePress silently omitted an invalid article instead of failing')
  assert.match(invalid.stdout + invalid.stderr, new RegExp(`${slug}\\.md: "date"`))
})
