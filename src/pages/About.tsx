import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PageMeta } from '../components/PageMeta'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { SITE } from '../lib/site'
import { getAbout } from '../lib/about'

const JSON_LD_SCRIPT_ID = 'about-jsonld'

export function About() {
  const about = getAbout()

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const canonicalUrl = `${origin}/about`

    // Add AboutPage structured data
    const aboutPageJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      '@id': `${canonicalUrl}#webpage`,
      mainEntity: {
        '@type': 'Person',
        name: SITE.author,
        url: origin,
        description: about.description,
        jobTitle: 'Software Engineer',
        ...(SITE.sameAs?.length && { sameAs: SITE.sameAs }),
      },
      url: canonicalUrl,
      name: about.title,
      description: about.description,
      inLanguage: SITE.locale,
      isPartOf: {
        '@type': 'WebSite',
        name: SITE.name,
        url: origin,
      },
    }

    let scriptEl = document.getElementById(JSON_LD_SCRIPT_ID) as HTMLScriptElement | null
    if (!scriptEl) {
      scriptEl = document.createElement('script')
      scriptEl.id = JSON_LD_SCRIPT_ID
      scriptEl.type = 'application/ld+json'
      document.head.appendChild(scriptEl)
    }
    scriptEl.textContent = JSON.stringify(aboutPageJsonLd)

    return () => {
      const script = document.getElementById(JSON_LD_SCRIPT_ID)
      if (script) script.remove()
    }
  }, [about.title, about.description])

  const keywords = [
    'software engineer',
    'developer',
    'programming',
    'open source',
    'technology',
    'software development',
    SITE.author.toLowerCase(),
  ]

  const aboutBreadcrumbList = [
    { name: 'Home', path: '/' },
    { name: about.title, path: '/about' },
  ]

  return (
    <article className="max-w-2xl mx-auto px-6 py-16">
      <PageMeta
        title={about.title}
        description={about.description}
        canonicalPath="/about"
        keywords={keywords}
        type="website"
        breadcrumbList={aboutBreadcrumbList}
      />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/', isHome: true },
          { label: about.title },
        ]}
        className="mb-4"
      />
      <div className="prose prose-slate">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {about.content}
        </ReactMarkdown>
      </div>
    </article>
  )
}
