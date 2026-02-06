import { Buffer } from 'buffer'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply saved or system theme before first paint to avoid flash
const stored = localStorage.getItem('theme')
const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
const theme = stored === 'dark' || stored === 'light' ? stored : prefersDark ? 'dark' : 'light'
document.documentElement.classList.toggle('dark', theme === 'dark')

const g = globalThis as typeof globalThis & { Buffer?: typeof Buffer }
if (typeof g.Buffer === 'undefined') {
  g.Buffer = Buffer
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
