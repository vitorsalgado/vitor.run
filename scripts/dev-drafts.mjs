#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const child = spawn(process.execPath, [
  fileURLToPath(new URL('../node_modules/vitepress/bin/vitepress.js', import.meta.url)),
  'dev', 'site', '--host', '127.0.0.1', '--port', '5178', '--strictPort',
], { cwd: root, env: { ...process.env, VITOR_PREVIEW_DRAFTS: '1' }, stdio: 'inherit' })

child.on('error', (error) => {
  console.error(`[draft-preview] ${error.message}`)
  process.exitCode = 1
})
child.on('exit', (code) => { process.exitCode = code ?? 1 })
