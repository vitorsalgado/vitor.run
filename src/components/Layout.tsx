import { Heart } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

const MAIN_CONTENT_ID = 'main-content'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col dark:bg-neutral-900">
      <a href={`#${MAIN_CONTENT_ID}`} className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id={MAIN_CONTENT_ID} className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="border-t border-neutral-200/80 dark:border-neutral-700/80 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        © {new Date().getFullYear()} — built with <Heart size={14} strokeWidth={2} className="inline-block align-text-bottom relative -top-px text-neutral-500 dark:text-neutral-400" aria-hidden /> in Berlin
      </footer>
    </div>
  )
}
