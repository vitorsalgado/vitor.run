import type { LucideProps } from 'lucide-react'
import {
  BookOpen,
  Coffee,
  FileText,
  Lightbulb,
  PenLine,
  Sparkles,
} from 'lucide-react'

export function PostIcon({
  name,
  size = 24,
  className,
  ...props
}: { name: string | undefined } & LucideProps) {
  const p = { size, className, ...props }
  switch (name) {
    case 'BookOpen':
      return <BookOpen {...p} />
    case 'Coffee':
      return <Coffee {...p} />
    case 'PenLine':
      return <PenLine {...p} />
    case 'Lightbulb':
      return <Lightbulb {...p} />
    case 'Sparkles':
      return <Sparkles {...p} />
    default:
      return <FileText {...p} />
  }
}
