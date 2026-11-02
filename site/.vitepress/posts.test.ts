import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { test, type TestContext } from 'node:test'
import { stringify } from 'yaml'
import { getPublishedPosts, getSitePosts } from './posts.ts'

const metadata = {
  title: 'A useful article',
  slug: 'useful-article',
  date: '2024-02-29',
  language: 'EN',
  description: 'A description of the article.',
  tags: ['Tech'],
}

function fixture(t: TestContext) {
  mkdirSync('.local', { recursive: true })
  const directory = mkdtempSync(join(process.cwd(), '.local/content-model-'))
  t.after(() => {
    return rmSync(directory, { recursive: true, force: true })
  })
  return directory
}

function writePost(
  directory: string,
  fields: Record<string, unknown> = {},
  content = 'Useful article content.',
  file = 'article.md',
) {
  writeFileSync(
    join(directory, file),
    `---\n${stringify({ ...metadata, ...fields })}---\n\n${content}`,
  )
}

test('published metadata is normalized without changing its day or requiring optional fields', (t) => {
  const directory = fixture(t)
  writePost(directory, {
    title: '  A useful article  ',
    description: undefined,
    tags: undefined,
    language: 'pt-br',
  })
  const [post] = getPublishedPosts(directory)
  assert.equal(post.meta.title, 'A useful article')
  assert.equal(post.meta.date, '2024-02-29')
  assert.equal(post.meta.language, 'pt-BR')
  assert.equal(post.meta.description, '')
  assert.deepEqual(post.meta.tags, [])
  assert.ok(post.meta.readTimeMinutes >= 1)
})

test('sorting uses publication dates with a stable slug order for ties', (t) => {
  const directory = fixture(t)
  writePost(directory, { slug: 'older', date: '2023-01-01' }, undefined, 'a.md')
  writePost(directory, { slug: 'zebra' }, undefined, 'b.md')
  writePost(directory, { slug: 'alpha' }, undefined, 'c.md')
  assert.deepEqual(
    getPublishedPosts(directory).map((post) => {
      return post.slug
    }),
    ['alpha', 'zebra', 'older'],
  )
})

test('a draft can have incomplete metadata and missing images without being published', (t) => {
  const directory = fixture(t)
  writePost(directory)
  writePost(
    directory,
    {
      draft: true,
      title: undefined,
      slug: undefined,
      date: 'not a date',
      language: undefined,
      tags: ['secret-tag'],
      description: 'TODO',
    },
    '![Unpublished illustration](missing-draft-image.svg)',
    'draft.md',
  )
  const posts = getPublishedPosts(directory)
  assert.equal(posts.length, 1)
  assert.ok(!JSON.stringify(posts).includes('secret-tag'))
  assert.ok(!JSON.stringify(posts).includes('missing-draft-image'))
})

for (const value of ['true', 'false', null, 1, 'yes']) {
  test(`a non-boolean draft flag ${JSON.stringify(value)} fails closed`, (t) => {
    const directory = fixture(t)
    writePost(directory, { draft: value })
    assert.throws(() => {
      return getPublishedPosts(directory)
    }, /article\.md: "draft" must be true or false/)
  })
}

for (const field of ['title', 'slug', 'date', 'language']) {
  test(`a published article requires ${field}`, (t) => {
    const directory = fixture(t)
    writePost(directory, { [field]: undefined })
    assert.throws(
      () => {
        return getPublishedPosts(directory)
      },
      new RegExp(`article\\.md: "${field}"`),
    )
  })
}

for (const date of [
  '2023-02-29',
  '2026-02-30',
  '2026-13-01',
  '2026-01-32',
  'yesterday',
  '2026-01-01T00:00:00Z',
]) {
  test(`the calendar date ${JSON.stringify(date)} cannot silently change while parsing`, (t) => {
    const directory = fixture(t)
    // YAML core emits ordinary date strings unquoted, reproducing the rollover risk.
    writePost(directory, { date })
    assert.throws(() => {
      return getPublishedPosts(directory)
    }, /article\.md: "date" must be a real calendar date/)
  })
}

test('publication dates do not shift with the build machine timezone', (t) => {
  const directory = fixture(t)
  writePost(directory)
  const source = `import { getPublishedPosts } from ${JSON.stringify(new URL('./posts.ts', import.meta.url).href)}; console.log(getPublishedPosts(${JSON.stringify(directory)})[0].meta.date)`
  for (const timezone of ['America/Los_Angeles', 'Pacific/Auckland']) {
    const result = execFileSync(process.execPath, ['--input-type=module', '-e', source], {
      encoding: 'utf8',
      env: { ...process.env, TZ: timezone },
    })
    assert.equal(result.trim(), '2024-02-29')
  }
})

test('the draft flag, rather than a future date, controls publication', (t) => {
  const directory = fixture(t)
  writePost(directory, { date: '2099-01-01', draft: false })
  assert.equal(getPublishedPosts(directory).length, 1)
})

test('two published files cannot claim the same URL', (t) => {
  const directory = fixture(t)
  writePost(directory, {}, undefined, 'first.md')
  writePost(directory, {}, undefined, 'second.md')
  assert.throws(() => {
    return getPublishedPosts(directory)
  }, /second\.md: "slug" duplicates.*first\.md/)
})

test('draft slugs do not reserve published URLs', (t) => {
  const directory = fixture(t)
  writePost(directory)
  writePost(directory, { draft: true }, undefined, 'draft.md')
  assert.equal(getPublishedPosts(directory).length, 1)
})

