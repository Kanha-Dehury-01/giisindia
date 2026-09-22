import { useEffect } from 'react'

/**
 * Sets document title + meta description for the current route.
 * Deliberately dependency-free (no react-helmet) — the app is small enough
 * that a single effect covers it, and this same head state is what the
 * Phase-9 prerender step snapshots per-route for crawlers.
 */
export function useSeo({ title, description, canonical }) {
  useEffect(() => {
    if (title) document.title = title

    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', description)
    }

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        document.head.appendChild(link)
      }
      link.setAttribute('href', canonical)
    }
  }, [title, description, canonical])
}
