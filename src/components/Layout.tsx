import { Heart, Mail } from 'lucide-react'
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
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <nav className="max-w-3xl mx-auto px-6 py-4 flex flex-wrap justify-center items-center gap-8">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-colors ${
                location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
                  ? 'text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {label}
            </Link>
          ))}
          <span className="border-l border-slate-200 h-5" aria-hidden />
          <SocialLinks variant="compact" />
          <span className="border-l border-slate-200 h-5" aria-hidden />
          <Link
            to="/contact"
            className={`text-slate-500 hover:text-slate-900 transition-colors ${
              location.pathname === '/contact' ? 'text-slate-900' : ''
            }`}
            aria-label="Contact"
          >
            <Mail size={20} strokeWidth={1.5} aria-hidden />
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200/80 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} — built with <Heart size={14} strokeWidth={2} className="inline-block align-text-bottom relative -top-px text-slate-500" aria-hidden /> in Berlin @ Vitor
      </footer>
    </div>
  )
}
