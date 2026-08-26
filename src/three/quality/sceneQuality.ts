import type { HeroSceneTier } from '../../components/media/heroSceneCapabilities.ts'

export interface SceneQualityProfile {
  tier: HeroSceneTier
  maxDpr: number
  particleCount: number
  shadows: boolean
  shadowMapSize: 512 | 1024
  pointerParallax: boolean
  idleMotion: boolean
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
  },
  reduced: {
    tier: 'reduced',
    maxDpr: 1.25,
    particleCount: 36,
    shadows: false,
    shadowMapSize: 512,
    pointerParallax: false,
    idleMotion: true,
  },
  static: {
    tier: 'static',
    maxDpr: 1,
    particleCount: 0,
    shadows: false,
    shadowMapSize: 512,
    pointerParallax: false,
    idleMotion: false,
  },
}
