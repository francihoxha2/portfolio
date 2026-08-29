import { PerformanceMonitor } from '@react-three/drei'
import { addAfterEffect, Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ComponentProps,
} from 'react'
import { CineonToneMapping, Color, MathUtils, PCFShadowMap, Vector3 } from 'three'
import {
  getHeroRecessionProgress,
  getSceneLayerTargets,
  normalizePointerCoordinates,
  SceneMotionController,
  type SceneMotionDiagnostics,
} from './motion/sceneMotion.ts'
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
  onMotionDiagnostics: (diagnostics: SceneMotionDiagnostics) => void
}

function SceneInputController({
  active,
  pointerEnabled,
  controller,
}: {
  active: boolean
  pointerEnabled: boolean
  controller: SceneMotionController
}) {
  const canvas = useThree((state) => state.gl.domElement)

  useEffect(() => {
    const hero = canvas.closest<HTMLElement>('.hero-section')
    if (!active || !hero) {
      controller.setPointer({ x: 0, y: 0, active: false })
      return undefined
    }

    const updatePointer = (event: PointerEvent) => {
      controller.setPointer(pointerEnabled
        ? normalizePointerCoordinates(event.clientX, event.clientY, hero.getBoundingClientRect())
        : { x: 0, y: 0, active: false })
    }

    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) {
        controller.setPointer({ x: 0, y: 0, active: false })
      }
    }
    const clearPointer = () => controller.setPointer({ x: 0, y: 0, active: false })

    const updateRecession = () => {
      const bounds = hero.getBoundingClientRect()
      controller.setRecession(getHeroRecessionProgress(
        bounds.top,
        bounds.height,
        window.innerHeight,
      ))
    }

    updateRecession()
    window.addEventListener('pointermove', updatePointer, { passive: true })
    window.addEventListener('pointerout', handlePointerOut, { passive: true })
    window.addEventListener('blur', clearPointer)
    window.addEventListener('scroll', updateRecession, { passive: true })
    window.addEventListener('resize', updateRecession, { passive: true })

    return () => {
      window.removeEventListener('pointermove', updatePointer)
      window.removeEventListener('pointerout', handlePointerOut)
      window.removeEventListener('blur', clearPointer)
      window.removeEventListener('scroll', updateRecession)
      window.removeEventListener('resize', updateRecession)
      controller.setPointer({ x: 0, y: 0, active: false })
    }
  }, [active, canvas, controller, pointerEnabled])

  return null
}

function CameraMotion({
  quality,
  controller,
}: {
  quality: SceneQualityProfile
  controller: SceneMotionController
}) {
  const camera = useThree((state) => state.camera)
  const cameraRef = useRef(camera)
  const lookAtRef = useRef(new Vector3(0, -0.08, 0))

  useFrame((_, delta) => {
    const runtime = controller.read()
    const targets = getSceneLayerTargets(
      runtime.pointer,
      runtime.recession,
      quality,
    )
    const damping = quality.tier === 'full' ? 3.8 : 2.8
    const safeDelta = Math.min(delta, 0.1)
    const controlledCamera = cameraRef.current
    const lookAt = lookAtRef.current

    controlledCamera.position.x = MathUtils.damp(controlledCamera.position.x, 6.5 + targets.camera.x, damping, safeDelta)
    controlledCamera.position.y = MathUtils.damp(controlledCamera.position.y, 4.25 + targets.camera.y, damping, safeDelta)
    controlledCamera.position.z = MathUtils.damp(controlledCamera.position.z, 9.6 + targets.camera.z, damping, safeDelta)
    lookAt.x = MathUtils.damp(lookAt.x, targets.camera.lookAtX, damping, safeDelta)
    lookAt.y = MathUtils.damp(lookAt.y, -0.08 + targets.camera.lookAtY, damping, safeDelta)
    controlledCamera.lookAt(lookAt)
  })

  return null
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
  onMotionDiagnostics,
}: DeveloperUniverseCanvasProps) {
  const motionController = useMemo(() => new SceneMotionController(), [])
  const shadows = useMemo<ComponentProps<typeof Canvas>['shadows']>(
    () => quality.shadows ? { enabled: true, type: PCFShadowMap } : false,
    [quality.shadows],
  )
  const handleCreated = useCallback(({ gl, camera }: Parameters<NonNullable<ComponentProps<typeof Canvas>['onCreated']>>[0]) => {
    gl.setClearColor(new Color('#070911'), 0)
    gl.shadowMap.type = PCFShadowMap
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
        shadows={shadows}
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
            motionController={motionController}
            onReady={onReady}
            onMotionDiagnostics={onMotionDiagnostics}
          />
        </PerformanceMonitor>

        <SceneInputController
          active={active}
          pointerEnabled={quality.pointerParallax}
          controller={motionController}
        />
        <CameraMotion quality={quality} controller={motionController} />
        <FrameLoopController active={active} />
        <ContextLossMonitor onContextLost={onContextLost} />
        <RendererDiagnostics quality={quality} onDiagnostics={onDiagnostics} />
      </Canvas>
    </div>
  )
}
