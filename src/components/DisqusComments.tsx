import { useEffect, useState } from 'react'
import { DiscussionEmbed } from 'disqus-react'
import { SITE } from '../lib/site'

type DisqusCommentsProps = {
  url: string
  identifier: string
  title: string
  language?: string
}

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )

  useEffect(() => {
    const handler = () => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    }
    window.addEventListener('themechange', handler)
    return () => window.removeEventListener('themechange', handler)
  }, [])

  return theme
}

export function DisqusComments({ url, identifier, title, language }: DisqusCommentsProps) {
  const theme = useTheme()

  if (!SITE.disqusShortname) return null

  const config = {
    url,
    identifier,
    title,
    ...(language && { language }),
  }

  return (
    <section className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800" aria-label="Comments">
      <DiscussionEmbed key={theme} shortname={SITE.disqusShortname} config={config} />
    </section>
  )
}
