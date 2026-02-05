import { socialLinks } from '../lib/social'

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
        {socialLinks.map(({ platform, href, label }) => (
          <li key={platform}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-900 transition-colors"
              aria-label={label}
            >
              {platform}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
