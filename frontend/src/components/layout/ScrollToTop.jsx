import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// SPA route changes don't reset scroll position by default — without this,
// navigating from the bottom of a long Knowledge Center article to another
// page lands the visitor mid-scroll on the new page.
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
