import { Link } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'

export function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 sm:py-32 text-center">
      <PageMeta title="Page not found" description="The page you're looking for doesn't exist." />
      <p className="text-8xl sm:text-9xl font-light text-neutral-200 dark:text-neutral-700 tracking-tighter mb-4" aria-hidden>
        404
      </p>
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        Page not found
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8">
        This page doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium transition-colors"
      >
        ← Back to home
      </Link>
    </div>
  )
}
