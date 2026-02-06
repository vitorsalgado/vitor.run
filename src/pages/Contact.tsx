import { Linkedin, Mail } from 'lucide-react'
import { PageMeta } from '../components/PageMeta'
import { SITE, contactLinks } from '../lib/site'

const contactIconMap = {
  Mail,
  Linkedin,
} as const

export function Contact() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <PageMeta title="Contact" description="Get in touch." canonicalPath="/contact" keywords={[]} />
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">Contact</h1>
      <p className="text-slate-600 dark:text-slate-300 mb-8">
        You can reach me through the channels below. I’m happy to chat about
        projects, ideas, or just say hi.
      </p>
      <ul className="space-y-4">
        <li>
          <a
            href={`mailto:${SITE.email}`}
            className="flex items-center gap-3 text-slate-900 dark:text-slate-100 font-medium"
          >
            <Mail size={20} strokeWidth={1.5} className="shrink-0 text-[var(--color-accent)]" aria-hidden />
            {SITE.email}
          </a>
        </li>
        {contactLinks.map(({ label, href, icon }) => {
          const Icon = contactIconMap[icon as keyof typeof contactIconMap]
          return (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-slate-900 dark:text-slate-100 font-medium"
              >
                {Icon ? <Icon size={20} strokeWidth={1.5} className="shrink-0 text-[var(--color-accent)]" aria-hidden /> : null}
                {label}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
