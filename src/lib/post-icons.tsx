import { createElement } from 'react'
import type { LucideProps } from 'lucide-react'
import { Code2, FileText, Landmark, MapPin } from 'lucide-react'
import { getPostIconName } from './post-icon-names'

const icons = { MapPin, Landmark, Code2, FileText }

export function PostIcon({
  tag,
  size = 24,
  className,
  ...props
}: { tag: string } & LucideProps) {
  const Icon = icons[getPostIconName(tag)]
  return createElement(Icon, { size, className, ...props })
}
