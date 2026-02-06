import avatarUrl from '../assets/avatar.jpeg'

/**
 * Site-wide config for SEO meta tags and branding.
 * Used by PageMeta and other components.
 * Avatar is imported so Vite resolves it to the hashed asset URL in production.
 */
export const SITE = {
  name: 'vitor.run',
  locale: 'en_US',
  author: 'Vitor Hugo Salgado',
  image: avatarUrl,
  sameAs: [
    'https://github.com/vitorsalgado',
    'https://linkedin.com/in/vitorsalgado',
    'https://instagram.com/vtrsalgado',
    'https://unsplash.com/@vitorsalgado',
  ] as string[],
} as const
