import { useCallback, useState } from 'react'
import type { HeroSceneTier } from '../components/media/heroSceneCapabilities.ts'
import {
  sceneQualityProfiles,
  type SceneQualityProfile,
} from '../three/quality/sceneQuality.ts'

export type SceneQualityReason =
  | 'capability-full'
  | 'capability-reduced'
  | 'device-budget'
  | 'performance-downgrade'
  | 'performance-static'

export interface SceneDeviceSignals {
  deviceMemory?: number
  hardwareConcurrency?: number
}

export interface SceneQualityState {
  profile: SceneQualityProfile
  reason: SceneQualityReason
}

type NavigatorWithDeviceMemory = Navigator & { deviceMemory?: number }

export function selectInitialSceneQuality(
  requestedTier: Exclude<HeroSceneTier, 'static'>,
  signals: SceneDeviceSignals,
): SceneQualityState {
  const constrainedDevice =
    (signals.deviceMemory !== undefined && signals.deviceMemory <= 4) ||
    (signals.hardwareConcurrency !== undefined && signals.hardwareConcurrency <= 4)

  if (requestedTier === 'reduced') {
    return {
      profile: sceneQualityProfiles.reduced,
      reason: 'capability-reduced',
    }
  }

  if (constrainedDevice) {
    return {
      profile: sceneQualityProfiles.reduced,
      reason: 'device-budget',
    }
  }

  return {
    profile: sceneQualityProfiles.full,
    reason: 'capability-full',
  }
}

export function resolveSceneQuality(
  requestedTier: Exclude<HeroSceneTier, 'static'>,
  signals: SceneDeviceSignals,
  performanceDrops: number,
): SceneQualityState {
  const initialQuality = selectInitialSceneQuality(requestedTier, signals)
  const startsReduced = initialQuality.profile.tier === 'reduced'
  const effectiveDrop = performanceDrops + (startsReduced ? 1 : 0)

  if (effectiveDrop >= 2) {
    return {
      profile: sceneQualityProfiles.static,
      reason: 'performance-static',
    }
  }

  if (effectiveDrop === 1) {
    return {
      profile: sceneQualityProfiles.reduced,
      reason: performanceDrops > 0
        ? 'performance-downgrade'
        : initialQuality.reason,
    }
  }

  return initialQuality
}

function readDeviceSignals(): SceneDeviceSignals {
  if (typeof navigator === 'undefined') return {}

  return {
    deviceMemory: (navigator as NavigatorWithDeviceMemory).deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
  }
}

export function useSceneQuality(
  requestedTier: Exclude<HeroSceneTier, 'static'>,
) {
  const [performanceDrops, setPerformanceDrops] = useState(0)
  const quality = resolveSceneQuality(
    requestedTier,
    readDeviceSignals(),
    performanceDrops,
  )

  const downgrade = useCallback(() => {
    setPerformanceDrops((current) => Math.min(2, current + 1))
  }, [])

  return { quality, downgrade }
}
