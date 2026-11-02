#!/usr/bin/env node
import { readFileSync, realpathSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const { values } = parseArgs({
  options: {
    dir: { type: 'string', default: fileURLToPath(new URL('../dist', import.meta.url)) },
    port: { type: 'string', default: '4176' },
  },
})
const directory = realpathSync(resolve(values.dir))
const port = Number(values.port)
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error('The preview port must be an integer between 0 and 65535.')
}

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
}

function insideDirectory(path) {
  const location = relative(directory, path)
  return location !== '..' && !location.startsWith(`..${sep}`) && !isAbsolute(location)
}

function send(request, response, status, body, type = 'text/plain; charset=utf-8', headers = {}) {
  response.writeHead(status, {
    'Content-Type': type,
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    ...headers,
  })
  response.end(request.method === 'HEAD' ? undefined : body)
}

function notFound(request, response) {
  try {
    const fallback = realpathSync(join(directory, '404.html'))
    if (insideDirectory(fallback)) {
      send(request, response, 404, readFileSync(fallback), contentTypes['.html'])
      return
    }
  } catch (error) {
    if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') {
      console.error(error)
    }
  }
  send(request, response, 404, 'Not found\n')
}

const server = createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    send(request, response, 405, 'Method not allowed\n', undefined, { Allow: 'GET, HEAD' })
    return
  }

  try {
    const url = new URL(request.url, 'http://localhost')
    let path = resolve(directory, `.${decodeURIComponent(url.pathname)}`)
    if (!insideDirectory(path) || !insideDirectory(realpathSync(path))) {
      notFound(request, response)
      return
    }
    if (statSync(path).isDirectory()) {
      if (!url.pathname.endsWith('/')) {
        send(request, response, 301, '', undefined, { Location: `${url.pathname}/${url.search}` })
        return
      }
      path = join(path, 'index.html')
    }
    if (!insideDirectory(realpathSync(path)) || !statSync(path).isFile()) {
      notFound(request, response)
      return
    }
    send(
      request,
      response,
      200,
      readFileSync(path),
      contentTypes[extname(path)] ?? 'application/octet-stream',
    )
  } catch (error) {
    if (error instanceof URIError || error instanceof TypeError) {
      send(request, response, 400, 'Bad request\n')
    } else if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      notFound(request, response)
    } else {
      console.error(error)
      send(request, response, 500, 'Preview server error\n')
    }
  }
})

server.on('error', (error) => {
  console.error(`[preview] ${error.message}`)
  process.exitCode = 1
})
server.listen(port, '127.0.0.1', () => {
  console.log(`Static preview: http://127.0.0.1:${server.address().port}/`)
})
