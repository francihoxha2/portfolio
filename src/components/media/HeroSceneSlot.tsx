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
import HeroSceneBoundary from './HeroSceneBoundary.tsx'
import HeroStaticFallback from './HeroStaticFallback.tsx'

const LazyDeveloperUniverseCanvas = lazy(
  () => import('../../three/DeveloperUniverseCanvas.tsx'),
)

type SceneFailureReason = 'context-lost' | 'scene-error'

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

  return (
    <div
      ref={slotRef}
      className={`hero-scene-slot${sceneMode === 'enhanced' ? ' hero-scene-slot--ready' : ''}`}
      data-scene-mode={sceneMode}
      data-scene-tier={sceneTier}
      data-scene-reason={sceneReason}
      data-scene-loaded={shouldLoad && sceneAllowed}
      data-scene-active={sceneActive}
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
            />
          </Suspense>
        </HeroSceneBoundary>
      ) : null}
    </div>
  )
}
