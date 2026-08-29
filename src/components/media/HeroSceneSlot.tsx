import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useSceneActivity } from '../../hooks/useSceneActivity.ts'
import { useHeroSceneCapability } from '../../hooks/useHeroSceneCapability.ts'
import { useSceneQuality } from '../../hooks/useSceneQuality.ts'
import type { SceneDiagnostics } from '../../three/DeveloperUniverseCanvas.tsx'
import type { SceneMotionDiagnostics } from '../../three/motion/sceneMotion.ts'
import HeroSceneBoundary from './HeroSceneBoundary.tsx'
import HeroStaticFallback from './HeroStaticFallback.tsx'

const LazyDeveloperUniverseCanvas = lazy(
  () => import('../../three/DeveloperUniverseCanvas.tsx'),
)

type SceneFailureReason = 'context-lost' | 'scene-error'

const heroMotionProperties = [
  '--hero-atmosphere-x',
  '--hero-atmosphere-y',
  '--hero-environment-y',
  '--hero-copy-recession-y',
  '--hero-signal-x',
] as const

function resetHeroMotion(hero: HTMLElement) {
  heroMotionProperties.forEach((property) => hero.style.removeProperty(property))
}

function useDeferredSceneLoad(enabled: boolean) {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    if (!enabled) return undefined

    const startLoading = () => setShouldLoad(true)

    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(startLoading, { timeout: 900 })
      return () => window.cancelIdleCallback(handle)
    }

    const handle = window.setTimeout(startLoading, 180)
    return () => window.clearTimeout(handle)
  }, [enabled])

  return shouldLoad
}

export default function HeroSceneSlot() {
  const slotRef = useRef<HTMLDivElement>(null)
  const capability = useHeroSceneCapability()
  const requestedQuality = capability.tier === 'full' ? 'full' : 'reduced'
  const { quality, downgrade } = useSceneQuality(requestedQuality)
  const [readyKey, setReadyKey] = useState<string | null>(null)
  const [failureReason, setFailureReason] = useState<SceneFailureReason | null>(null)
  const [diagnostics, setDiagnostics] = useState<SceneDiagnostics | null>(null)
  const qualityIsStatic = quality.profile.tier === 'static'
  const sceneAllowed = capability.allowsScene && !qualityIsStatic && !failureReason
  const shouldLoad = useDeferredSceneLoad(Boolean(sceneAllowed))
  const sceneActive = useSceneActivity(slotRef, shouldLoad && Boolean(sceneAllowed))
  const sceneTier = capability.allowsScene ? quality.profile.tier : capability.tier
  const sceneReason = failureReason ?? (
    capability.allowsScene ? quality.reason : capability.reason
  )
  const resetKey = `${capability.tier}:${capability.reason}:${quality.profile.tier}`
  const sceneMode = readyKey === resetKey && sceneAllowed ? 'enhanced' : 'fallback'

  useEffect(() => {
    const hero = slotRef.current?.closest<HTMLElement>('.hero-section')
    if (!hero) return undefined

    hero.dataset.heroEnvironment = sceneMode === 'enhanced' ? 'online' : 'static'
    if (sceneMode !== 'enhanced') resetHeroMotion(hero)

    return () => {
      delete hero.dataset.heroEnvironment
      resetHeroMotion(hero)
    }
  }, [sceneMode])

  const diagnosticAttributes = useMemo(() => ({
    'data-scene-draw-calls': diagnostics?.drawCalls,
    'data-scene-triangles': diagnostics?.triangles,
    'data-scene-lines': diagnostics?.lines,
    'data-scene-points': diagnostics?.points,
    'data-scene-textures': diagnostics?.textures,
    'data-scene-programs': diagnostics?.programs,
    'data-scene-dpr': diagnostics?.dpr,
  }), [diagnostics])

  const handleReady = useCallback(() => {
    setReadyKey(resetKey)
  }, [resetKey])

  const handleSceneError = useCallback(() => {
    setFailureReason('scene-error')
    setReadyKey(null)
  }, [])

  const handleContextLost = useCallback(() => {
    setFailureReason('context-lost')
    setReadyKey(null)
  }, [])

  const handleMotionDiagnostics = useCallback((motion: SceneMotionDiagnostics) => {
    const slot = slotRef.current
    if (!slot) return

    const hero = slot.closest<HTMLElement>('.hero-section')
    if (hero) {
      hero.style.setProperty('--hero-atmosphere-x', `${motion.pointerX * 11}px`)
      hero.style.setProperty('--hero-atmosphere-y', `${motion.pointerY * 7}px`)
      hero.style.setProperty('--hero-signal-x', `${motion.pointerX * 5}px`)
      hero.style.setProperty('--hero-environment-y', `${motion.recession * -16}px`)
      hero.style.setProperty('--hero-copy-recession-y', `${motion.recession * -7}px`)
    }

    slot.setAttribute('data-scene-pointer-active', String(motion.pointerActive))
    slot.setAttribute('data-scene-pointer-x', motion.pointerX.toFixed(4))
    slot.setAttribute('data-scene-pointer-y', motion.pointerY.toFixed(4))
    slot.setAttribute('data-scene-arrival', motion.arrival.toFixed(4))
    slot.setAttribute('data-scene-operational', motion.operational.toFixed(4))
    slot.setAttribute('data-scene-idle-tick', String(motion.idleTick))
    slot.setAttribute('data-scene-recession', motion.recession.toFixed(4))
    slot.setAttribute('data-scene-primary-x', motion.primaryX.toFixed(4))
    slot.setAttribute('data-scene-near-x', motion.nearX.toFixed(4))
    slot.setAttribute('data-scene-mid-x', motion.midX.toFixed(4))
    slot.setAttribute('data-scene-far-x', motion.farX.toFixed(4))
    slot.setAttribute('data-scene-data-x', motion.dataX.toFixed(4))
  }, [])

  return (
    <div
      ref={slotRef}
      className={`hero-scene-slot${sceneMode === 'enhanced' ? ' hero-scene-slot--ready' : ''}`}
      data-scene-mode={sceneMode}
      data-scene-tier={sceneTier}
      data-scene-reason={sceneReason}
      data-scene-loaded={shouldLoad && sceneAllowed}
      data-scene-active={sceneActive}
      data-scene-pointer-enabled={Boolean(sceneAllowed && quality.profile.pointerParallax)}
      data-scene-idle-enabled={Boolean(sceneAllowed && quality.profile.idleMotion)}
      {...diagnosticAttributes}
      aria-hidden="true"
    >
      <HeroStaticFallback />

      {shouldLoad && sceneAllowed ? (
        <HeroSceneBoundary
          fallback={null}
          resetKey={resetKey}
          onSceneError={handleSceneError}
        >
          <Suspense fallback={null}>
            <LazyDeveloperUniverseCanvas
              active={sceneActive}
              quality={quality.profile}
              onReady={handleReady}
              onContextLost={handleContextLost}
              onPerformanceDecline={downgrade}
              onDiagnostics={setDiagnostics}
              onMotionDiagnostics={handleMotionDiagnostics}
            />
          </Suspense>
        </HeroSceneBoundary>
      ) : null}
    </div>
  )
}
