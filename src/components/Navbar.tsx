import { useEffect, useState } from 'react'
import { Mail, Menu, Rss, TentTree, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { SocialLinks } from './SocialLinks'
import { ThemeToggle } from './ThemeToggle'
import { SITE } from '../lib/site'

const navLinks = [
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
]

export function Navbar() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Reset menu state when location changes
  useEffect(() => {
    queueMicrotask(() => {
      setMenuOpen(false)
    })
  }, [location.pathname])

  // Check dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    return () => observer.disconnect()
  }, [])

  const isActive = (to: string) => {
    return location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
  }

  return (
    <header className="border-b border-neutral-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10 dark:border-neutral-700/80 dark:bg-neutral-900/80 select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      <nav className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        {/* Brand icon - visible on home page and desktop, name on mobile for other pages */}
        {location.pathname === '/' ? (
          <Link
            to="/"
            className="nav-link nav-link--brand shrink-0 p-2 rounded-md nav-link--active-icon"
            aria-label="Home"
          >
            <TentTree size={24} strokeWidth={1.5} aria-hidden />
          </Link>
        ) : (
          <>
            {/* Brand icon - hidden on mobile, visible on desktop */}
            <Link
              to="/"
              className="nav-link nav-link--brand shrink-0 p-2 rounded-md hidden md:block"
              aria-label="Home"
            >
              <TentTree size={24} strokeWidth={1.5} aria-hidden />
            </Link>
            {/* Name - visible on mobile, hidden on desktop */}
            <Link
              to="/"
              className="text-xl font-bold text-slate-900 dark:text-slate-100 px-0 py-2 rounded-md md:hidden transition-colors"
              aria-label="Home"
            >
              {SITE.author}
            </Link>
          </>
        )}

        {/* Desktop navigation - hidden on mobile */}
        <div className="hidden md:flex flex-wrap justify-center items-center gap-4 flex-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link text-sm font-medium px-3 py-2 rounded-md ${
                isActive(to) ? 'nav-link--active' : ''
              }`}
            >
              {label}
            </Link>
          ))}
          <span className="border-l border-neutral-200 dark:border-neutral-600 h-5" aria-hidden />
          <SocialLinks variant="compact" />
          <span className="border-l border-neutral-200 dark:border-neutral-600 h-5" aria-hidden />
          <Link
            to="/contact"
            className={`nav-link nav-link--contact p-2 rounded-md ${
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
        </div>

        {/* Mobile menu and theme toggle - right side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(!menuOpen)
            }}
            className="relative p-2 rounded-md cursor-pointer md:hidden text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 select-none active:bg-neutral-100 dark:active:bg-neutral-800 z-10"
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X size={20} strokeWidth={1.5} aria-hidden />
            ) : (
              <Menu size={20} strokeWidth={1.5} aria-hidden />
            )}
          </button>

          {/* Theme toggle - always visible */}
          <ThemeToggle />
        </div>
      </nav>

      {/* Full-width mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          {/* Menu panel - positioned below header */}
          <div className="absolute top-[73px] left-0 right-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 shadow-lg max-h-[calc(100vh-73px)] overflow-y-auto">
            <nav className="w-full">
              <div className="max-w-3xl mx-auto px-6 py-4">
                <ul className="space-y-1">
                  {navLinks.map(({ to, label }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        onClick={() => setMenuOpen(false)}
                        className={`block px-4 py-3 text-base font-medium rounded-md transition-colors ${
                          isActive(to)
                            ? ''
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                        style={{
                          color: isDark ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)',
                          ...(isActive(to) && {
                            textDecoration: 'underline',
                            textDecorationColor: 'var(--color-accent)',
                            textUnderlineOffset: '0.25rem',
                            textDecorationThickness: '2px'
                          })
                        }}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      to="/contact"
                      onClick={() => setMenuOpen(false)}
                      className={`block px-4 py-3 text-base font-medium rounded-md transition-colors ${
                        location.pathname === '/contact'
                          ? ''
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                      style={{
                        color: isDark ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)',
                        ...(location.pathname === '/contact' && {
                          textDecoration: 'underline',
                          textDecorationColor: 'var(--color-accent)',
                          textUnderlineOffset: '0.25rem',
                          textDecorationThickness: '2px'
                        })
                      }}
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <a
                      href="/rss.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 text-base font-medium rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      style={{ color: isDark ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)' }}
                    >
                      RSS Feed
                    </a>
                  </li>
                  <li className="pt-4">
                    <div className="px-4">
                      <SocialLinks variant="compact" className="[&_a]:pl-0 [&_a]:pr-2 [&_a]:py-2" />
                    </div>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
