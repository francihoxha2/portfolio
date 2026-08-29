import type { HeroSceneTier } from '../../components/media/heroSceneCapabilities.ts'

export interface SceneQualityProfile {
  tier: HeroSceneTier
  maxDpr: number
  particleCount: number
  shadows: boolean
  shadowMapSize: 512 | 1024
  pointerParallax: boolean
  idleMotion: boolean
  flowPulseCount: number
  motionScale: number
  updateRate: number
}

export const sceneQualityProfiles: Record<HeroSceneTier, SceneQualityProfile> = {
  full: {
    tier: 'full',
    maxDpr: 1.75,
    particleCount: 84,
    shadows: true,
    shadowMapSize: 1024,
    pointerParallax: true,
    idleMotion: true,
    flowPulseCount: 7,
    motionScale: 1,
    updateRate: 60,
  },
  reduced: {
    tier: 'reduced',
    maxDpr: 1.25,
    particleCount: 36,
    shadows: false,
    shadowMapSize: 512,
    pointerParallax: false,
    idleMotion: true,
    flowPulseCount: 3,
    motionScale: 0.42,
    updateRate: 24,
  },
  static: {
    tier: 'static',
    maxDpr: 1,
    particleCount: 0,
    shadows: false,
    shadowMapSize: 512,
    pointerParallax: false,
    idleMotion: false,
    flowPulseCount: 0,
    motionScale: 0,
    updateRate: 0,
  },
}
