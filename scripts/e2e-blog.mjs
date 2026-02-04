#!/usr/bin/env node
/**
 * E2E validation for the blog: build, serve preview, and assert via Playwright
 * that /blog lists posts and /blog/:slug shows post content.
 * Run: npm run e2e:blog
 */

import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const distIndex = join(root, 'dist', 'index.html')

const PREVIEW_PORT = 35173
const BASE = `http://localhost:${PREVIEW_PORT}`

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'pipe', shell: true, cwd: root, ...opts })
    let stderr = ''
    p.stderr?.on('data', (d) => { stderr += d })
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(stderr || `exit ${code}`))))
  })
}

function waitForServer(ms = 60_000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tick = () => {
      fetch(`${BASE}/`)
        .then((r) => (r.ok ? resolve() : tick()))
        .catch(() => {
          if (Date.now() - start > ms) reject(new Error('Preview server did not start in time'))
          else setTimeout(tick, 300)
        })
    }
    tick()
  })
}

async function main() {
  console.log('Building…')
  await run('npm', ['run', 'build'])

  const indexHtml = readFileSync(distIndex, 'utf-8')
  if (!indexHtml.includes('root') || !indexHtml.includes('<!doctype html')) {
    throw new Error('dist/index.html missing root or doctype')
  }
  console.log('Build OK')

  const preview = spawn('npx', ['vite', 'preview', '--port', String(PREVIEW_PORT)], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  })
  preview.stdout?.on('data', (d) => process.stdout.write(d))
  preview.stderr?.on('data', (d) => process.stderr.write(d))
  preview.on('error', (err) => console.error('Preview spawn error:', err))
  preview.on('close', (code) => {
    if (code !== 0 && code !== null) console.error('Preview exited with code:', code)
  })
  let previewClosed = false
  preview.on('close', () => { previewClosed = true })
  process.on('exit', () => { if (!previewClosed) preview.kill() })

  await waitForServer()
  console.log('Preview server up at', BASE)

  const { chromium } = await import('playwright')
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()

    // Blog list
    await page.goto(`${BASE}/blog`)
    await page.getByRole('heading', { name: 'Blog', level: 1 }).waitFor({ state: 'visible', timeout: 10_000 })
    await page.getByRole('link', { name: /Hello World/i }).waitFor({ state: 'visible', timeout: 5_000 })
    console.log('  /blog → list OK')

    // Blog post content (single h1 from page header; markdown # renders as h2)
    await page.goto(`${BASE}/blog/hello-world`)
    await page.getByRole('heading', { name: 'Hello World' }).first().waitFor({ state: 'visible', timeout: 10_000 })
    await page.getByText(/This is your first blog post/).waitFor({ state: 'visible', timeout: 5_000 })
    const title = await page.title()
    if (!title.includes('Hello World') || !title.includes('vitor.run')) {
      throw new Error(`Expected title to contain "Hello World" and "vitor.run", got: ${title}`)
    }
    console.log('  /blog/hello-world → content + SEO OK')

    // 404 fallback
    await page.goto(`${BASE}/blog/non-existent-post`)
    await page.getByText('Post not found').waitFor({ state: 'visible', timeout: 5_000 })
    console.log('  /blog/non-existent-post → 404 fallback OK')
  } finally {
    await browser.close()
  }

  preview.kill()
  console.log('E2E blog validation passed.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
