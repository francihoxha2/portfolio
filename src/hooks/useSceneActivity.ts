import { useEffect, useState, type RefObject } from 'react'

export function useSceneActivity(
  target: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const [isIntersecting, setIsIntersecting] = useState(true)
  const [isPageVisible, setIsPageVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState !== 'hidden',
  )

  useEffect(() => {
    if (!enabled || !target.current) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.01 },
    )

    observer.observe(target.current)
    return () => observer.disconnect()
  }, [enabled, target])

  useEffect(() => {
    if (!enabled) return undefined

    const updateVisibility = () => {
      setIsPageVisible(document.visibilityState !== 'hidden')
    }

    updateVisibility()
    document.addEventListener('visibilitychange', updateVisibility)
    return () => document.removeEventListener('visibilitychange', updateVisibility)
  }, [enabled])

  return enabled && isIntersecting && isPageVisible
}
