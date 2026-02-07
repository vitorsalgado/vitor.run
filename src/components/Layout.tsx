import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
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
      <Footer />
    </div>
  )
}
