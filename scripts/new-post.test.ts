import assert from 'node:assert/strict'
import { execFile, spawnSync } from 'node:child_process'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { test, type TestContext } from 'node:test'
import { promisify } from 'node:util'
import { getPostSources, getPublishedPosts } from '../site/.vitepress/posts.ts'

function fixture(t: TestContext) {
  const root = process.cwd()
  mkdirSync('.local', { recursive: true })
  const directory = mkdtempSync(join(root, '.local/new-post-'))
  t.after(() => {
    return rmSync(directory, { recursive: true, force: true })
  })
  for (const child of ['scripts', 'blog', 'elsewhere']) mkdirSync(join(directory, child))
  copyFileSync(join(root, 'scripts/new-post.mjs'), join(directory, 'scripts/new-post.mjs'))
  for (const child of ['node_modules', 'site', 'src'])
    symlinkSync(join(root, child), join(directory, child), 'dir')
  const script = join(directory, 'scripts/new-post.mjs')
  const options = { cwd: join(directory, 'elsewhere'), encoding: 'utf8' as const }
  return {
    directory: join(directory, 'blog'),
    script,
    options,
    run: (...args: string[]) => {
      return spawnSync(process.execPath, [script, ...args], options)
    },
  }
}

test('new posts are unpublished, safely serialize titles, and need a body before publication', (t) => {
  const { directory, run } = fixture(t)
  const title = 'Café: "hello" & goodbye'
  const result = run(title)
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Created draft:.*cafe-hello-goodbye\.md/)
  const [source] = getPostSources(directory)
  assert.equal(source.data.title, title)
  assert.equal(source.data.slug, 'cafe-hello-goodbye')
  assert.equal(source.data.language, 'en')
  assert.equal(source.data.draft, true)
  assert.deepEqual(source.data.tags, [])
  assert.equal(source.content.trim(), '')
  assert.deepEqual(getPublishedPosts(directory), [])
  writeFileSync(
    source.sourcePath,
    readFileSync(source.sourcePath, 'utf8').replace('draft: true', 'draft: false'),
  )
  assert.throws(() => {
    return getPublishedPosts(directory)
  }, /"content" must not be empty/)
})

test('a title cannot inject publication metadata through YAML', (t) => {
  const { directory, run } = fixture(t)
  const title = 'A title\ndraft: false\nslug: injected'
  const result = run(title, '--slug', 'safe-title')
  assert.equal(result.status, 0, result.stderr)
  const [source] = getPostSources(directory)
  assert.equal(source.data.title, title)
  assert.equal(source.data.draft, true)
  assert.equal(source.data.slug, 'safe-title')
})

for (const draft of [true, false]) {
  test(`existing ${draft ? 'draft' : 'published'} slugs are reserved across dates and filenames`, (t) => {
    const { directory, run } = fixture(t)
    const existing = '---\nslug: reserved-slug\ndraft: ' + draft + '\n---\nExisting work.\n'
    writeFileSync(join(directory, '2000-01-01-old-name.md'), existing)
    const result = run('Different title', '--slug', 'reserved-slug')
    assert.equal(result.status, 1)
    assert.match(result.stderr, /already used by .*2000-01-01-old-name\.md/)
    assert.equal(readFileSync(join(directory, '2000-01-01-old-name.md'), 'utf8'), existing)
    assert.deepEqual(readdirSync(directory), ['2000-01-01-old-name.md'])
  })
}

test('an existing target file is never overwritten, even if its slug was removed', (t) => {
  const { directory, run } = fixture(t)
  assert.equal(run('Keep my work').status, 0)
  const [source] = getPostSources(directory)
  const original = '---\ndraft: true\n---\nUnfinished work without a slug.\n'
  writeFileSync(source.sourcePath, original)
  const result = run('Keep my work')
  assert.equal(result.status, 1)
  assert.match(result.stderr, /EEXIST/)
  assert.equal(readFileSync(source.sourcePath, 'utf8'), original)
  assert.equal(readdirSync(directory).length, 1)
})

test('simultaneous creation of the same post has one winner and preserves its draft', async (t) => {
  const { directory, script, options } = fixture(t)
  const execute = promisify(execFile)
  const results = await Promise.allSettled([
    execute(process.execPath, [script, 'Concurrent post'], options),
    execute(process.execPath, [script, 'Concurrent post'], options),
  ])
  assert.equal(
    results.filter((result) => {
      return result.status === 'fulfilled'
    }).length,
    1,
  )
  assert.equal(
    results.filter((result) => {
      return result.status === 'rejected'
    }).length,
    1,
  )
  const [source] = getPostSources(directory)
  assert.equal(readdirSync(directory).length, 1)
  assert.equal(source.data.title, 'Concurrent post')
  assert.equal(source.data.draft, true)
})

for (const args of [
  [],
  [''],
  ['Unquoted', 'title'],
  ['Title', '--slug', '../escape'],
  ['Title', '--slug', 'Uppercase'],
  ['日本語'],
  ['Title', '--unknown'],
]) {
  test(`invalid arguments ${JSON.stringify(args)} create no files`, (t) => {
    const { directory, run } = fixture(t)
    const result = run(...args)
    assert.equal(result.status, 1)
    assert.ok(result.stderr.includes('[new-post]'))
    assert.deepEqual(readdirSync(directory), [])
  })
}

test('an explicit slug supports titles without Latin characters', (t) => {
  const { directory, run } = fixture(t)
  const result = run('日本語', '--slug', 'japanese-article')
  assert.equal(result.status, 0, result.stderr)
  assert.equal(getPostSources(directory)[0].data.title, '日本語')
  assert.equal(getPostSources(directory)[0].data.slug, 'japanese-article')
})

test('help explains the command without creating a post', (t) => {
  const { directory, run } = fixture(t)
  const result = run('--help')
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /npm run new:post/)
  assert.deepEqual(readdirSync(directory), [])
})
