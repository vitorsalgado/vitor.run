import { realpathSync, statSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import MarkdownIt from 'markdown-it'

const projectDirectory = fileURLToPath(new URL('../../', import.meta.url))
const publicDirectory = resolve(projectDirectory, 'site/public')
const markdown = new MarkdownIt()

function resolvePostImage(source: string, sourcePath: string) {
  if (/^(?:https?:|data:|\/\/)/i.test(source)) return null
  function fail(message: string): never {
    throw new Error(`${sourcePath}: image ${JSON.stringify(source)} ${message}`)
  }
  if (!source || /^[a-z][a-z0-9+.-]*:/i.test(source)) fail('must be a local image or an HTTP(S)/data URL')

  const suffixStart = source.search(/[?#]/)
  const pathname = suffixStart === -1 ? source : source.slice(0, suffixStart)
  const suffix = suffixStart === -1 ? '' : source.slice(suffixStart)
  let decoded: string
  try { decoded = decodeURIComponent(pathname) }
  catch { fail('has invalid URL encoding') }

  const isPublic = pathname.startsWith('/')
  const root = isPublic ? publicDirectory : projectDirectory
  const path = isPublic ? resolve(root, `.${decoded}`) : resolve(dirname(sourcePath), decoded)
  let actualPath: string
  try { actualPath = realpathSync(path) }
  catch { fail('does not exist') }
  const distance = relative(root, actualPath)
  if (isAbsolute(distance) || distance === '..' || distance.startsWith(`..${sep}`)) {
    fail(isPublic ? 'must stay inside site/public' : 'must stay inside the project directory')
  }
  if (!statSync(actualPath).isFile()) fail('must refer to a file')
  return { path, suffix, isPublic }
}

export function validatePostImages(content: string, sourcePath: string) {
  const tokens = markdown.parse(content, {})
  while (tokens.length) {
    const token = tokens.pop()!
    if (token.children) tokens.push(...token.children)
    if (token.type === 'image') resolvePostImage(token.attrGet('src') ?? '', sourcePath)
  }
}

export function rebasePostImage(source: string, sourcePath: string, pagePath: string) {
  const image = resolvePostImage(source, sourcePath)
  if (!image || image.isPublic) return source
  return relative(dirname(pagePath), image.path).split(sep).map(encodeURIComponent).join('/') + image.suffix
}
