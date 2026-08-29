import { Line, RoundedBox, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'
import {
  Group,
  InstancedMesh,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  SRGBColorSpace,
} from 'three'
import {
  createDataPointPositions,
  sceneColors,
  systemConnections,
  type SceneVector3,
} from '../../data/scene.ts'
import {
  getLayerArrivalProgress,
  getSceneLayerTargets,
  sampleConnectionPath,
  SceneMotionController,
  type SceneMotionDiagnostics,
  type SceneMotionRuntime,
} from '../motion/sceneMotion.ts'
import type { SceneQualityProfile } from '../quality/sceneQuality.ts'

interface DeveloperWorkspaceProps {
  quality: SceneQualityProfile
  motionController: SceneMotionController
  onReady: () => void
  onMotionDiagnostics: (diagnostics: SceneMotionDiagnostics) => void
}

type MotionComponentProps = Pick<DeveloperWorkspaceProps, 'quality' | 'motionController'>

function sceneActivity(runtime: SceneMotionRuntime, quality: SceneQualityProfile) {
  return quality.idleMotion
    ? runtime.operational * quality.motionScale * (1 - runtime.recession * 0.72)
    : 0
}

function PlanifyScreen({ onReady }: Pick<DeveloperWorkspaceProps, 'onReady'>) {
  const texture = useTexture('/planify-preview.png', (loadedTexture) => {
    loadedTexture.colorSpace = SRGBColorSpace
  })

  useEffect(() => {
    let committedFrame = 0
    const textureFrame = requestAnimationFrame(() => {
      committedFrame = requestAnimationFrame(onReady)
    })
    return () => {
      cancelAnimationFrame(textureFrame)
      if (committedFrame) cancelAnimationFrame(committedFrame)
    }
  }, [onReady, texture])

  return (
    <mesh position={[0, 0.02, 0.121]}>
      <planeGeometry args={[4.18, 2.19]} />
      <meshBasicMaterial color="#ffffff" map={texture} toneMapped={false} />
    </mesh>
  )
}

function Monitor({
  quality,
  motionController,
  onReady,
}: MotionComponentProps & Pick<DeveloperWorkspaceProps, 'onReady'>) {
  const monitorRef = useRef<Group>(null)
  const signalRef = useRef<MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    if (!monitorRef.current) return
    const activity = sceneActivity(motionController.read(), quality)
    const phase = clock.elapsedTime * 0.58
    monitorRef.current.position.y = 0.3 + Math.sin(phase) * 0.012 * activity
    monitorRef.current.rotation.z = Math.sin(phase * 0.63) * 0.0022 * activity
    if (signalRef.current) {
      signalRef.current.opacity = 0.72 + (0.2 + Math.sin(phase * 1.7) * 0.08) * activity
    }
  })

  return (
    <group ref={monitorRef} position={[-0.2, 0.3, -0.55]} rotation={[0.015, -0.06, 0]}>
      <RoundedBox
        args={[4.65, 2.76, 0.2]}
        radius={0.14}
        smoothness={3}
        castShadow={quality.shadows}
      >
        <meshStandardMaterial
          color={sceneColors.darkMetal}
          metalness={0.68}
          roughness={0.42}
        />
      </RoundedBox>

      <PlanifyScreen onReady={onReady} />

      <mesh position={[0, -1.76, -0.04]} castShadow={quality.shadows}>
        <boxGeometry args={[0.42, 0.85, 0.18]} />
        <meshStandardMaterial
          color={sceneColors.darkMetal}
          metalness={0.62}
          roughness={0.48}
        />
      </mesh>
      <RoundedBox
        args={[1.72, 0.14, 0.72]}
        radius={0.07}
        smoothness={2}
        position={[0, -2.18, 0.18]}
        castShadow={quality.shadows}
      >
        <meshStandardMaterial color={sceneColors.charcoalRaised} metalness={0.7} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 1.47, 0.125]}>
        <boxGeometry args={[1.1, 0.025, 0.02]} />
        <meshBasicMaterial
          ref={signalRef}
          color={sceneColors.cyan}
          transparent
          opacity={0.72}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function Worksurface({ quality }: Pick<DeveloperWorkspaceProps, 'quality'>) {
  return (
    <>
      <RoundedBox
        args={[7.8, 0.32, 4.65]}
        radius={0.2}
        smoothness={2}
        position={[0, -1.52, 0.36]}
        receiveShadow={quality.shadows}
      >
        <meshStandardMaterial
          color={sceneColors.charcoal}
          metalness={0.58}
          roughness={0.62}
        />
      </RoundedBox>
      <mesh position={[0, -1.34, 1.05]}>
        <boxGeometry args={[6.6, 0.018, 0.022]} />
        <meshBasicMaterial color={sceneColors.blue} toneMapped={false} />
      </mesh>
    </>
  )
}

