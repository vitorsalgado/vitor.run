import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

test(
  'static preview exposes real routes, fresh assets, and HTTP failures',
  { timeout: 15_000 },
  async (t) => {
    mkdirSync('.local', { recursive: true })
    const directory = mkdtempSync(join(process.cwd(), '.local/preview-test-'))
    const outside = `${directory}-private.txt`
    mkdirSync(join(directory, 'blog'))
    writeFileSync(join(directory, 'index.html'), '<h1>Static home</h1>')
    writeFileSync(join(directory, 'blog/index.html'), '<h1>Static blog</h1>')
    writeFileSync(join(directory, '404.html'), '<h1>Page not found</h1>')
    writeFileSync(outside, 'PRIVATE_SENTINEL')
    symlinkSync(outside, join(directory, 'private.txt'))
    const child = spawn(process.execPath, [
      'scripts/preview.mjs',
      '--dir',
      directory,
      '--port',
      '0',
    ])
    let errors = ''
    child.stderr.on('data', (chunk) => {
      errors += String(chunk)
    })
    t.after(async () => {
      if (child.exitCode === null && child.signalCode === null) {
        const stopped = once(child, 'exit')
        child.kill('SIGTERM')
        await stopped
      }
      rmSync(directory, { recursive: true, force: true })
      rmSync(outside, { force: true })
    })
    const base = await new Promise<string>((resolve, reject) => {
      child.on('error', reject)
      child.on('exit', (code) => {
        reject(new Error(`Preview exited (${code}): ${errors}`))
      })
      child.stdout.on('data', (chunk) => {
        const url = String(chunk).match(/http:\/\/127\.0\.0\.1:\d+\//)?.[0]
        if (url) {
          resolve(url)
        }
      })
    })

    const home = await fetch(base)
    assert.equal(home.status, 200)
    assert.match(home.headers.get('content-type')!, /text\/html/)
    assert.equal(await home.text(), '<h1>Static home</h1>')
    const redirect = await fetch(`${base}blog?from=test`, { redirect: 'manual' })
    assert.equal(redirect.status, 301)
    assert.equal(redirect.headers.get('location'), '/blog/?from=test')
    assert.equal(await (await fetch(`${base}blog/`)).text(), '<h1>Static blog</h1>')
    const head = await fetch(base, { method: 'HEAD' })
    assert.equal(head.headers.get('content-length'), home.headers.get('content-length'))
    assert.equal(await head.text(), '')
    const missing = await fetch(`${base}missing-route/`)
    assert.equal(missing.status, 404)
    assert.equal(await missing.text(), '<h1>Page not found</h1>')
    writeFileSync(join(directory, 'new-bundle.js'), 'console.log("new asset")')
    const asset = await fetch(`${base}new-bundle.js`)
    assert.equal(asset.status, 200, 'a rebuild must not require restarting preview')
    assert.match(asset.headers.get('content-type')!, /javascript/)
    assert.equal(asset.headers.get('cache-control'), 'no-store')
    rmSync(join(directory, 'new-bundle.js'))
    assert.equal((await fetch(`${base}new-bundle.js`)).status, 404)
    assert.equal((await fetch(`${base}private.txt`)).status, 404)
    assert.equal((await fetch(`${base}..%2f${outside.split('/').at(-1)}`)).status, 404)
    assert.equal((await fetch(`${base}%ZZ`)).status, 400)
    const unsupported = await fetch(base, { method: 'POST' })
    assert.equal(unsupported.status, 405)
    assert.equal(unsupported.headers.get('allow'), 'GET, HEAD')
    rmSync(join(directory, '404.html'))
    assert.equal((await fetch(`${base}missing-during-rebuild/`)).status, 404)
    assert.equal((await fetch(base)).status, 200, 'a rebuild must not crash the preview process')
  },
)
