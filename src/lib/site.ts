import avatarUrl from '../assets/avatar.jpeg'

/**
 * Site-wide config for SEO meta tags, branding, and contact.
 * Used by PageMeta, Contact page, and other components.
 * Avatar is imported so Vite resolves it to the hashed asset URL in production.
 */
/** Links shown on the Contact page (in addition to email). Icon: Lucide icon name. */
export const contactLinks = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/vitorsalgado', icon: 'Linkedin' },
] as const

export const SITE = {
  name: 'vitor.run',
  locale: 'en_US',
  author: 'Vitor Hugo Salgado',
  email: 'vsalgadopb@gmail.com',
  image: avatarUrl,
  sameAs: [
    'https://github.com/vitorsalgado',
    'https://linkedin.com/in/vitorsalgado',
    'https://instagram.com/vtrsalgado',
    'https://unsplash.com/@vitorsalgado',
  ] as string[],
} as const
