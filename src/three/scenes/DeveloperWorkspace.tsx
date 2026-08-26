import { Line, RoundedBox, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import {
  Group,
  InstancedMesh,
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
import type { SceneQualityProfile } from '../quality/sceneQuality.ts'

interface DeveloperWorkspaceProps {
  quality: SceneQualityProfile
  pointerTarget: readonly [number, number]
  onReady: () => void
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
      <meshBasicMaterial
        color="#ffffff"
        map={texture}
        toneMapped={false}
      />
    </mesh>
  )
}

function Monitor({
  quality,
  onReady,
}: Pick<DeveloperWorkspaceProps, 'quality' | 'onReady'>) {
  return (
    <group position={[-0.2, 0.3, -0.55]} rotation={[0.015, -0.06, 0]}>
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
        <meshBasicMaterial color={sceneColors.cyan} toneMapped={false} />
      </mesh>
    </group>
  )
}

function InterfaceModule({ quality }: Pick<DeveloperWorkspaceProps, 'quality'>) {
  const panelRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!panelRef.current || !quality.idleMotion) return
    panelRef.current.position.y = 0.28 + Math.sin(clock.elapsedTime * 0.45) * 0.035
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
        <mesh key={y} position={[-0.08, y, 0.095]}>
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

function DatabaseCore({ quality }: Pick<DeveloperWorkspaceProps, 'quality'>) {
  return (
    <group position={[2.95, -0.52, 0.52]}>
      {[0, 0.24, 0.48].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow={quality.shadows}>
          <cylinderGeometry args={[0.48, 0.48, 0.2, 24]} />
          <meshStandardMaterial
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

function SystemNodes({ quality }: Pick<DeveloperWorkspaceProps, 'quality'>) {
  const lightRef = useRef<PointLight>(null)
  const includeSecondaryNodes = quality.tier === 'full'

  useFrame(({ clock }) => {
    if (!lightRef.current || !quality.idleMotion) return
    lightRef.current.intensity = 3.2 + Math.sin(clock.elapsedTime * 0.65) * 0.45
  })

  return (
    <group>
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
        intensity={3.2}
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
          opacity={0.48}
          toneMapped={false}
        />
      ))}
    </group>
  )
}

function DataPoints({ quality }: Pick<DeveloperWorkspaceProps, 'quality'>) {
  const meshRef = useRef<InstancedMesh>(null)
  const points = useMemo(
    () => createDataPointPositions(quality.particleCount),
    [quality.particleCount],
  )
  const helper = useMemo(() => new Object3D(), [])

  const updateInstances = (elapsedTime: number) => {
    if (!meshRef.current) return

    points.forEach(([x, y, z], index) => {
      const pulse = quality.idleMotion
        ? Math.sin(elapsedTime * 0.42 + index * 0.58) * 0.035
        : 0
      const scale = index % 9 === 0 ? 1.5 : 0.72
      helper.position.set(x, y + pulse, z)
      helper.scale.setScalar(scale)
      helper.updateMatrix()
      meshRef.current?.setMatrixAt(index, helper.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }

  useLayoutEffect(() => updateInstances(0))
  useFrame(({ clock }) => updateInstances(clock.elapsedTime))

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, points.length]}>
      <sphereGeometry args={[0.025, 5, 5]} />
      <meshBasicMaterial color={sceneColors.cyan} toneMapped={false} />
    </instancedMesh>
  )
}

export default function DeveloperWorkspace({
  quality,
  pointerTarget,
  onReady,
}: DeveloperWorkspaceProps) {
  const workspaceRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!workspaceRef.current) return

    const targetY = quality.pointerParallax ? pointerTarget[0] * 0.026 : 0
    const targetX = quality.pointerParallax ? -pointerTarget[1] * 0.018 : 0
    const targetOffset = quality.pointerParallax ? pointerTarget[0] * 0.055 : 0
    const idleOffset = quality.idleMotion ? Math.sin(clock.elapsedTime * 0.32) * 0.022 : 0

    workspaceRef.current.rotation.y += (targetY - workspaceRef.current.rotation.y) * 0.035
    workspaceRef.current.rotation.x += (targetX - workspaceRef.current.rotation.x) * 0.035
    workspaceRef.current.position.x += (targetOffset - workspaceRef.current.position.x) * 0.035
    workspaceRef.current.position.y = idleOffset
  })

  return (
    <group ref={workspaceRef} position={[0, 0, 0]}>
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

      <Monitor quality={quality} onReady={onReady} />
      <InterfaceModule quality={quality} />
      <DatabaseCore quality={quality} />
      <SystemNodes quality={quality} />
      <ConnectionPaths quality={quality} />
      <DataPoints quality={quality} />
    </group>
  )
}
