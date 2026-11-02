#!/usr/bin/env node
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = join(root, 'dist')

function run(script) {
  const result = spawnSync('npm', ['run', script], { cwd: root, stdio: 'inherit' })
  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function artifactDigest() {
  const hash = createHash('sha256')
  const files = readdirSync(output, { recursive: true, withFileTypes: true })
  const paths = []
  for (const file of files) {
    const path = join(file.parentPath, file.name)
    assert.ok(file.isFile() || file.isDirectory(), `Unsupported artifact entry: ${path}`)
    if (file.isFile()) {
      paths.push(path)
    }
  }
  assert.ok(paths.length > 0, 'The deployment artifact is empty')
  for (const path of paths.sort()) {
    const bytes = readFileSync(path)
    hash.update(JSON.stringify([relative(output, path), bytes.byteLength]))
    hash.update(bytes)
  }
  return hash.digest('hex')
}

for (const script of ['format:check', 'lint', 'content:test', 'build']) {
  run(script)
}
const digest = artifactDigest()
run('e2e')
assert.equal(artifactDigest(), digest, 'Browser tests changed the deployment artifact')
console.log(`Verified deployment artifact SHA-256: ${digest}`)
