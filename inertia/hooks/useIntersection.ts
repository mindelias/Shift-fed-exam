import { useEffect, useRef } from 'react'

export function useIntersection(onEnter: () => void, rootMargin = '200px', disabled = false) {
  const ref = useRef<HTMLDivElement | null>(null)
  const busy = useRef(false)

  useEffect(() => {
    if (disabled || !ref.current) return
    const node = ref.current

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !busy.current) {
          busy.current = true // lock
          onEnter()
          // unlock 300 ms later (enough for state flip)
          setTimeout(() => {
            busy.current = false
          }, 300)
        }
      },
      { rootMargin }
    )

    obs.observe(node)
    return () => obs.disconnect()
  }, [onEnter, rootMargin, disabled])

  return ref
}
