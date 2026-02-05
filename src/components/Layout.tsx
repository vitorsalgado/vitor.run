import { Heart, Mail, Rss, TentTree } from 'lucide-react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { SocialLinks } from './SocialLinks'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/blog', label: 'Blog' },
]

export function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <nav className="max-w-3xl mx-auto px-6 py-4 flex flex-wrap justify-center items-center gap-8">
          <Link
            to="/"
            className={`nav-link shrink-0 p-2 rounded-md -ml-1 ${
              location.pathname === '/' ? 'nav-link--active-icon' : ''
            }`}
            aria-label="Home"
          >
            <TentTree size={24} strokeWidth={1.5} aria-hidden />
          </Link>
          {navLinks.map(({ to, label }) => {
            const isActive =
              location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
            return (
              <Link
                key={to}
                to={to}
                className={`nav-link text-sm font-medium px-3 py-2 rounded-md ${
                  isActive ? 'nav-link--active' : ''
                }`}
              >
                {label}
              </Link>
            )
          })}
          <span className="border-l border-neutral-200 h-5" aria-hidden />
          <SocialLinks variant="compact" />
          <span className="border-l border-neutral-200 h-5" aria-hidden />
          <Link
            to="/contact"
            className={`nav-link p-2 rounded-md ${
              location.pathname === '/contact' ? 'nav-link--active-icon' : ''
            }`}
            aria-label="Contact"
          >
            <Mail size={20} strokeWidth={1.5} aria-hidden />
          </Link>
          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link p-2 rounded-md"
            aria-label="RSS feed"
          >
            <Rss size={20} strokeWidth={1.5} aria-hidden />
          </a>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-neutral-200/80 py-6 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} — built with <Heart size={14} strokeWidth={2} className="inline-block align-text-bottom relative -top-px text-neutral-500" aria-hidden /> in Berlin @ Vitor
      </footer>
    </div>
  )
}
