export type HeroSceneTier = 'full' | 'reduced' | 'static'

export type HeroSceneCapabilityReason =
  | 'scene-ready'
  | 'coarse-pointer'
  | 'reduced-motion'
  | 'save-data'
  | 'webgl-unavailable'

export interface HeroSceneSignals {
  reducedMotion: boolean
  coarsePointer: boolean
  saveData: boolean
  webGLAvailable: boolean
}

export interface HeroSceneCapability {
  tier: HeroSceneTier
  reason: HeroSceneCapabilityReason
  allowsScene: boolean
}

export function getHeroSceneCapability(
  signals: HeroSceneSignals,
): HeroSceneCapability {
  if (signals.reducedMotion) {
    return { tier: 'static', reason: 'reduced-motion', allowsScene: false }
  }

  if (signals.saveData) {
    return { tier: 'static', reason: 'save-data', allowsScene: false }
  }

  if (!signals.webGLAvailable) {
    return { tier: 'static', reason: 'webgl-unavailable', allowsScene: false }
  }

  if (signals.coarsePointer) {
    return { tier: 'reduced', reason: 'coarse-pointer', allowsScene: true }
  }

  return { tier: 'full', reason: 'scene-ready', allowsScene: true }
}
