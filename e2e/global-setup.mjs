#!/usr/bin/env node
/**
 * Playwright global setup: build the app so webServer only needs to start preview.
 */
import { spawn } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: true, cwd: root })
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Build exited ${code}`))))
  })
}

export default async function globalSetup() {
  await run('npm', ['run', 'build'])
}
