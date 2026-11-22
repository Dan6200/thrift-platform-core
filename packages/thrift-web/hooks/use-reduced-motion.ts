'use client'
import { useEffect, useState } from 'react'

// Keep server rendering still until the browser preference is known.
export function useReducedMotion() {
  const [reduced, setReduced] = useState<boolean | null>(null)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}
