/** Average words per minute for read time (Medium-style). Works for English and Portuguese. */
const WPM = 265

/** Seconds to add per image or diagram (viewing/processing time). */
const SECONDS_PER_IMAGE = 12

/** Seconds to add per code block or diagram block (e.g. mermaid). */
const SECONDS_PER_BLOCK = 8

/**
 * Estimate read time in minutes from raw markdown/content.
 * Includes:
 * - Text: word count at WPM
 * - Images: markdown images ![...](url)
 * - Code/diagram blocks: ```...``` (including mermaid, code)
 * Returns at least 1 minute.
 */
export function getReadTimeMinutes(content: string): number {
  if (!content || typeof content !== 'string') return 1

  // Word count (strip markdown)
  const stripped = content
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*?|__?|~~|`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_~`\[\]()]/g, ' ')
  const wordCount = stripped.split(/\s+/).filter(Boolean).length
  const wordMinutes = wordCount / WPM

  // Images: ![alt](url)
  const imageMatches = content.match(/!\[[^\]]*\]\([^)]+\)/g)
  const imageCount = imageMatches ? imageMatches.length : 0
  const imageMinutes = imageCount * (SECONDS_PER_IMAGE / 60)

  // Code/diagram blocks: ```...``` (fenced blocks)
  const blockMatches = content.match(/```[\s\S]*?```/g)
  const blockCount = blockMatches ? blockMatches.length : 0
  const blockMinutes = blockCount * (SECONDS_PER_BLOCK / 60)

  const totalMinutes = wordMinutes + imageMinutes + blockMinutes
  const minutes = Math.ceil(totalMinutes)
  return Math.max(1, minutes)
}