for (const [field, value] of [
  ['title', 'TODO'],
  ['description', 'TODO'],
  ['description', 42],
  ['tags', 'tech'],
  ['tags', ['']],
  ['tags', [42]],
  ['tags', ['../private']],
  ['slug', '../private'],
  ['slug', 'two/posts'],
  ['language', 'not_a_language'],
  ['drfat', true],
] as const) {
  test(`invalid ${field} ${JSON.stringify(value)} identifies the source and field`, (t) => {
    const directory = fixture(t)
    writePost(directory, { [field]: value })
    assert.throws(
      () => {
        return getPublishedPosts(directory)
      },
      new RegExp(`article\\.md: "${field}`),
    )
  })
}

test('tags normalize case, whitespace, and Unicode without duplicate archives', (t) => {
  const directory = fixture(t)
  writePost(directory, { tags: [' Tech ', 'tech', 'Cafe\u0301', 'café', 'dependency injection'] })
  assert.deepEqual(getPublishedPosts(directory)[0].meta.tags, [
    'tech',
    'café',
    'dependency injection',
  ])
})

test('empty published articles fail instead of creating empty pages', (t) => {
  const directory = fixture(t)
  writePost(directory, {}, ' \n ')
  assert.throws(() => {
    return getPublishedPosts(directory)
  }, /article\.md: "content" must not be empty/)
})

test('duplicate YAML keys cannot change the intended publication flag', (t) => {
  const directory = fixture(t)
  writeFileSync(join(directory, 'article.md'), '---\ndraft: true\ndraft: false\n---\nBody')
  assert.throws(() => {
    return getPublishedPosts(directory)
  }, /article\.md: invalid YAML frontmatter:.*unique/i)
})

test('non-YAML and unfinished frontmatter fail before parsing content', (t) => {
  const directory = fixture(t)
  for (const raw of [
    'No frontmatter',
    '---\ntitle: Unfinished',
    '---javascript\n({ draft: false })\n---\nBody',
  ]) {
    writeFileSync(join(directory, 'article.md'), raw)
    assert.throws(() => {
      return getPublishedPosts(directory)
    }, /article\.md: "frontmatter" must be a complete YAML block/)
  }
})

test('inline and reference images resolve against the original Markdown file', (t) => {
  const directory = fixture(t)
  writeFileSync(
    join(directory, 'image with spaces.svg'),
    '<svg xmlns="http://www.w3.org/2000/svg"/>',
  )
  writePost(
    directory,
    {},
    [
      '![Inline image](<image with spaces.svg>)',
      '![Reference image][illustration]',
      '',
      '[illustration]: <image with spaces.svg>',
    ].join('\n'),
  )
  assert.equal(getPublishedPosts(directory).length, 1)
})

test('missing reference images fail with the article and image path', (t) => {
  const directory = fixture(t)
  writePost(directory, {}, '![Illustration][image]\n\n[image]: missing.svg')
  assert.throws(() => {
    return getPublishedPosts(directory)
  }, /article\.md: image "missing\.svg" does not exist/)
})

test('image-looking examples in code and remote images do not require local files', (t) => {
  const directory = fixture(t)
  writePost(
    directory,
    {},
    [
      '```markdown',
      '![Example](missing.svg)',
      '```',
      '![Remote](https://example.com/image.svg)',
      '![Data](data:image/png;base64,aGVsbG8=)',
    ].join('\n'),
  )
  assert.equal(getPublishedPosts(directory).length, 1)
})

test('public image URLs require an actual file in the VitePress public directory', (t) => {
  const directory = fixture(t)
  writePost(directory, {}, '![Illustration](/not-a-real-content-model-image.svg)')
  assert.throws(() => {
    return getPublishedPosts(directory)
  }, /article\.md: image.*not-a-real-content-model-image\.svg.*does not exist/)
})

test('a local image symlink cannot publish a file from outside the project', (t) => {
  const directory = fixture(t)
  symlinkSync(process.execPath, join(directory, 'outside-image.svg'))
  writePost(directory, {}, '![Illustration](outside-image.svg)')
  assert.throws(() => {
    return getPublishedPosts(directory)
  }, /article\.md: image.*must stay inside the project directory/)
})

test('draft previews include labelled drafts while publication ignores the preview flag', (t) => {
  const directory = fixture(t)
  const previous = { flag: process.env.VITOR_PREVIEW_DRAFTS, mode: process.env.NODE_ENV }
  t.after(() => {
    for (const [name, value] of [
      ['VITOR_PREVIEW_DRAFTS', previous.flag],
      ['NODE_ENV', previous.mode],
    ]) {
      if (value === undefined) delete process.env[name!]
      else process.env[name!] = value
    }
  })
  writePost(directory)
  writePost(
    directory,
    { draft: true, slug: 'draft-post', title: 'TODO', description: 'TODO' },
    '',
    'draft.md',
  )
  process.env.NODE_ENV = 'development'
  delete process.env.VITOR_PREVIEW_DRAFTS
  assert.deepEqual(
    getSitePosts(directory).map((post) => {
      return post.slug
    }),
    ['useful-article'],
  )
  process.env.VITOR_PREVIEW_DRAFTS = '1'
  assert.equal(getSitePosts(directory).length, 2)
  assert.equal(
    getSitePosts(directory).find((post) => {
      return post.slug === 'draft-post'
    })?.meta.draft,
    true,
  )
  assert.deepEqual(
    getPublishedPosts(directory).map((post) => {
      return post.slug
    }),
    ['useful-article'],
  )
  process.env.NODE_ENV = 'production'
  assert.deepEqual(
    getSitePosts(directory).map((post) => {
      return post.slug
    }),
    ['useful-article'],
  )
})
