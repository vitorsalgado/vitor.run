import { Github, Instagram, Linkedin } from 'lucide-react'
import { socialLinks } from '../lib/social'

const iconMap = {
  Instagram,
  LinkedIn: Linkedin,
  GitHub: Github,
} as const

type SocialLinksProps = {
  className?: string
}

export function SocialLinks({ className = '' }: SocialLinksProps) {
  return (
    <nav
      className={className}
      aria-label="Social links"
    >
      <ul className="flex justify-center gap-6">
        {socialLinks.map(({ platform, href, label }) => {
          const Icon = iconMap[platform]
          return (
            <li key={platform}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-900 transition-colors"
                aria-label={label}
              >
                <Icon size={24} strokeWidth={1.5} aria-hidden />
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
