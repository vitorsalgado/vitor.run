import { PageMeta } from '../components/PageMeta'

export function Home() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 sm:py-24 text-center">
      <PageMeta title="Home" description="Personal site and blog." />
      <div className="flex justify-center mb-8">
        {/* Replace src with your photo: /avatar.jpg — add your image to public/avatar.jpg */}
        <img
          src="/avatar.jpg"
          alt=""
          width={160}
          height={160}
          className="w-40 h-40 rounded-full object-cover border-4 border-slate-200 shadow-lg bg-slate-100"
          onError={(e) => {
            const target = e.currentTarget
            target.style.display = 'none'
            const fallback = target.nextElementSibling
            if (fallback) (fallback as HTMLElement).style.display = 'flex'
          }}
        />
        <div
          className="w-40 h-40 rounded-full border-4 border-slate-200 shadow-lg bg-slate-200 flex items-center justify-center text-4xl font-semibold text-slate-500"
          style={{ display: 'none' }}
          aria-hidden
        >
          V
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">
        Your Name
      </h1>
      <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
        Short tagline about yourself — e.g. Developer, maker, open-source enthusiast.
      </p>
      <p className="text-slate-500 text-sm max-w-md mx-auto">
        The people who are crazy enough to think they can change the world are the ones who do.
      </p>
    </div>
  )
}
