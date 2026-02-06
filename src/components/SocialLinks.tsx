import { Github, Instagram, Linkedin, Camera } from 'lucide-react'
import { socialLinks } from '../lib/social'

const iconMap = {
  Instagram,
  LinkedIn: Linkedin,
  GitHub: Github,
  Unsplash: Camera,
} as const

type SocialLinksProps = {
  className?: string
  variant?: 'default' | 'compact'
}

export function SocialLinks({ className = '', variant = 'default' }: SocialLinksProps) {
  const isCompact = variant === 'compact'
  return (
    <nav
      className={className}
      aria-label="Social links"
    >
      <ul className={`flex ${isCompact ? 'gap-4' : 'justify-center gap-6'}`}>
        {socialLinks.map(({ platform, href, label }) => {
          const Icon = iconMap[platform]
          return (
            <li key={platform}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={isCompact ? 'nav-link p-2 rounded-md block' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors'}
                aria-label={label}
              >
                <Icon size={isCompact ? 20 : 24} strokeWidth={1.5} aria-hidden />
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