function InterfaceModule({ quality, motionController }: MotionComponentProps) {
  const panelRef = useRef<Group>(null)
  const activityBarRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!panelRef.current) return
    const activity = sceneActivity(motionController.read(), quality)
    const phase = clock.elapsedTime * 0.52 + 0.7
    panelRef.current.position.y = 0.28 + Math.sin(phase) * 0.052 * activity
    panelRef.current.rotation.z = -0.025 + Math.sin(phase * 0.61) * 0.006 * activity
    if (activityBarRef.current) {
      activityBarRef.current.scale.x = 0.72 + (0.2 + Math.sin(phase * 2.3) * 0.08) * activity
    }
  })

  return (
    <group ref={panelRef} position={[-3.2, 0.28, 0.25]} rotation={[0.02, 0.28, -0.025]}>
      <RoundedBox args={[1.48, 1.58, 0.16]} radius={0.12} smoothness={2}>
        <meshStandardMaterial
          color={sceneColors.charcoalRaised}
          metalness={0.36}
          roughness={0.58}
        />
      </RoundedBox>
      {[0.44, 0.12, -0.2, -0.52].map((y, index) => (
        <mesh
          key={y}
          ref={index === 0 ? activityBarRef : undefined}
          position={[-0.08, y, 0.095]}
        >
          <boxGeometry args={[index % 2 === 0 ? 0.86 : 0.62, 0.055, 0.018]} />
          <meshBasicMaterial
            color={index === 0 ? sceneColors.violet : index === 2 ? sceneColors.cyan : '#596579'}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh position={[-0.53, 0.68, 0.1]}>
        <circleGeometry args={[0.055, 12]} />
        <meshBasicMaterial color={sceneColors.violet} toneMapped={false} />
      </mesh>
    </group>
  )
}

function DatabaseCore({ quality, motionController }: MotionComponentProps) {
  const coreRef = useRef<Group>(null)
  const materialRefs = useRef<Array<MeshStandardMaterial | null>>([])

  useFrame(({ clock }) => {
    const activity = sceneActivity(motionController.read(), quality)
    const phase = clock.elapsedTime * 0.72 + 2.1
    if (coreRef.current) {
      coreRef.current.position.y = -0.52 + Math.sin(phase) * 0.024 * activity
    }
    materialRefs.current.forEach((material, index) => {
      if (material) {
        material.emissiveIntensity = 0.075 + (0.055 + Math.sin(phase * 1.45 - index * 0.9) * 0.025) * activity
      }
    })
  })

  return (
    <group ref={coreRef} position={[2.95, -0.52, 0.52]}>
      {[0, 0.24, 0.48].map((y, index) => (
        <mesh key={y} position={[0, y, 0]} castShadow={quality.shadows}>
          <cylinderGeometry args={[0.48, 0.48, 0.2, 24]} />
          <meshStandardMaterial
            ref={(material) => { materialRefs.current[index] = material }}
            color={sceneColors.charcoalRaised}
            emissive={sceneColors.blue}
            emissiveIntensity={0.08}
            metalness={0.5}
            roughness={0.48}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.63, 0]}>
        <torusGeometry args={[0.34, 0.025, 8, 28]} />
        <meshBasicMaterial color={sceneColors.cyan} toneMapped={false} />
      </mesh>
    </group>
  )
}

function SystemNodes({ quality, motionController }: MotionComponentProps) {
  const nodesRef = useRef<Group>(null)
  const lightRef = useRef<PointLight>(null)
  const includeSecondaryNodes = quality.tier === 'full'

  useFrame(({ clock }) => {
    const activity = sceneActivity(motionController.read(), quality)
    const phase = clock.elapsedTime * 0.64 + 4.3
    if (nodesRef.current) {
      nodesRef.current.position.y = Math.sin(phase * 0.72) * 0.032 * activity
    }
    if (lightRef.current) {
      lightRef.current.intensity = 2.8 + (0.5 + Math.sin(phase) * 0.38) * activity
    }
  })

  return (
    <group ref={nodesRef}>
      <RoundedBox args={[1.05, 0.66, 0.18]} radius={0.1} position={[3.1, 1.28, -0.16]}>
        <meshStandardMaterial
          color={sceneColors.charcoalRaised}
          emissive={sceneColors.violet}
          emissiveIntensity={0.12}
          metalness={0.42}
          roughness={0.5}
        />
      </RoundedBox>

      <mesh position={[3.46, -0.28, 0.58]}>
        <icosahedronGeometry args={[0.34, 1]} />
        <meshStandardMaterial
          color={sceneColors.charcoalRaised}
          emissive={sceneColors.cyan}
          emissiveIntensity={0.34}
          metalness={0.28}
          roughness={0.38}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[3.46, -0.18, 0.78]}
        color={sceneColors.cyan}
        intensity={2.8}
        distance={2.3}
        decay={2}
      />

      {includeSecondaryNodes && (
        <>
          <RoundedBox args={[0.56, 0.92, 0.14]} radius={0.1} position={[2.45, 0.76, 0.6]}>
            <meshStandardMaterial color={sceneColors.charcoalRaised} metalness={0.35} roughness={0.56} />
          </RoundedBox>
          <RoundedBox args={[0.78, 0.48, 0.14]} radius={0.08} position={[2.2, -0.88, 1.3]}>
            <meshStandardMaterial color={sceneColors.charcoalRaised} metalness={0.35} roughness={0.56} />
          </RoundedBox>
        </>
      )}
    </group>
  )
}

function ConnectionPaths({ quality }: Pick<DeveloperWorkspaceProps, 'quality'>) {
  const paths = quality.tier === 'full' ? systemConnections : systemConnections.slice(1, 3)

  return (
    <group>
      {paths.map((points, index) => (
        <Line
          key={index}
          points={points as SceneVector3[]}
          color={index % 2 === 0 ? sceneColors.cyan : sceneColors.violet}
          lineWidth={0.72}
          transparent
          opacity={quality.tier === 'full' ? 0.5 : 0.36}
          toneMapped={false}
        />
      ))}
    </group>
  )
}

function FlowPulses({ quality, motionController }: MotionComponentProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const materialRef = useRef<MeshBasicMaterial>(null)
  const helper = useMemo(() => new Object3D(), [])
  const frameAccumulator = useRef(0)
  const routeIndexes = useMemo(
    () => quality.tier === 'full' ? [0, 2, 1, 3] : [1, 2],
    [quality.tier],
  )

  const updateInstances = useCallback((elapsedTime: number) => {
    if (!meshRef.current) return
    const runtime = motionController.read()
    const activity = sceneActivity(runtime, quality)
    const speed = 0.105 * (0.45 + quality.motionScale * 0.55) * (1 - runtime.recession * 0.62)

    for (let index = 0; index < quality.flowPulseCount; index += 1) {
      const route = systemConnections[routeIndexes[index % routeIndexes.length]]
      const progress = (elapsedTime * speed + index * 0.263) % 1
      const [x, y, z] = sampleConnectionPath(route, progress)
      const envelope = Math.sin(progress * Math.PI)
      helper.position.set(x, y, z + 0.035)
      helper.scale.setScalar((0.5 + envelope * 0.72) * Math.max(0.001, activity))
      helper.updateMatrix()
      meshRef.current.setMatrixAt(index, helper.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    if (materialRef.current) {
      materialRef.current.opacity = 0.22 + activity * 0.7
    }
  }, [helper, motionController, quality, routeIndexes])

  useLayoutEffect(() => updateInstances(0), [updateInstances])
  useFrame(({ clock }, delta) => {
    frameAccumulator.current += delta
    const interval = 1 / Math.max(1, quality.updateRate)
    if (frameAccumulator.current < interval) return
    frameAccumulator.current = 0
    updateInstances(clock.elapsedTime)
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, quality.flowPulseCount]}>
      <sphereGeometry args={[0.06, 7, 7]} />
      <meshBasicMaterial
        ref={materialRef}
        color={sceneColors.softWhite}
        transparent
        opacity={0.22}
        toneMapped={false}
      />
    </instancedMesh>
  )
}

function DataPoints({ quality, motionController }: MotionComponentProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const materialRef = useRef<MeshBasicMaterial>(null)
  const points = useMemo(
    () => createDataPointPositions(quality.particleCount),
    [quality.particleCount],
  )
  const helper = useMemo(() => new Object3D(), [])
  const frameAccumulator = useRef(0)

  const updateInstances = useCallback((elapsedTime: number) => {
    if (!meshRef.current) return
    const runtime = motionController.read()
    const activity = sceneActivity(runtime, quality)
    const pointerLane = (runtime.pointer.x + 1) * 0.5

    points.forEach(([x, y, z], index) => {
      const phase = elapsedTime * 0.38 + index * 0.58
      const pulse = Math.sin(phase) * 0.052 * activity
      const normalizedLane = (x + 3.8) / 7.6
      const proximity = runtime.pointer.active
        ? Math.max(0, 1 - Math.abs(normalizedLane - pointerLane) * 4.2)
        : 0
      const baseScale = index % 9 === 0 ? 1.5 : 0.72
      helper.position.set(x, y + pulse, z + Math.cos(phase * 0.47) * 0.018 * activity)
      helper.scale.setScalar(baseScale * (1 + proximity * 0.42))
      helper.updateMatrix()
      meshRef.current?.setMatrixAt(index, helper.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (materialRef.current) {
      materialRef.current.opacity = 0.48 + activity * 0.34
    }
  }, [helper, motionController, points, quality])

  useLayoutEffect(() => updateInstances(0), [updateInstances])
  useFrame(({ clock }, delta) => {
    frameAccumulator.current += delta
    const interval = 1 / Math.max(1, quality.updateRate)
    if (frameAccumulator.current < interval) return
    frameAccumulator.current = 0
    updateInstances(clock.elapsedTime)
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, points.length]}>
      <sphereGeometry args={[0.025, 5, 5]} />
      <meshBasicMaterial
        ref={materialRef}
        color={sceneColors.cyan}
        transparent
        opacity={0.48}
        toneMapped={false}
      />
    </instancedMesh>
  )
}

function dampLayer(
  group: Group | null,
  target: { x: number; y: number; rotationX: number; rotationY: number },
  entry: { x: number; y: number; z: number },
  damping: number,
  delta: number,
) {
  if (!group) return
  group.position.x = MathUtils.damp(group.position.x, target.x + entry.x, damping, delta)
  group.position.y = MathUtils.damp(group.position.y, target.y + entry.y, damping, delta)
  group.position.z = MathUtils.damp(group.position.z, entry.z, damping, delta)
  group.rotation.x = MathUtils.damp(group.rotation.x, target.rotationX, damping, delta)
  group.rotation.y = MathUtils.damp(group.rotation.y, target.rotationY, damping, delta)
}

export default function DeveloperWorkspace({
  quality,
  motionController,
  onReady,
  onMotionDiagnostics,
}: DeveloperWorkspaceProps) {
  const rootRef = useRef<Group>(null)
  const primaryRef = useRef<Group>(null)
  const nearRef = useRef<Group>(null)
  const midRef = useRef<Group>(null)
  const farRef = useRef<Group>(null)
  const dataRef = useRef<Group>(null)
  const readyRef = useRef(false)
  const reportElapsedRef = useRef(0)

  const handleReady = useCallback(() => {
    if (readyRef.current) return
    readyRef.current = true
    onReady()
  }, [onReady])

  useLayoutEffect(() => {
    if (rootRef.current) {
      rootRef.current.position.set(0, -0.08, -0.72)
      rootRef.current.scale.setScalar(0.95)
    }
    primaryRef.current?.position.set(0, -0.34, -0.48)
    nearRef.current?.position.set(-0.52, 0.06, 0.48)
    midRef.current?.position.set(0.42, -0.1, -0.38)
    farRef.current?.position.set(0, 0.18, -0.64)
    dataRef.current?.position.set(0, 0.24, -0.82)
  }, [])

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.1)
    const runtime = motionController.advance(safeDelta, readyRef.current, quality)

    const targets = getSceneLayerTargets(runtime.pointer, runtime.recession, quality)
    const damping = quality.tier === 'full' ? 5.2 : 4.1
    const primaryArrival = getLayerArrivalProgress(runtime.arrivalElapsed, 0, 0.88)
    const nearArrival = getLayerArrivalProgress(runtime.arrivalElapsed, 0.2, 0.9)
    const midArrival = getLayerArrivalProgress(runtime.arrivalElapsed, 0.34, 0.94)
    const farArrival = getLayerArrivalProgress(runtime.arrivalElapsed, 0.48, 1)
    const dataArrival = getLayerArrivalProgress(runtime.arrivalElapsed, 0.66, 0.92)

    if (rootRef.current) {
      rootRef.current.position.y = MathUtils.damp(rootRef.current.position.y, -runtime.recession * 0.08, damping, safeDelta)
      rootRef.current.position.z = MathUtils.damp(rootRef.current.position.z, -runtime.recession * 0.5, damping, safeDelta)
      const rootScale = 1 - runtime.recession * 0.035
      rootRef.current.scale.x = MathUtils.damp(rootRef.current.scale.x, rootScale, damping, safeDelta)
      rootRef.current.scale.y = MathUtils.damp(rootRef.current.scale.y, rootScale, damping, safeDelta)
      rootRef.current.scale.z = MathUtils.damp(rootRef.current.scale.z, rootScale, damping, safeDelta)
    }

    dampLayer(primaryRef.current, targets.primary, {
      x: 0,
      y: (1 - primaryArrival) * -0.34,
      z: (1 - primaryArrival) * -0.48 + runtime.recession * 0.1,
    }, damping, safeDelta)
    dampLayer(nearRef.current, targets.near, {
      x: (1 - nearArrival) * -0.52,
      y: (1 - nearArrival) * 0.06,
      z: (1 - nearArrival) * 0.48,
    }, damping, safeDelta)
    dampLayer(midRef.current, targets.mid, {
      x: (1 - midArrival) * 0.42,
      y: (1 - midArrival) * -0.1,
      z: (1 - midArrival) * -0.38,
    }, damping, safeDelta)
    dampLayer(farRef.current, targets.far, {
      x: 0,
      y: (1 - farArrival) * 0.18,
      z: (1 - farArrival) * -0.64 - runtime.recession * 0.12,
    }, damping, safeDelta)
    dampLayer(dataRef.current, targets.data, {
      x: 0,
      y: (1 - dataArrival) * 0.24,
      z: (1 - dataArrival) * -0.82 - runtime.recession * 0.2,
    }, damping, safeDelta)

    reportElapsedRef.current += safeDelta
    if (readyRef.current && reportElapsedRef.current >= 0.2) {
      reportElapsedRef.current = 0
      onMotionDiagnostics({
        pointerActive: runtime.pointer.active,
        pointerX: runtime.pointer.x,
        pointerY: runtime.pointer.y,
        arrival: runtime.arrival,
        operational: runtime.operational,
        idleTick: runtime.idleTick,
        recession: runtime.recession,
        primaryX: primaryRef.current?.position.x ?? 0,
        nearX: nearRef.current?.position.x ?? 0,
        midX: midRef.current?.position.x ?? 0,
        farX: farRef.current?.position.x ?? 0,
        dataX: dataRef.current?.position.x ?? 0,
      })
    }
  })

  return (
    <group ref={rootRef}>
      <group ref={primaryRef}>
        <Worksurface quality={quality} />
        <Monitor quality={quality} motionController={motionController} onReady={handleReady} />
      </group>

      <group ref={nearRef}>
        <InterfaceModule quality={quality} motionController={motionController} />
      </group>

      <group ref={midRef}>
        <DatabaseCore quality={quality} motionController={motionController} />
        <SystemNodes quality={quality} motionController={motionController} />
      </group>

      <group ref={farRef}>
        <ConnectionPaths quality={quality} />
        <FlowPulses quality={quality} motionController={motionController} />
      </group>

      <group ref={dataRef}>
        <DataPoints quality={quality} motionController={motionController} />
      </group>
    </group>
  )
}
