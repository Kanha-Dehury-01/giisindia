import { useEffect } from 'react'

/**
 * Sets document title, meta description, canonical URL, Open Graph/Twitter
 * card tags, and (optionally) a robots directive for the current route.
 * Deliberately dependency-free (no react-helmet) — the app is small enough
 * that a single effect covers it, and this same head state is what a
 * future prerender step would snapshot per-route for crawlers.
 *
 * `canonical` may be given as an absolute URL or a site-relative path
 * (e.g. "/courses/x") — relative paths are resolved against the current
 * origin so canonical/OG URLs are always absolute, per spec §32.
 */
function setMetaByName(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setMetaByProperty(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function removeMetaByProperty(property) {
  document.querySelector(`meta[property="${property}"]`)?.remove()
}

export function useSeo({ title, description, canonical, ogImage, ogType = 'website', robots }) {
  useEffect(() => {
    if (title) document.title = title
    if (description) setMetaByName('description', description)

    const absoluteCanonical = canonical
      ? new URL(canonical, window.location.origin).toString()
      : window.location.origin + window.location.pathname

    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', absoluteCanonical)

    setMetaByName('robots', robots ?? 'index,follow')

    if (title) setMetaByProperty('og:title', title)
    if (description) setMetaByProperty('og:description', description)
    setMetaByProperty('og:type', ogType)
    setMetaByProperty('og:url', absoluteCanonical)
    setMetaByProperty('og:site_name', 'GIIS India')
    if (ogImage) {
      setMetaByProperty('og:image', new URL(ogImage, window.location.origin).toString())
    } else {
      removeMetaByProperty('og:image')
    }

    setMetaByName('twitter:card', ogImage ? 'summary_large_image' : 'summary')
    if (title) setMetaByName('twitter:title', title)
    if (description) setMetaByName('twitter:description', description)
  }, [title, description, canonical, ogImage, ogType, robots])
}
