/**
 * Site-wide config for SEO meta tags, branding, and contact.
 * Used by PageMeta, Contact page, and other components.
 * Keep this module usable by both the browser and static-generation hooks.
 */
/** Links shown on the Contact page (in addition to email). Icon: Lucide icon name. */
export const contactLinks = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/vitorsalgado', icon: 'Linkedin' },
] as const

export const SITE = {
  name: 'vitor.run',
  url: 'https://vitor.run',
  description: 'Personal site and blog by Vitor Hugo Salgado.',
  language: 'en',
  locale: 'en_US',
  author: 'Vitor Hugo Salgado',
  disqusShortname: 'vitor-run',
  googleAnalyticsId: 'G-7V8YRTTQ9S',
  email: 'vsalgadopb@gmail.com',
  image: '/avatar.jpeg',
  sameAs: [
    'https://github.com/vitorsalgado',
    'https://linkedin.com/in/vitorsalgado',
    'https://unsplash.com/@vitorsalgado',
  ] as string[],
} as const

export function siteUrl(path: string) {
  return new URL(path, SITE.url).href
}
