const TAG_ICON_MAP: Record<string, 'MapPin' | 'Landmark' | 'Code2'> = {
  travel: 'MapPin',
  politics: 'Landmark',
  tech: 'Code2',
}

/** Keep the first-tag icon choice shared by the React and Vue themes. */
export function getPostIconName(tag?: string) {
  const normalized = tag?.trim().toLowerCase() ?? ''
  return Object.hasOwn(TAG_ICON_MAP, normalized) ? TAG_ICON_MAP[normalized] : 'FileText'
}
