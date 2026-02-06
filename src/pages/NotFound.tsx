import { Link } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'

export function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 sm:py-32 text-center">
      <PageMeta title="Page not found" description="The page you're looking for doesn't exist." />
      <p className="text-8xl sm:text-9xl font-light text-neutral-200 tracking-tighter mb-4" aria-hidden>
        404
      </p>
      <h1 className="text-xl font-semibold text-neutral-900 mb-2">
        Page not found
      </h1>
      <p className="text-neutral-500 text-sm mb-8">
        This page doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
      >
        ← Back to home
      </Link>
    </div>
  )
}
