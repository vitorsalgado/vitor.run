import { PageMeta } from '../components/PageMeta'

export function Contact() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <PageMeta title="Contact" description="Get in touch." />
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Contact</h1>
      <p className="text-slate-600 mb-8">
        You can reach me through the channels below. I’m happy to chat about
        projects, ideas, or just say hi.
      </p>
      <ul className="space-y-4">
        <li>
          <a
            href="mailto:you@example.com"
            className="text-slate-900 font-medium"
          >
            Email — you@example.com
          </a>
        </li>
        <li>
          <a
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-900 font-medium"
          >
            GitHub — github.com/yourusername
          </a>
        </li>
        <li>
          <a
            href="https://twitter.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-900 font-medium"
          >
            Twitter / X — @yourusername
          </a>
        </li>
      </ul>
      <p className="mt-10 text-sm text-slate-500">
        Replace the links above with your real email and social profiles.
      </p>
    </div>
  )
}
