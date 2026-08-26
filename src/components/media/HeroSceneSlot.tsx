import type { ReactNode } from 'react'
import { useHeroSceneCapability } from '../../hooks/useHeroSceneCapability.ts'
import HeroSceneBoundary from './HeroSceneBoundary.tsx'
import HeroStaticFallback from './HeroStaticFallback.tsx'

interface HeroSceneSlotProps {
  children?: ReactNode
}

export default function HeroSceneSlot({ children }: HeroSceneSlotProps) {
  const capability = useHeroSceneCapability()
  const fallback = <HeroStaticFallback />
  const hasEnhancedScene = Boolean(children) && capability.allowsScene

  return (
    <div
      className="hero-scene-slot"
      data-scene-mode={hasEnhancedScene ? 'enhanced' : 'fallback'}
      data-scene-tier={capability.tier}
      data-scene-reason={capability.reason}
      aria-hidden="true"
    >
      <HeroSceneBoundary
        fallback={fallback}
        resetKey={`${capability.tier}:${capability.reason}`}
      >
        {hasEnhancedScene ? children : fallback}
      </HeroSceneBoundary>
    </div>
  )
}
