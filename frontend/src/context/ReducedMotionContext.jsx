import { createContext, useContext, useEffect, useState } from 'react'

// Single source of truth for prefers-reduced-motion, per docs/ARCHITECTURE.md §J:
// "This is implemented once, centrally, not per-component — no component is
// allowed to ship its own prefers-reduced-motion media query."
const ReducedMotionContext = createContext(false)

export function ReducedMotionProvider({ children }) {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event) => setReduced(event.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return <ReducedMotionContext.Provider value={reduced}>{children}</ReducedMotionContext.Provider>
}

export function useReducedMotion() {
  return useContext(ReducedMotionContext)
}
