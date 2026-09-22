import { useEffect } from 'react'

/**
 * Injects one or more JSON-LD <script> tags for the current route and
 * removes them on unmount/change, so structured data never accumulates
 * across client-side navigations. Pass an array of schema objects built
 * with utils/structuredData.js.
 */
export function useStructuredData(schemas) {
  useEffect(() => {
    if (!schemas || schemas.length === 0) return undefined

    const tags = schemas.map((schema) => {
      const tag = document.createElement('script')
      tag.type = 'application/ld+json'
      tag.textContent = JSON.stringify(schema)
      document.head.appendChild(tag)
      return tag
    })

    return () => tags.forEach((tag) => tag.remove())
  }, [schemas])
}
