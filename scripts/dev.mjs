#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const { values } = parseArgs({ options: { drafts: { type: 'boolean' } } })
const drafts = values.drafts === true
const root = fileURLToPath(new URL('../', import.meta.url))
const child = spawn(
  process.execPath,
  [
    fileURLToPath(new URL('../node_modules/vitepress/bin/vitepress.js', import.meta.url)),
    'dev',
    'site',
    '--host',
    '127.0.0.1',
    '--port',
    drafts ? '5178' : '5174',
    '--strictPort',
  ],
  {
    cwd: root,
    env: { ...process.env, VITOR_PREVIEW_DRAFTS: drafts ? '1' : '0', NODE_ENV: 'development' },
    stdio: 'inherit',
  },
)

child.on('error', (error) => {
  console.error(`[dev] ${error.message}`)
  process.exitCode = 1
})
child.on('exit', (code) => {
  process.exitCode = code ?? 1
})
