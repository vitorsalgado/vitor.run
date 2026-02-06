import { PageMeta } from '../components/PageMeta'
import { SocialLinks } from '../components/SocialLinks'
import avatar from '../assets/avatar.jpeg'

export function Home() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 sm:py-24 text-center">
      <PageMeta title="Home" description="Personal site and blog." keywords={[]} canonicalPath="/" />
      <div className="flex justify-center mb-8">
        <img
          src={avatar}
          alt="Vitor Hugo Salgado"
          width={160}
          height={160}
          className="w-40 h-40 rounded-full object-cover border-4 border-slate-200 dark:border-slate-600 shadow-lg bg-slate-100 dark:bg-slate-800"
          onError={(e) => {
            const target = e.currentTarget
            target.style.display = 'none'
            const fallback = target.nextElementSibling
            if (fallback) (fallback as HTMLElement).style.display = 'flex'
          }}
        />
        <div
          className="w-40 h-40 rounded-full border-4 border-slate-200 dark:border-slate-600 shadow-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-4xl font-semibold text-slate-500 dark:text-slate-400"
          style={{ display: 'none' }}
          aria-hidden
        >
          V
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-3">
        Vitor Hugo Salgado
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
        Software Engineer<br />From São Paulo, Brasil 🇧🇷, currently living in Berlin, Germany 🇩🇪
      </p>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-8">
        We are what we do, especially what we do to change what we are.
      </p>
      <SocialLinks />
    </div>
  )
}
