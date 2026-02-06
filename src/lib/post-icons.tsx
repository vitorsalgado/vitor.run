import type { LucideProps } from 'lucide-react'
import { Code2, FileText, Landmark, MapPin } from 'lucide-react'

/** Map first tag (lowercase) to a Lucide icon. Only these tags get a custom icon; others use default. */
const TAG_ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  travel: MapPin,
  politics: Landmark,
  tech: Code2,
}

const DEFAULT_ICON = FileText

export function PostIcon({
  tag,
  size = 24,
  className,
  ...props
}: { tag: string | undefined } & LucideProps) {
  const normalizedTag = tag?.trim().toLowerCase()
  const Icon = (normalizedTag && TAG_ICON_MAP[normalizedTag]) || DEFAULT_ICON
  return <Icon size={size} className={className} {...props} />
}
