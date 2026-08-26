import { PerformanceMonitor } from '@react-three/drei'
import { addAfterEffect, Canvas, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState, type ComponentProps } from 'react'
import { CineonToneMapping, Color, PCFSoftShadowMap } from 'three'
import type { SceneQualityProfile } from './quality/sceneQuality.ts'
import DeveloperWorkspace from './scenes/DeveloperWorkspace.tsx'

export interface SceneDiagnostics {
  drawCalls: number
  triangles: number
  lines: number
  points: number
  textures: number
  programs: number
  dpr: number
}

interface DeveloperUniverseCanvasProps {
  active: boolean
  quality: SceneQualityProfile
  onReady: () => void
  onContextLost: () => void
  onPerformanceDecline: () => void
  onDiagnostics: (diagnostics: SceneDiagnostics) => void
}

function usePointerTarget(enabled: boolean): readonly [number, number] {
  const [target, setTarget] = useState<readonly [number, number]>([0, 0])

  useEffect(() => {
    if (!enabled) return undefined

    const updatePointer = (event: PointerEvent) => {
      setTarget([
        Math.max(-1, Math.min(1, (event.clientX / window.innerWidth) * 2 - 1)),
        Math.max(-1, Math.min(1, (event.clientY / window.innerHeight) * 2 - 1)),
      ])
    }

    window.addEventListener('pointermove', updatePointer, { passive: true })
    return () => window.removeEventListener('pointermove', updatePointer)
  }, [enabled])

  return target
}

function FrameLoopController({ active }: Pick<DeveloperUniverseCanvasProps, 'active'>) {
  const invalidate = useThree((state) => state.invalidate)
  const setFrameloop = useThree((state) => state.setFrameloop)

  useEffect(() => {
    setFrameloop(active ? 'always' : 'never')
    if (active) invalidate()
  }, [active, invalidate, setFrameloop])

  return null
}

function ContextLossMonitor({
  onContextLost,
}: Pick<DeveloperUniverseCanvasProps, 'onContextLost'>) {
  const canvas = useThree((state) => state.gl.domElement)

  useEffect(() => {
    const handleContextLoss = (event: Event) => {
      event.preventDefault()
      onContextLost()
    }

    canvas.addEventListener('webglcontextlost', handleContextLoss)
    return () => canvas.removeEventListener('webglcontextlost', handleContextLoss)
  }, [canvas, onContextLost])

  return null
}

function RendererDiagnostics({
  quality,
  onDiagnostics,
}: Pick<DeveloperUniverseCanvasProps, 'quality' | 'onDiagnostics'>) {
  const sentForTier = useRef<string | null>(null)
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    sentForTier.current = null
    return addAfterEffect(() => {
      if (
        sentForTier.current === quality.tier ||
        gl.info.render.calls === 0
      ) return

      sentForTier.current = quality.tier
      onDiagnostics({
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        lines: gl.info.render.lines,
        points: gl.info.render.points,
        textures: gl.info.memory.textures,
        programs: gl.info.programs?.length ?? 0,
        dpr: gl.getPixelRatio(),
      })
    })
  }, [gl, onDiagnostics, quality.tier])

  return null
}

export default function DeveloperUniverseCanvas({
  active,
  quality,
  onReady,
  onContextLost,
  onPerformanceDecline,
  onDiagnostics,
}: DeveloperUniverseCanvasProps) {
  const pointerTarget = usePointerTarget(quality.pointerParallax && active)
  const handleCreated = useCallback(({ gl, camera }: Parameters<NonNullable<ComponentProps<typeof Canvas>['onCreated']>>[0]) => {
    gl.setClearColor(new Color('#070911'), 0)
    gl.shadowMap.type = PCFSoftShadowMap
    gl.toneMapping = CineonToneMapping
    gl.toneMappingExposure = 1.04
    camera.lookAt(0, -0.08, 0)
  }, [])

  return (
    <div className="hero-scene-layer" data-quality-tier={quality.tier}>
      <Canvas
        aria-hidden="true"
        camera={{ position: [6.5, 4.25, 9.6], fov: 34, near: 0.1, far: 60 }}
        dpr={[1, quality.maxDpr]}
        frameloop={active ? 'always' : 'never'}
        gl={{
          alpha: true,
          antialias: quality.tier === 'full',
          depth: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        onCreated={handleCreated}
        shadows={quality.shadows}
      >
        <ambientLight intensity={0.42} color="#9eb6d2" />
        <hemisphereLight args={['#849cff', '#07080e', 0.72]} />
        <directionalLight
          position={[-3.8, 7.2, 6.4]}
          intensity={3.4}
          color="#d6ddff"
          castShadow={quality.shadows}
          shadow-mapSize-width={quality.shadowMapSize}
          shadow-mapSize-height={quality.shadowMapSize}
          shadow-camera-near={1}
          shadow-camera-far={18}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />
        <pointLight position={[4.4, 2.8, 4]} intensity={7} distance={12} color="#7067ff" />

        <PerformanceMonitor
          iterations={5}
          ms={500}
          threshold={0.7}
          flipflops={1}
          bounds={(refreshRate) => [
            quality.tier === 'full'
              ? Math.min(45, refreshRate * 0.72)
              : Math.min(27, refreshRate * 0.6),
            refreshRate,
          ]}
          onDecline={onPerformanceDecline}
          onFallback={onPerformanceDecline}
        >
          <DeveloperWorkspace
            quality={quality}
            pointerTarget={pointerTarget}
            onReady={onReady}
          />
        </PerformanceMonitor>

        <FrameLoopController active={active} />
        <ContextLossMonitor onContextLost={onContextLost} />
        <RendererDiagnostics quality={quality} onDiagnostics={onDiagnostics} />
      </Canvas>
    </div>
  )
}
