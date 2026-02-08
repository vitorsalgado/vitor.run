#!/usr/bin/env node
/**
 * Creates a new blog post with minimal frontmatter.
 * Filename: YYYY-MM-DD-post.md
 * No inputs required.
 */

import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const postsDir = join(root, 'blog')

const now = new Date()
const y = now.getFullYear()
const m = String(now.getMonth() + 1).padStart(2, '0')
const d = String(now.getDate()).padStart(2, '0')
const dateStr = `${y}-${m}-${d}`

const filename = `${dateStr}-post.md`
const filepath = join(postsDir, filename)

const content = `---
title: Post
slug: ${dateStr}-post
date: ${dateStr}
description: TODO
language: EN
tags:
  - TODO
---

Write your content here.
`

writeFileSync(filepath, content, 'utf-8')
console.log('[new-post] Created', filepath)
