import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    setDark(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="nav-link p-2 rounded-md cursor-pointer"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? (
        <Sun size={20} strokeWidth={1.5} aria-hidden />
      ) : (
        <Moon size={20} strokeWidth={1.5} aria-hidden />
      )}
    </button>
  )
}
